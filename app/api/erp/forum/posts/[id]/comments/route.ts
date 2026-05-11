import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthors, resolveSingleAuthor } from "@/lib/forum-authors";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const MAX_REPLY_DEPTH = 8;

function parsePositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
    const parsed = Number.parseInt(value ?? "", 10);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
    const authorType = searchParams.get("author_type");
    const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
    const offset = (page - 1) * limit;
    const ascending = sort === "oldest";
    const shouldCountAllComments = authorType === "farm_user" || authorType === "buyer";

    const admin = createAdminClient();

    let rootQuery = admin
        .from("forum_comments")
        .select("id, content, created_at, parent_id, author_type, author_id", { count: "exact" })
        .eq("post_id", id)
        .is("parent_id", null)
        .order("created_at", { ascending });

    if (authorType === "farm_user" || authorType === "buyer") {
        rootQuery = rootQuery.eq("author_type", authorType);
    }

    const [{ data: rootComments, error: rootError, count: rootCount }, { count: totalCount, error: totalError }] = await Promise.all([
        rootQuery.range(offset, offset + limit - 1),
        shouldCountAllComments
            ? admin
                .from("forum_comments")
                .select("id", { count: "exact", head: true })
                .eq("post_id", id)
            : Promise.resolve({ count: 0, error: null }),
    ]);

    if (rootError) return NextResponse.json({ error: rootError.message }, { status: 500 });
    if (totalError) return NextResponse.json({ error: totalError.message }, { status: 500 });

    const comments = [...(rootComments ?? [])];
    const seen = new Set(comments.map(comment => comment.id));
    let parentIds = comments.map(comment => comment.id);

    for (let depth = 0; parentIds.length > 0 && depth < MAX_REPLY_DEPTH; depth += 1) {
        const { data: childComments, error } = await admin
            .from("forum_comments")
            .select("id, content, created_at, parent_id, author_type, author_id")
            .eq("post_id", id)
            .in("parent_id", parentIds)
            .order("created_at", { ascending });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        const nextChildren = (childComments ?? []).filter(comment => !seen.has(comment.id));
        for (const child of nextChildren) {
            seen.add(child.id);
            comments.push(child);
        }
        parentIds = nextChildren.map(comment => comment.id);
    }

    await resolveAuthors(admin, comments);

    return NextResponse.json({
        comments,
        total: rootCount ?? 0,
        allCommentsTotal: shouldCountAllComments ? (totalCount ?? 0) : (rootCount ?? 0),
        rootTotal: rootCount ?? 0,
        totalPages: Math.ceil((rootCount ?? 0) / limit),
        currentPage: page,
        limit,
        hasMore: page * limit < (rootCount ?? 0),
    });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: postId } = await params;
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const farmSession = request.headers.get("X-Farm-Session");
    const admin = createAdminClient();

    let userId: string | null = null;
    let authorType: "buyer" | "farm_user" = "buyer";

    if (accessToken) {
        const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
        if (!userError && userData?.user) {
            userId = userData.user.id;
            authorType = "buyer";
        }
    } else if (farmSession) {
        const { data: session } = await admin
            .from("farm_user_sessions")
            .select("farm_user_id")
            .eq("session_token", farmSession)
            .single();
        if (session) {
            userId = session.farm_user_id;
            authorType = "farm_user";
        }
    }

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { content, parentId } = body;

    if (!content?.trim()) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const { data: post } = await admin
        .from("forum_posts")
        .select("id, title, author_id, is_locked")
        .eq("id", postId)
        .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.is_locked) return NextResponse.json({ error: "This post is locked" }, { status: 403 });

    if (parentId) {
        const { data: parentComment } = await admin
            .from("forum_comments")
            .select("id, post_id")
            .eq("id", parentId)
            .single();

        if (!parentComment || parentComment.post_id !== postId) {
            return NextResponse.json({ error: "Parent comment not found" }, { status: 400 });
        }
    }

    const { data: comment, error } = await admin
        .from("forum_comments")
        .insert({
            post_id: postId,
            author_id: userId,
            author_type: authorType,
            content: content.trim(),
            parent_id: parentId || null,
        })
        .select("id, content, created_at, parent_id, author_type, author_id")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (comment) {
        (comment as any).author = await resolveSingleAuthor(admin, userId, authorType);
    }

    if (post.author_id !== userId) {
        try {
            const authorInfo = await resolveSingleAuthor(admin, userId, authorType);
            await admin.from("notifications").insert({
                farm_id: null,
                user_id: post.author_id,
                type: "info",
                severity: "info",
                title: "New reply on your post",
                message: `${authorInfo.full_name} replied to "${post.title}"`,
                link: `/forum/post/${postId}`,
            });
        } catch (_) {}
    }

    return NextResponse.json({ comment }, { status: 201 });
}
