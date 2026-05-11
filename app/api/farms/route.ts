import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateMarketplaceTrustScore, createTrustHistory } from "@/lib/marketplace-trust";

// Public endpoint — no auth required
// Returns all active farms that have at least one active marketplace listing
export async function GET() {
  const admin = createAdminClient();

  const [farmsRes, listingsRes] = await Promise.all([
    admin
      .from("farms")
      .select("id, farm_name, city, is_active, onboarded_at")
      .eq("is_active", true)
      .order("farm_name", { ascending: true }),
    admin.from("listings").select("farm_id, status, listing_fee_paid, photo_url, description"),
  ]);

  if (farmsRes.error) return NextResponse.json({ error: farmsRes.error.message }, { status: 500 });

  // Count active listings per farm
  const countMap = new Map<string, number>();
  (listingsRes.data ?? []).filter((l) => l.status === "active").forEach((l) => {
    countMap.set(l.farm_id, (countMap.get(l.farm_id) ?? 0) + 1);
  });

  const farms = (farmsRes.data ?? [])
    .map((f) => ({
      ...f,
      activeListings: countMap.get(f.id) ?? 0,
      trust_score: calculateMarketplaceTrustScore({
        farm: f,
        history: createTrustHistory((listingsRes.data ?? []).filter((listing) => listing.farm_id === f.id)),
      }),
    }))
    ;

  return NextResponse.json({ farms });
}
