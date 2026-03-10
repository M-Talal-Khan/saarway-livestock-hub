import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — no auth required
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_type, name, email, phone, message } = body;

        if (!user_type || !name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const admin = createAdminClient();
        const { error } = await admin
            .from("contact_messages")
            .insert({ user_type, name, email, phone: phone || null, message });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
