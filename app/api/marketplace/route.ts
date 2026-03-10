import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — no auth required
// Returns all active marketplace listings with cattle + station + farm info
export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("listings")
    .select(
      `id, asking_price, photo_url, description, listed_at,
       cattle(cattle_code, breed, teeth, current_weight, gender, coat_color),
       stations(station_name, station_tag, city),
       farms(id, farm_name, city)`
    )
    .eq("status", "active")
    .order("listed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}
