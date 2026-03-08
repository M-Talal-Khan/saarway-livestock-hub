import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

const ROLE_TO_DB: Record<string, string> = {
  Admin: "admin",
  Manager: "manager",
  Veterinarian: "vet",
  "Accounts Officer": "accounts",
  Worker: "worker",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  // Verify the target user belongs to the same farm
  const { data: existing } = await admin
    .from("farm_users")
    .select("farm_id")
    .eq("id", id)
    .single();

  if (!existing || existing.farm_id !== session.farm_id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};

  if (body.fullName !== undefined) updates.full_name = body.fullName;
  if (body.stationId !== undefined) updates.station_id = body.stationId || null;
  if (body.isActive !== undefined) updates.is_active = body.isActive;

  if (body.role !== undefined) {
    const dbRole = ROLE_TO_DB[body.role];
    if (!dbRole) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    updates.role = dbRole;
  }

  if (body.password) {
    const { data: passwordHash, error: hashError } = await admin.rpc("hash_password", {
      p_password: body.password,
    });
    if (hashError) {
      return NextResponse.json({ error: "Password hashing failed" }, { status: 500 });
    }
    updates.password_hash = passwordHash;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await admin.from("farm_users").update(updates).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
