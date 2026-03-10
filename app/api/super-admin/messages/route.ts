import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ messages: data ?? [] });
}

export async function PATCH(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, status } = await request.json();
        if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

        const admin = createAdminClient();
        const { error } = await admin
            .from("contact_messages")
            .update({ status })
            .eq("id", id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
