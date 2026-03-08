import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export interface FarmSession {
  farm_user_id: string;
  farm_id: string;
  role: string;
}

export async function verifyFarmSession(
  request: NextRequest
): Promise<FarmSession | null> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("farm_user_sessions")
    .select("farm_user_id, farm_id, role")
    .eq("session_token", token)
    .single();

  return data ?? null;
}
