import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthors } from "@/lib/forum-authors";

export async function GET(request: NextRequest) {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const farmSession = request.headers.get("X-Farm-Session");
    const admin = createAdminClient();

    let userId: string | null = null;
    let userType = "buyer";

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

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await admin
        .from("forum_bookmarks")
        .select(`
            id, created_at, user_type, post_id,
            post:forum_posts!inner(
                id, title, content, view_count, author_type, author_id, created_at,
                category: forum_categories(id, name, slug, icon),
                comment_count: forum_comments(count),
                like_count: forum_post_likes(count)
            )
        `)
        .eq("user_id", userId)
        .eq("user_type", userType)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Resolve author names for bookmarked posts
    const bookmarks = data ?? [];
    const posts = bookmarks.map(bm => bm.post).filter(Boolean) as any[];
    await resolveAuthors(admin, posts);

    return NextResponse.json({ bookmarks });
}