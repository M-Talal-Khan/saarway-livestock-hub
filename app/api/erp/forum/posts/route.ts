import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthors } from "@/lib/forum-authors";

// GET /api/erp/forum/posts — paginated post list with filters
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("q");
    const authorTypeFilter = searchParams.get("author_type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 15;
    const offset = (page - 1) * limit;

    const admin = createAdminClient();

    let query = admin
        .from("forum_posts")
        .select(`
            id, title, content, is_pinned, is_locked, view_count, author_type, author_id, created_at,
            category: forum_categories(id, name, slug, icon),
            comment_count: forum_comments(count),
            like_count: forum_post_likes(count)
        `, { count: "exact" })
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (categoryId) query = query.eq("category_id", categoryId);
    if (search) query = query.ilike("title", `%${search}%`);
    if (authorTypeFilter) query = query.eq("author_type", authorTypeFilter);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const posts = [...(data ?? [])];
    await resolveAuthors(admin, posts);

    return NextResponse.json({ posts, total: count ?? 0, page, limit });
}
