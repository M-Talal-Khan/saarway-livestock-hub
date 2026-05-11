import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";
import { calculateMarketplaceTrustScore, createTrustHistory } from "@/lib/marketplace-trust";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("listings")
    .select(`id, asking_price, photo_url, description, status, listing_fee_paid, listed_at, cattle_id, station_id, cattle(cattle_code, breed, teeth, current_weight, gender, coat_color, purchase_price), stations(station_name, station_tag)`)
    .eq("farm_id", session.farm_id)
    .order("listed_at", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const [{ data, error }, { data: farm }] = await Promise.all([
    query,
    admin
      .from("farms")
      .select("id, is_active, onboarded_at")
      .eq("id", session.farm_id)
      .single(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    listings: data ?? [],
    trust_score: calculateMarketplaceTrustScore({
      farm,
      history: createTrustHistory(data ?? []),
    }),
  });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { cattleId, askingPrice, description, photoUrls } = body;

  if (!cattleId || !askingPrice) {
    return NextResponse.json({ error: "Cattle and asking price are required" }, { status: 400 });
  }

  // Validate photoUrls if provided
  const validatedUrls: string[] = Array.isArray(photoUrls)
    ? photoUrls.filter((u: unknown) => typeof u === "string" && u.startsWith("http")).slice(0, 3)
    : [];
  const photoUrlValue = validatedUrls.length > 0
    ? (validatedUrls.length === 1 ? validatedUrls[0] : JSON.stringify(validatedUrls))
    : null;

  const admin = createAdminClient();

  // Verify cattle belongs to farm and is ready_for_sale
  const { data: cattle } = await admin
    .from("cattle")
    .select("id, station_id, status")
    .eq("id", cattleId)
    .eq("farm_id", session.farm_id)
    .single();

  if (!cattle) return NextResponse.json({ error: "Cattle not found" }, { status: 404 });

  // Block animals that are no longer on the farm
  if (["sold", "slaughtered", "dead"].includes(cattle.status)) {
    return NextResponse.json({ error: "Cannot list an animal that has been sold, slaughtered, or is dead" }, { status: 400 });
  }

  // DB trigger requires cattle status = ready_for_sale before listing — promote if needed
  if (!["ready_for_sale", "listed"].includes(cattle.status)) {
    await admin.from("cattle").update({ status: "ready_for_sale" }).eq("id", cattleId).eq("farm_id", session.farm_id);
  }

  // Remove any previous inactive listings for this cattle (removed/sold) to avoid unique-constraint errors
  await admin
    .from("listings")
    .delete()
    .eq("farm_id", session.farm_id)
    .eq("cattle_id", cattleId)
    .in("status", ["removed", "sold"]);

  const { data, error } = await admin
    .from("listings")
    .insert({
      farm_id: session.farm_id,
      station_id: cattle.station_id,
      cattle_id: cattleId,
      asking_price: Number(askingPrice),
      description: description || null,
      photo_url: photoUrlValue,
      status: "active",
      listing_fee_paid: false,
      listed_by: session.farm_user_id,
    })
    .select("id, asking_price, status, listed_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark cattle as listed
  await admin.from("cattle").update({ status: "listed" }).eq("id", cattleId).eq("farm_id", session.farm_id);

  return NextResponse.json({ listing: data }, { status: 201 });
}
