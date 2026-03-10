import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    // Fetch all marketplace listings with cattle and farm info
    const { data: listings, error } = await admin
        .from("listings")
        .select("id, status, asking_price, listed_at, cattle(cattle_code, breed, teeth, current_weight), farms(farm_name)")
        .order("listed_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Fetch farm breakdown: per-farm listing count and active status
    const { data: farms } = await admin
        .from("farms")
        .select("id, farm_name, is_active")
        .eq("is_active", true);

    const farmListingCounts = new Map<string, number>();
    (listings ?? []).forEach((l) => {
        const fn = (l.farms as unknown as { farm_name: string })?.farm_name ?? "Unknown";
        if (l.status === "active") farmListingCounts.set(fn, (farmListingCounts.get(fn) ?? 0) + 1);
    });

    const farmBreakdown = (farms ?? []).map((f) => ({
        id: f.id,
        name: f.farm_name,
        listings: farmListingCounts.get(f.farm_name) ?? 0,
    }));

    const formattedListings = (listings ?? []).map((l) => {
        const cattle = l.cattle as unknown as { cattle_code: string; breed: string; teeth: number; current_weight: number } | null;
        const farm = l.farms as unknown as { farm_name: string } | null;
        return {
            id: l.id,
            animal: cattle ? `${cattle.breed}, ${cattle.teeth} teeth, ${cattle.current_weight}kg` : "—",
            farm: farm?.farm_name ?? "—",
            price: l.asking_price,
            date: new Date(l.listed_at).toLocaleDateString("en-PK"),
            status: l.status === "active" ? "Active" : l.status === "sold" ? "Sold" : "Inactive",
        };
    });

    return NextResponse.json({ listings: formattedListings, farmBreakdown });
}
