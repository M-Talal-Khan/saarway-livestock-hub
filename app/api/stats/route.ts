import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint — no auth required
// Returns platform-level stats for the homepage
export async function GET() {
  const admin = createAdminClient();

  const [farmsRes, cattleRes, listingsRes] = await Promise.all([
    admin.from("farms").select("id, city", { count: "exact" }).eq("is_active", true),
    admin.from("cattle").select("breed", { count: "exact" }),
    admin.from("listings").select("id", { count: "exact" }).eq("status", "active"),
  ]);

  const farmCount   = farmsRes.count ?? 0;
  const animalCount = listingsRes.count ?? 0;

  // Unique cities
  const citySet = new Set<string>();
  (farmsRes.data ?? []).forEach(f => { if (f.city) citySet.add(f.city.trim()); });
  const cityCount = citySet.size;

  // Unique breeds
  const breedSet = new Set<string>();
  (cattleRes.data ?? []).forEach(c => { if (c.breed) breedSet.add(c.breed.trim()); });
  const breedCount = breedSet.size;

  return NextResponse.json({ farmCount, animalCount, cityCount, breedCount });
}
