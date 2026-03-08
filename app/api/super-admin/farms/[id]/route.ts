import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorized = await verifySuperAdminSession(request);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await request.json();

  if (!["suspend", "reactivate", "reset-password"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── Reset admin password ──
  if (action === "reset-password") {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 10; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));

    const { data: hashedPw, error: hashError } = await admin.rpc("hash_password", { p_password: password });
    if (hashError || !hashedPw) return NextResponse.json({ error: "Password hashing failed" }, { status: 500 });

    // Find the admin user for this farm
    const { data: adminUser, error: userError } = await admin
      .from("farm_users")
      .select("id, username")
      .eq("farm_id", id)
      .eq("role", "admin")
      .limit(1)
      .single();

    if (userError || !adminUser) return NextResponse.json({ error: "Admin user not found" }, { status: 404 });

    const { error: updateError } = await admin
      .from("farm_users")
      .update({ password_hash: hashedPw })
      .eq("id", adminUser.id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    // Also get farm_number for display
    const { data: farm } = await admin.from("farms").select("farm_number").eq("id", id).single();

    // Mark any pending reset requests for this farm as completed
    await admin
      .from("password_reset_requests")
      .update({ status: "completed" })
      .eq("farm_id", id)
      .eq("status", "pending");

    return NextResponse.json({ success: true, farmNumber: farm?.farm_number, username: adminUser.username, password });
  }

  const update =
    action === "suspend"
      ? { is_active: false, suspension_reason: reason ?? null, suspended_at: new Date().toISOString() }
      : { is_active: true, suspension_reason: null, suspended_at: null };

  const { data: farm, error: farmError } = await admin
    .from("farms")
    .update(update)
    .eq("id", id)
    .select("email")
    .single();

  if (farmError || !farm) return NextResponse.json({ error: farmError?.message ?? "Failed" }, { status: 500 });

  // On reactivation, auto-reject any pending requests for the same email
  if (action === "reactivate") {
    await admin
      .from("farm_registration_requests")
      .update({ status: "rejected" })
      .eq("email", farm.email)
      .eq("status", "pending");
  }

  return NextResponse.json({ success: true });
}
