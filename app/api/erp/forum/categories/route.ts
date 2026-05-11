import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/erp/forum/categories — public (no auth required)
export async function GET(request: NextRequest) {
    const admin = createAdminClient();

    const { data, error } = await admin
        .from("forum_categories")
        .select("id, name, slug, description, icon, sort_order")
        .eq("is_active", true)
        .order("sort_order");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ categories: data ?? [] });
}

// POST /api/erp/forum/categories — admin only (farm user auth)
export async function POST(request: NextRequest) {
    const farmSession = request.headers.get("X-Farm-Session");
    const admin = createAdminClient();

    let userId: string | null = null;
    let userRole: string | null = null;

    if (farmSession) {
        const { data: session } = await admin
            .from("farm_user_sessions")
            .select("farm_user_id, role")
            .eq("session_token", farmSession)
            .single();
        if (session) {
            userId = session.farm_user_id;
            userRole = session.role;
        }
    }

    if (!userId || userRole?.toLowerCase() !== "admin") {
        return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, icon, sortOrder } = body;

    if (!name?.trim() || !slug?.trim()) {
        return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const { data, error } = await admin
        .from("forum_categories")
        .insert({
            farm_id: null,
            name: name.trim(),
            slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
            description: description?.trim() || null,
            icon: icon || "MessageCircle",
            sort_order: sortOrder ?? 0,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ category: data }, { status: 201 });
}
