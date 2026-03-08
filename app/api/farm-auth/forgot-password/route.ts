import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ROLE_TO_DB: Record<string, string> = {
  Admin: "admin",
  Manager: "manager",
  Veterinarian: "vet",
  "Accounts Officer": "accounts",
  Worker: "worker",
};

export async function POST(request: NextRequest) {
  const { farmNumber, username, role } = await request.json();

  if (!farmNumber || !username || !role) {
    return NextResponse.json({ error: "Farm ID, username, and role are required." }, { status: 400 });
  }

  const dbRole = ROLE_TO_DB[role];
  if (!dbRole) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up the farm by farm_number
  const { data: farm, error: farmError } = await admin
    .from("farms")
    .select("id, is_active")
    .eq("farm_number", Number(farmNumber))
    .single();

  if (farmError || !farm) {
    return NextResponse.json({ error: "Farm not found." }, { status: 404 });
  }

  if (!farm.is_active) {
    return NextResponse.json({ error: "This farm account is suspended. Contact Saarway support." }, { status: 403 });
  }

  // Look up the farm_user
  const { data: farmUser, error: userError } = await admin
    .from("farm_users")
    .select("id")
    .eq("farm_id", farm.id)
    .eq("username", username)
    .eq("role", dbRole)
    .eq("is_active", true)
    .maybeSingle();

  if (userError || !farmUser) {
    return NextResponse.json({ error: "No matching user found for this Farm ID, username, and role." }, { status: 404 });
  }

  // Check for existing pending request
  const { data: existing } = await admin
    .from("password_reset_requests")
    .select("id")
    .eq("farm_user_id", farmUser.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A password reset request is already pending. The super admin will get back to you." },
      { status: 409 }
    );
  }

  const { error: insertError } = await admin.from("password_reset_requests").insert({
    farm_id: farm.id,
    farm_user_id: farmUser.id,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
