import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveSingleAuthor } from "@/lib/forum-authors";

function isAdminRole(role: string | null) {
    return role?.toLowerCase() === "admin";
}

async function getUserFromRequest(request: NextRequest) {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const farmSession = request.headers.get("X-Farm-Session");
    const admin = createAdminClient();

    if (accessToken) {
        const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
        if (!userError && userData?.user) {
            return { userId: userData.user.id, userType: "buyer", userRole: null as string | null };
        }
    }
    if (farmSession) {
        const { data: session } = await admin
            .from("farm_user_sessions")
            .select("farm_user_id, role")
            .eq("session_token", farmSession)
            .single();
        if (session) {
            return { userId: session.farm_user_id, userType: "farm_user", userRole: session.role ?? null };
        }
    }
    return { userId: null as string | null, userType: "buyer", userRole: null as string | null };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
        return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const { userId, userRole } = await getUserFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: existingComment } = await admin
        .from("forum_comments")
        .select("author_id, author_type")
        .eq("id", commentId)
        .single();

    if (!existingComment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const isOwner = existingComment.author_id === userId;
    const isAdmin = isAdminRole(userRole);

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await admin
        .from("forum_comments")
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq("id", commentId)
        .select(`id, content, created_at, parent_id, author_type, author_id`)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Resolve author for returned comment
    if (data) {
        (data as any).author = await resolveSingleAuthor(admin, data.author_id, data.author_type);
    }

    return NextResponse.json({ comment: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
    const { commentId } = await params;
    const { userId, userRole } = await getUserFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: comment } = await admin
        .from("forum_comments")
        .select("author_id, author_type")
        .eq("id", commentId)
        .single();

    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const isOwner = comment.author_id === userId;
    const isAdmin = isAdminRole(userRole);

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await admin.from("forum_comments").delete().eq("id", commentId);
    return NextResponse.json({ success: true });
}
