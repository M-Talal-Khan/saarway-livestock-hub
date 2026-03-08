import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function verifySuperAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return false;

  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return false;

  return user.app_metadata?.role === "super_admin";
}
