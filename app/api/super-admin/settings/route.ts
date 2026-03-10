import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data, error } = await admin
        .from("platform_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error && error.code !== "PGRST116") { // Ignore record not found to return defaults
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Default values if table is empty
    const settings = data || {
        sub_fee_per_animal: 50,
        list_fee_per_listing: 50,
        platform_name: "Saarway",
        contact_email: "info@saarway.com"
    };

    return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();

        // Extract fields
        const updates: Record<string, any> = {};
        if (body.subFee !== undefined) updates.sub_fee_per_animal = Number(body.subFee);
        if (body.listFee !== undefined) updates.list_fee_per_listing = Number(body.listFee);
        if (body.platformName !== undefined) updates.platform_name = body.platformName;
        if (body.contactEmail !== undefined) updates.contact_email = body.contactEmail;

        updates.updated_at = new Date().toISOString();

        const admin = createAdminClient();

        // Check if row exists first
        const { data: existing } = await admin.from("platform_settings").select("id").eq("id", 1).single();

        let error;
        if (existing) {
            const result = await admin.from("platform_settings").update(updates).eq("id", 1);
            error = result.error;
        } else {
            const result = await admin.from("platform_settings").insert({ id: 1, ...updates });
            error = result.error;
        }

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}
