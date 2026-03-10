import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — no auth required
// Returns single active listing detail + more from same farm
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: listing, error } = await admin
    .from("listings")
    .select(
      `id, asking_price, photo_url, description, listed_at, farm_id,
       cattle(cattle_code, breed, teeth, current_weight, gender, coat_color),
       stations(station_name, station_tag, city),
       farms(id, farm_name, city)`
    )
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // Fetch more listings from same farm
  const { data: moreListing } = await admin
    .from("listings")
    .select("id, asking_price, photo_url, cattle(breed, current_weight)")
    .eq("farm_id", listing.farm_id)
    .eq("status", "active")
    .neq("id", id)
    .limit(3);

  return NextResponse.json({ listing, moreListing: moreListing ?? [] });
}
