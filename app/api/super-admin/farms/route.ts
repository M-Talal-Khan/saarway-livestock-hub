import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
  const authorized = await verifySuperAdminSession(request);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("farms")
    .select("id, farm_number, farm_name, owner_name, email, phone, city, is_active, suspension_reason, suspended_at, onboarded_at")
    .order("farm_number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flag farms with pending password reset requests
  const farmIds = (data ?? []).map((f) => f.id);
  const { data: resetRequests } = farmIds.length
    ? await admin
      .from("password_reset_requests")
      .select("farm_id")
      .in("farm_id", farmIds)
      .eq("status", "pending")
    : { data: [] };

  const farmsWithResets = new Set((resetRequests ?? []).map((r) => r.farm_id));

  const farms = (data ?? []).map((f) => ({
    ...f,
    passwordResetRequested: farmsWithResets.has(f.id),
  }));

  return NextResponse.json({ farms });
}
