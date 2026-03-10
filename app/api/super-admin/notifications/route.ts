import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";

// Super admin uses Supabase Auth, not farm session
async function verifySuperAdmin(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    if (user.app_metadata?.role !== "super_admin") return null;
    return user;
}

export async function GET(request: NextRequest) {
    const user = await verifySuperAdmin(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("notifications")
        .select("id, type, severity, title, message, link, is_read, created_at")
        .eq("super_admin", true)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notifications: data ?? [] });
}

export async function PATCH(request: NextRequest) {
    const user = await verifySuperAdmin(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    const admin = createAdminClient();
    await admin.from("notifications").update({ is_read: true }).eq("id", id).eq("super_admin", true);

    return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
    const user = await verifySuperAdmin(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all");

    const admin = createAdminClient();

    if (all === "true") {
        await admin.from("notifications").delete().eq("super_admin", true);
    } else if (id) {
        await admin.from("notifications").delete().eq("id", id).eq("super_admin", true);
    }

    return NextResponse.json({ ok: true });
}
