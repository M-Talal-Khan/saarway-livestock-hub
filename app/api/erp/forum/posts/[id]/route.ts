import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthors } from "@/lib/forum-authors";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

function isAdminRole(role: string | null) {
    return role?.toLowerCase() === "admin";
}

async function resolveUser(request: NextRequest, admin: SupabaseAdmin) {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const farmSession = request.headers.get("X-Farm-Session");

    let userId: string | null = null;
    let userType: "buyer" | "farm_user" = "buyer";
    let userRole: string | null = null;

    if (accessToken) {
        const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
        if (!userError && userData?.user) {
            userId = userData.user.id;
            userType = "buyer";
        }
    } else if (farmSession) {
        const { data: session } = await admin
            .from("farm_user_sessions")
            .select("farm_user_id, role")
            .eq("session_token", farmSession)
            .single();
        if (session) {
            userId = session.farm_user_id;
            userType = "farm_user";
            userRole = session.role ?? null;
        }
    }

    return { userId, userType, userRole };
}

async function fetchSuggestedPosts(admin: SupabaseAdmin, currentPostId: string) {
    const { data } = await admin
        .from("forum_posts")
        .select(`
            id, title, created_at, view_count, author_type, author_id,
            category: forum_categories(id, name, slug, icon),
            comment_count: forum_comments(count),
            like_count: forum_post_likes(count)
        `)
        .neq("id", currentPostId)
        .order("view_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

    const posts = [...(data ?? [])];
    await resolveAuthors(admin, posts);
    return posts;
}

// GET /api/erp/forum/posts/[id] - post detail without loading the full comment thread.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const admin = createAdminClient();
    const { userId, userType } = await resolveUser(request, admin);

    const { data, error } = await admin
        .from("forum_posts")
        .select(`
            id, title, content, is_pinned, is_locked, view_count, author_type, author_id, created_at, updated_at, category_id,
            category: forum_categories(id, name, slug, icon),
            comment_count: forum_comments(count)
        `)
        .eq("id", id)
        .single();

    if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Keep the detail endpoint light: comments are loaded through the paginated comments route.
    admin.rpc("increment_view_count", { post_id: id }).then(() => null, () => null);

    const [, likeCountRes, likedRes, bookmarksRes, trendingPosts, totalPostsRes, userLikesRes, userSavedRes] = await Promise.all([
        resolveAuthors(admin, [data]),
        admin.from("forum_post_likes").select("id", { count: "exact", head: true }).eq("post_id", id),
        userId
            ? admin
                .from("forum_post_likes")
                .select("id")
                .eq("post_id", id)
                .eq("user_id", userId)
                .eq("user_type", userType)
                .limit(1)
            : Promise.resolve({ data: [] as any[] }),
        userId
            ? admin
                .from("forum_bookmarks")
                .select("id")
                .eq("post_id", id)
                .eq("user_id", userId)
                .eq("user_type", userType)
                .limit(1)
            : Promise.resolve({ data: [] as any[] }),
        fetchSuggestedPosts(admin, id),
        admin.from("forum_posts").select("id", { count: "exact", head: true }),
        userId
            ? admin.from("forum_post_likes").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("user_type", userType)
            : Promise.resolve({ count: 0 }),
        userId
            ? admin.from("forum_bookmarks").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("user_type", userType)
            : Promise.resolve({ count: 0 }),
    ]);

    return NextResponse.json({
        post: {
            ...data,
            view_count: (data.view_count ?? 0) + 1,
        },
        liked: (likedRes.data?.length ?? 0) > 0,
        likeCount: likeCountRes.count ?? 0,
        bookmarked: (bookmarksRes.data?.length ?? 0) > 0,
        userId,
        userType,
        trendingPosts,
        communityStats: {
            totalPosts: totalPostsRes.count ?? 0,
            userLikes: userLikesRes.count ?? 0,
            userSaved: userSavedRes.count ?? 0,
        },
    });
}

// PATCH /api/erp/forum/posts/[id] - update post (owner or admin).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const admin = createAdminClient();
    const { userId, userRole } = await resolveUser(request, admin);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, categoryId, isPinned, isLocked } = body;

    const { data: post } = await admin
        .from("forum_posts")
        .select("author_id, author_type")
        .eq("id", id)
        .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const isOwner = post.author_id === userId;
    const isAdmin = isAdminRole(userRole);

    if (isPinned !== undefined || isLocked !== undefined) {
        if (!isAdmin) {
            return NextResponse.json({ error: "Admin only" }, { status: 403 });
        }

        const adminUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (isPinned !== undefined) adminUpdates.is_pinned = isPinned;
        if (isLocked !== undefined) adminUpdates.is_locked = isLocked;

        const { data, error } = await admin
            .from("forum_posts")
            .update(adminUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ post: data });
    }

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (categoryId !== undefined) updates.category_id = categoryId;

    const { data, error } = await admin
        .from("forum_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
}

// DELETE /api/erp/forum/posts/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const admin = createAdminClient();
    const { userId, userRole } = await resolveUser(request, admin);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: post } = await admin.from("forum_posts").select("author_id").eq("id", id).single();
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const isOwner = post.author_id === userId;
    const isAdmin = isAdminRole(userRole);

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await admin.from("forum_posts").delete().eq("id", id);
    return NextResponse.json({ success: true });
}
