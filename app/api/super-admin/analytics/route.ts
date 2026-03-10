import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const [farmsRes, listingsRes, cattleRes] = await Promise.all([
        admin.from("farms").select("id, farm_name, onboarded_at, is_active"),
        admin.from("listings").select("id, status, listed_at, farms(farm_name)"),
        admin.from("cattle").select("id, breed, farm_id, farms(farm_name)"),
    ]);

    const farms = farmsRes.data ?? [];
    const listings = listingsRes.data ?? [];
    const cattle = cattleRes.data ?? [];

    // Farm growth by month (based on onboarded_at)
    const growthMap = new Map<string, number>();
    farms.forEach((f) => {
        if (f.onboarded_at) {
            const d = new Date(f.onboarded_at);
            const key = `${d.toLocaleString("en-US", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
            growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
        }
    });
    const farmGrowthData = [...growthMap.entries()].map(([month, farms]) => ({ month, farms }));

    // Listing trends by month
    const createdMap = new Map<string, number>();
    const removedMap = new Map<string, number>();
    listings.forEach((l) => {
        const d = new Date(l.listed_at);
        const key = d.toLocaleString("en-US", { month: "short" });
        createdMap.set(key, (createdMap.get(key) ?? 0) + 1);
        if (l.status !== "active") removedMap.set(key, (removedMap.get(key) ?? 0) + 1);
    });
    const months = [...new Set([...createdMap.keys(), ...removedMap.keys()])];
    const listingTrendsData = months.map((month) => ({
        month,
        created: createdMap.get(month) ?? 0,
        removed: removedMap.get(month) ?? 0,
    }));

    // Most active farms by listing count
    const farmListings = new Map<string, number>();
    listings.forEach((l) => {
        const fn = (l.farms as unknown as { farm_name: string })?.farm_name ?? "Unknown";
        farmListings.set(fn, (farmListings.get(fn) ?? 0) + 1);
    });
    const mostActiveFarmsData = [...farmListings.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([farm, listings]) => ({ farm, listings }));

    // Breed popularity
    const breedMap = new Map<string, number>();
    cattle.forEach((c) => {
        breedMap.set(c.breed, (breedMap.get(c.breed) ?? 0) + 1);
    });
    const breedPopularityData = [...breedMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([breed, count]) => ({ breed, count }));

    return NextResponse.json({ farmGrowthData, listingTrendsData, mostActiveFarmsData, breedPopularityData });
}
