import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthors } from "@/lib/forum-authors";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

function parsePositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
    const parsed = Number.parseInt(value ?? "", 10);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
}

function safeSearchTerm(value: string | null) {
    return value?.trim().replace(/,/g, " ") ?? "";
}

// Helper: resolve user from auth headers. Forum listing is public, so null is valid.
async function resolveUser(request: NextRequest, admin: SupabaseAdmin) {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const farmSession = request.headers.get("X-Farm-Session");
    let userId: string | null = null;
    let userType: "buyer" | "farm_user" = "buyer";

    if (accessToken) {
        const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
        if (!userError && userData?.user) {
            userId = userData.user.id;
            userType = "buyer";
        }
    } else if (farmSession) {
        const { data: session } = await admin
            .from("farm_user_sessions")
            .select("farm_user_id")
            .eq("session_token", farmSession)
            .single();
        if (session) {
            userId = session.farm_user_id;
            userType = "farm_user";
        }
    }

    return { userId, userType };
}

async function fetchUserPostFlags(admin: SupabaseAdmin, userId: string | null, userType: string) {
    if (!userId) return { likedPostIds: [] as string[], savedPostIds: [] as string[] };

    const [likedRes, savedRes] = await Promise.all([
        admin.from("forum_post_likes").select("post_id").eq("user_id", userId).eq("user_type", userType),
        admin.from("forum_bookmarks").select("post_id").eq("user_id", userId).eq("user_type", userType),
    ]);

    return {
        likedPostIds: (likedRes.data ?? []).map(row => row.post_id),
        savedPostIds: (savedRes.data ?? []).map(row => row.post_id),
    };
}

async function fetchTrendingPosts(admin: SupabaseAdmin) {
    const { data } = await admin
        .from("forum_posts")
        .select(`
            id, title, created_at, view_count, author_type, author_id,
            category: forum_categories(id, name, slug, icon),
            comment_count: forum_comments(count),
            like_count: forum_post_likes(count)
        `)
        .order("view_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

    const posts = [...(data ?? [])];
    await resolveAuthors(admin, posts);
    return posts.slice(0, 5);
}

function forumResponse(payload: {
    categories: any[];
    posts: any[];
    total: number;
    page: number;
    limit: number;
    likedPostIds: string[];
    savedPostIds: string[];
    trendingPosts: any[];
}) {
    return NextResponse.json({
        ...payload,
        hasMore: payload.page * payload.limit < payload.total,
    });
}

// GET /api/erp/forum - list categories + paginated posts.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const authorTypeFilter = searchParams.get("author_type");
    const search = safeSearchTerm(searchParams.get("q"));
    const sort = searchParams.get("sort");
    const categoryId = searchParams.get("category");
    const tab = searchParams.get("tab");
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
    const offset = (page - 1) * limit;

    const admin = createAdminClient();
    const { userId, userType } = await resolveUser(request, admin);

    const [{ data: categories, error: catError }, flags, trendingPosts] = await Promise.all([
        admin
            .from("forum_categories")
            .select("id, name, slug, description, icon, sort_order")
            .eq("is_active", true)
            .order("sort_order"),
        fetchUserPostFlags(admin, userId, userType),
        fetchTrendingPosts(admin),
    ]);

    if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

    if ((tab === "mine" || tab === "liked" || tab === "saved") && !userId) {
        return forumResponse({
            categories: categories ?? [],
            posts: [],
            total: 0,
            page,
            limit,
            likedPostIds: [],
            savedPostIds: [],
            trendingPosts,
        });
    }

    const filterPostIds = tab === "liked"
        ? flags.likedPostIds
        : tab === "saved"
            ? flags.savedPostIds
            : null;

    if (filterPostIds && filterPostIds.length === 0) {
        return forumResponse({
            categories: categories ?? [],
            posts: [],
            total: 0,
            page,
            limit,
            likedPostIds: flags.likedPostIds,
            savedPostIds: flags.savedPostIds,
            trendingPosts,
        });
    }

    let postsQuery = admin
        .from("forum_posts")
        .select(`
            id, title, content, is_pinned, is_locked, view_count, created_at, author_type, author_id,
            category: forum_categories(id, name, slug, icon),
            comment_count: forum_comments(count),
            like_count: forum_post_likes(count)
        `, { count: "exact" })
        .order("is_pinned", { ascending: false });

    if (sort === "popular") {
        postsQuery = postsQuery.order("view_count", { ascending: false }).order("created_at", { ascending: false });
    } else {
        postsQuery = postsQuery.order("created_at", { ascending: false });
    }

    if (search) postsQuery = postsQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    if (authorTypeFilter) postsQuery = postsQuery.eq("author_type", authorTypeFilter);
    if (categoryId) postsQuery = postsQuery.eq("category_id", categoryId);
    if (tab === "mine" && userId) {
        postsQuery = postsQuery.eq("author_id", userId).eq("author_type", userType);
    }
    if (filterPostIds) postsQuery = postsQuery.in("id", filterPostIds);

    const { data: posts, error: postsError, count } = await postsQuery.range(offset, offset + limit - 1);
    if (postsError) return NextResponse.json({ error: postsError.message }, { status: 500 });

    const postsList = [...(posts ?? [])];
    await resolveAuthors(admin, postsList);

    return forumResponse({
        categories: categories ?? [],
        posts: postsList,
        total: count ?? 0,
        page,
        limit,
        likedPostIds: flags.likedPostIds,
        savedPostIds: flags.savedPostIds,
        trendingPosts,
    });
}

// POST /api/erp/forum - create a post.
export async function POST(request: NextRequest) {
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
        const { data: session, error: sessionError } = await admin
            .from("farm_user_sessions")
            .select("farm_user_id")
            .eq("session_token", farmSession)
            .single();
        if (!sessionError && session) {
            userId = session.farm_user_id;
            authorType = "farm_user";
        }
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, categoryId } = body;

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const { data, error } = await admin
        .from("forum_posts")
        .insert({
            farm_id: null,
            author_id: userId,
            author_type: authorType,
            title: title.trim(),
            content: content.trim(),
            category_id: categoryId || null,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ post: data }, { status: 201 });
}
