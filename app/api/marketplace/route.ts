import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateMarketplaceTrustScore, createTrustHistory, emptyTrustHistory } from "@/lib/marketplace-trust";

// Public endpoint — no auth required
// Returns all active marketplace listings with cattle + station + farm info
export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("listings")
    .select(
      `id, asking_price, photo_url, description, listed_at, listing_fee_paid,
       cattle(cattle_code, breed, teeth, current_weight, gender, coat_color),
       stations(station_name, station_tag, city),
       farms(id, farm_name, city, is_active, onboarded_at)`
    )
    .eq("status", "active")
    .order("listed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const listings = data ?? [];
  const farmIds = [...new Set(listings.map((listing: any) => listing.farms?.id).filter(Boolean))];
  const { data: historyRows } = farmIds.length
    ? await admin
        .from("listings")
        .select("farm_id, status, listing_fee_paid, photo_url, description")
        .in("farm_id", farmIds)
    : { data: [] };

  const historyByFarm = new Map<string, ReturnType<typeof createTrustHistory>>();
  for (const farmId of farmIds) {
    historyByFarm.set(
      farmId,
      createTrustHistory((historyRows ?? []).filter((row: any) => row.farm_id === farmId))
    );
  }

  const listingsWithTrust = listings.map((listing: any) => {
    const farmId = listing.farms?.id;
    return {
      ...listing,
      trust_score: calculateMarketplaceTrustScore({
        farm: listing.farms,
        listing,
        history: farmId ? historyByFarm.get(farmId) ?? emptyTrustHistory : emptyTrustHistory,
      }),
    };
  });

  return NextResponse.json({ listings: listingsWithTrust });
}
