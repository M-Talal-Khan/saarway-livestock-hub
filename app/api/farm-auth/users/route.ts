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

const DB_TO_ROLE: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  vet: "Veterinarian",
  accounts: "Accounts Officer",
  worker: "Worker",
};

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("farm_users")
    .select("id, username, full_name, role, is_active, station_id, stations(station_tag, station_name)")
    .eq("farm_id", session.farm_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = (data as any[]).map((u) => ({
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    role: DB_TO_ROLE[u.role] ?? u.role,
    stationId: u.station_id,
    stationName: u.stations ? `${u.stations.station_tag} — ${u.stations.station_name}` : "All Stations",
    isActive: u.is_active,
  }));

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, fullName, role, stationId, password } = await request.json();

  if (!username || !fullName || !role || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const dbRole = ROLE_TO_DB[role];
  if (!dbRole) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const admin = createAdminClient();

  // Hash password via pgcrypto DB function
  const { data: passwordHash, error: hashError } = await admin.rpc("hash_password", {
    p_password: password,
  });
  if (hashError) {
    return NextResponse.json({ error: "Password hashing failed" }, { status: 500 });
  }

  const { data, error } = await admin
    .from("farm_users")
    .insert({
      farm_id: session.farm_id,
      username,
      full_name: fullName,
      role: dbRole,
      station_id: stationId || null,
      password_hash: passwordHash,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Username already exists in this farm" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
