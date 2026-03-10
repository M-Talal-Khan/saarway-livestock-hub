import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — no auth required
// Returns farm detail with its active listings and stations
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [farmRes, stationsRes, listingsRes] = await Promise.all([
    admin
      .from("farms")
      .select("id, farm_name, city")
      .eq("id", id)
      .eq("is_active", true)
      .single(),
    admin
      .from("stations")
      .select("id, station_name, city")
      .eq("farm_id", id)
      .eq("is_active", true),
    admin
      .from("listings")
      .select("id, asking_price, photo_url, listed_at, cattle(breed, current_weight, gender, teeth)")
      .eq("farm_id", id)
      .eq("status", "active")
      .order("listed_at", { ascending: false }),
  ]);

  if (farmRes.error || !farmRes.data) {
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  }

  return NextResponse.json({
    farm: farmRes.data,
    stations: stationsRes.data ?? [],
    listings: listingsRes.data ?? [],
  });
}
