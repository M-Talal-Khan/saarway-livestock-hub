import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Check if there's already a pending request from this user
  const { data: existing } = await admin
    .from("password_reset_requests")
    .select("id")
    .eq("farm_user_id", session.farm_user_id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already have a pending password reset request." },
      { status: 409 }
    );
  }

  const { error } = await admin.from("password_reset_requests").insert({
    farm_id: session.farm_id,
    farm_user_id: session.farm_user_id,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
