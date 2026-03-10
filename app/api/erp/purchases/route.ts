import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("purchases")
    .select(`id, supplier_name, supplier_place, purchase_date, animal_count, transport_cost, total_amount, is_finalised, notes, station_id, stations(station_name, station_tag)`)
    .eq("farm_id", session.farm_id)
    .order("created_at", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ purchases: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { stationId, supplierName, supplierPlace, purchaseDate, transportCost, animals } = body;

  if (!stationId || !supplierName || !supplierPlace || !purchaseDate || !Array.isArray(animals) || animals.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const animalTotal = animals.reduce((sum: number, a: { price: number }) => sum + Number(a.price), 0);
  const transport = Number(transportCost) || 0;
  const totalAmount = animalTotal + transport;

  // Create purchase record
  const { data: purchase, error: purchaseError } = await admin
    .from("purchases")
    .insert({
      farm_id: session.farm_id,
      station_id: stationId,
      supplier_name: supplierName,
      supplier_place: supplierPlace,
      purchase_date: purchaseDate,
      animal_count: animals.length,
      transport_cost: transport,
      total_amount: totalAmount,
      is_finalised: false,
      recorded_by: session.farm_user_id,
    })
    .select("id")
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: purchaseError?.message ?? "Failed to create purchase" }, { status: 500 });
  }

  // Insert each animal as cattle
  const cattleRows = animals.map((a: { breed: string; teeth: number; weight: number; gender: string; price: number }) => ({
    farm_id: session.farm_id,
    station_id: stationId,
    purchase_id: purchase.id,
    breed: a.breed,
    teeth: Number(a.teeth),
    initial_weight: Number(a.weight),
    current_weight: Number(a.weight),
    gender: String(a.gender).toLowerCase(),
    purchase_price: Number(a.price),
    purchase_date: purchaseDate,
    status: "active",
    created_by: session.farm_user_id,
  }));

  // Manually generate cattle_code in the format `F00X-YYYY` 
  // Fetch all existing cattle codes for this farm to find the absolute numeric maximum
  const { data: existingCattle, error: cattleErr } = await admin
    .from("cattle")
    .select("cattle_code")
    .eq("farm_id", session.farm_id)
    .neq("cattle_code", "")
    .not("cattle_code", "is", null);

  if (cattleErr) {
    await admin.from("purchases").delete().eq("id", purchase.id);
    return NextResponse.json({ error: "Failed to read existing cattle codes" }, { status: 500 });
  }

  let farmPrefix = "F001"; // Default
  let maxCattleNum = 0;

  if (existingCattle && existingCattle.length > 0) {
    existingCattle.forEach((c) => {
      if (c.cattle_code) {
        const parts = c.cattle_code.split("-");
        if (parts.length === 2) {
          farmPrefix = parts[0]; // Assume first string is prefix
          const parsedNum = parseInt(parts[1], 10);
          if (!isNaN(parsedNum) && parsedNum > maxCattleNum) {
            maxCattleNum = parsedNum;
          }
        }
      }
    });
  }

  let nextCattleNum = maxCattleNum + 1;

  const cattleData: { id: string }[] = [];
  for (const row of cattleRows) {
    const generatedCode = `${farmPrefix}-${String(nextCattleNum).padStart(4, "0")}`;
    const { data: c, error: cErr } = await admin
      .from("cattle")
      .insert({ ...row, cattle_code: generatedCode })
      .select("id")
      .single();

    if (cErr) {
      // Rollback purchase
      await admin.from("purchases").delete().eq("id", purchase.id);
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }

    if (c) cattleData.push(c);
    nextCattleNum++; // Increment for the next animal in the batch
  }

  // Link cattle to purchase via purchase_animals
  const linkRows = (cattleData ?? []).map((c: { id: string }) => ({
    purchase_id: purchase.id,
    cattle_id: c.id,
    farm_id: session.farm_id,
  }));
  await admin.from("purchase_animals").insert(linkRows);

  // Finalize purchase
  await admin.from("purchases").update({ is_finalised: true, total_amount: totalAmount }).eq("id", purchase.id);

  // Post expense to Finance
  await admin.from("transactions").insert({
    farm_id: session.farm_id,
    station_id: stationId,
    type: "expense",
    category: "cattle_purchase",
    amount: totalAmount,
    description: `Purchase from ${supplierName} (${supplierPlace}) — ${animals.length} animal(s)`,
    transaction_date: purchaseDate,
    recorded_by: session.farm_user_id,
  });

  // Notify farm admins about the purchase
  await admin.from("notifications").insert({
    farm_id: session.farm_id,
    user_id: null, // broadcast to all farm users
    type: "purchase",
    severity: "info",
    title: "New Purchase",
    message: `${animals.length} animal(s) purchased from ${supplierName} (${supplierPlace}) — PKR ${totalAmount.toLocaleString()}`,
    link: "/erp/buying",
  });

  return NextResponse.json({ purchase: { id: purchase.id, totalAmount } }, { status: 201 });
}
