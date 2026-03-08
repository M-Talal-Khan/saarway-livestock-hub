import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
  const authorized = await verifySuperAdminSession(request);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("farm_registration_requests")
    .select("id, farm_name, owner_name, phone, email, city, approx_stations, description, status")
    .order("id", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check which emails already exist in farms to flag duplicates / suspended re-applicants
  const emails = (data ?? []).map((r) => r.email);
  const { data: existingFarms } = emails.length
    ? await admin.from("farms").select("email, is_active").in("email", emails)
    : { data: [] };

  const activeEmails = new Set((existingFarms ?? []).filter((f) => f.is_active).map((f) => f.email));
  const suspendedEmails = new Set((existingFarms ?? []).filter((f) => !f.is_active).map((f) => f.email));

  const requests = (data ?? []).map((r) => ({
    ...r,
    duplicateStatus: activeEmails.has(r.email)
      ? "active"
      : suspendedEmails.has(r.email)
      ? "suspended"
      : null,
  }));

  return NextResponse.json({ requests });
}
