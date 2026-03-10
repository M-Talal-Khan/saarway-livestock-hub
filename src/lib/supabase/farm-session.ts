import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export interface FarmSession {
  farm_user_id: string;
  farm_id: string;
  role: string;          // DB enum: admin | manager | vet | accounts | worker
  station_id: string | null;
}

export async function verifyFarmSession(
  request: NextRequest
): Promise<FarmSession | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("farm_user_sessions")
    .select("farm_user_id, farm_id, role, station_id, expires_at")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) return null;
  return {
    farm_user_id: data.farm_user_id,
    farm_id: data.farm_id,
    role: data.role,
    station_id: data.station_id ?? null,
  };
}

// Returns a station filter clause for queries.
// Admin & Accounts see all stations; Manager/Worker/Vet are locked to their station.
export function stationFilter(session: FarmSession): { station_id: string } | Record<string, never> {
  if (session.role === "admin" || session.role === "accounts") return {};
  if (session.station_id) return { station_id: session.station_id };
  return {};
}
