import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: postId } = await params;
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

    const { data: existing } = await admin
        .from("forum_post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .eq("user_type", userType)
        .single();

    if (existing) {
        await admin.from("forum_post_likes").delete().eq("id", existing.id);
        return NextResponse.json({ liked: false });
    } else {
        await admin.from("forum_post_likes").insert({ post_id: postId, user_id: userId, user_type: userType });
        return NextResponse.json({ liked: true }, { status: 201 });
    }
}
