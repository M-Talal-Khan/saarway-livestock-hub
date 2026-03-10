import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("sales")
    .select(`id, sale_type, buyer_name, buyer_phone, slaughterhouse, meat_weight_kg, price_per_kg, total_price, sale_date, notes, station_id, stations(station_name, station_tag), sale_items(id, cattle_id, individual_price)`)
    .eq("farm_id", session.farm_id)
    .order("sale_date", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sales: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager", "accounts"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { stationId, saleType, buyerName, buyerPhone, slaughterhouse, meatWeightKg, pricePerKg, totalPrice, saleDate, notes, animals } = body;

  if (!stationId || !saleType || !totalPrice || !saleDate || !Array.isArray(animals) || animals.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Deduplicate cattle IDs (guard against double-submission of same animal)
  const cattleIds: string[] = [...new Set(animals.map((a: { cattleId: string }) => a.cattleId))];
  if (cattleIds.length !== animals.length) {
    return NextResponse.json({ error: "Duplicate animals in the sale — each animal can only appear once" }, { status: 400 });
  }

  // Validate sum of individual prices (allow ±1 PKR rounding tolerance)
  const priceSum = animals.reduce((sum: number, a: { cattleId: string; price: number }) => sum + Number(a.price), 0);
  if (Math.abs(priceSum - Number(totalPrice)) > 1) {
    return NextResponse.json({ error: "Sum of individual prices must equal total price" }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── Step 1: Verify cattle exist in farm & are sellable ────────────────────
  const { data: cattleRows } = await admin
    .from("cattle")
    .select("id, status")
    .in("id", cattleIds)
    .eq("farm_id", session.farm_id);

  if (!cattleRows || cattleRows.length !== cattleIds.length) {
    return NextResponse.json({ error: "One or more animals not found in this farm" }, { status: 400 });
  }

  const alreadySold = cattleRows.filter((c) => ["sold", "slaughtered", "dead"].includes(c.status));
  if (alreadySold.length > 0) {
    return NextResponse.json({ error: "Cannot sell animals that are already sold, slaughtered, or dead" }, { status: 400 });
  }

  // ── Step 2: Check for orphaned sale_items (previous partial failures) ──────
  const { data: existingItems } = await admin
    .from("sale_items")
    .select("cattle_id")
    .in("cattle_id", cattleIds);

  if (existingItems && existingItems.length > 0) {
    // Auto-fix: mark orphaned cattle as sold so they won't block future checks
    const orphanIds = existingItems.map((e: { cattle_id: string }) => e.cattle_id);
    await admin.from("cattle").update({ status: "sold" }).in("id", orphanIds);
    return NextResponse.json({
      error: "One or more animals were already recorded in a previous sale. Their status has been corrected — please refresh the page and try again.",
    }, { status: 409 });
  }

  // ── Step 3: Create sale record ─────────────────────────────────────────────
  const { data: sale, error: saleError } = await admin
    .from("sales")
    .insert({
      farm_id: session.farm_id,
      station_id: stationId,
      sale_type: saleType,
      buyer_name: buyerName || null,
      buyer_phone: buyerPhone || null,
      slaughterhouse: slaughterhouse || null,
      meat_weight_kg: meatWeightKg ? Number(meatWeightKg) : null,
      price_per_kg: pricePerKg ? Number(pricePerKg) : null,
      total_price: Number(totalPrice),
      sale_date: saleDate,
      notes: notes || null,
      recorded_by: session.farm_user_id,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    return NextResponse.json({ error: saleError?.message ?? "Failed to create sale" }, { status: 500 });
  }

  // ── Step 4: Insert sale_items — rollback sale if this fails ───────────────
  const saleItems = animals.map((a: { cattleId: string; price: number }) => ({
    sale_id: sale.id,
    cattle_id: a.cattleId,
    farm_id: session.farm_id,
    individual_price: Number(a.price),
  }));

  const { error: itemsError } = await admin.from("sale_items").insert(saleItems);
  if (itemsError) {
    await admin.from("sales").delete().eq("id", sale.id);
    return NextResponse.json({ error: `Failed to record sale items: ${itemsError.message}` }, { status: 500 });
  }

  // ── Step 5: Update cattle status — rollback everything if this fails ────────
  const newStatus = saleType === "slaughter" ? "slaughtered" : "sold";
  const { error: statusError } = await admin
    .from("cattle")
    .update({ status: newStatus })
    .in("id", cattleIds)
    .eq("farm_id", session.farm_id);

  if (statusError) {
    await admin.from("sale_items").delete().eq("sale_id", sale.id);
    await admin.from("sales").delete().eq("id", sale.id);
    return NextResponse.json({ error: `Failed to update cattle status: ${statusError.message}` }, { status: 500 });
  }

  // ── Step 6: Post income to Finance (fire and forget — sale already committed) ─
  const saleCategory = saleType === "slaughter" ? "Slaughter Sale" : "Cattle Sale";
  const saleDesc = buyerName
    ? `${saleCategory} to ${buyerName} — ${cattleIds.length} animal(s)`
    : slaughterhouse
      ? `Slaughter at ${slaughterhouse} — ${cattleIds.length} animal(s)`
      : `${saleCategory} — ${cattleIds.length} animal(s)`;
  await admin.from("transactions").insert({
    farm_id: session.farm_id,
    station_id: stationId,
    type: "income",
    category: "cattle_sale", // Must match DB enum
    amount: Number(totalPrice),
    description: saleDesc,
    transaction_date: saleDate,
    recorded_by: session.farm_user_id,
  });

  // Notify farm admins about the sale
  await admin.from("notifications").insert({
    farm_id: session.farm_id,
    user_id: null,
    type: "sale",
    severity: "info",
    title: "New Sale",
    message: `${cattleIds.length} animal(s) sold — PKR ${Number(totalPrice).toLocaleString()}`,
    link: "/erp/selling",
  });

  return NextResponse.json({ sale: { id: sale.id } }, { status: 201 });
}
