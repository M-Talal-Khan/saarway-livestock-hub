import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("feed_items")
    .select(`id, name, unit, current_stock, low_stock_threshold, is_active, station_id, stations(station_name, station_tag)`)
    .eq("farm_id", session.farm_id)
    .order("name", { ascending: true });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ feedItems: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { stationId, name, unit, lowStockThreshold, initialStock } = body;

  if (!stationId || !name || !unit) {
    return NextResponse.json({ error: "Station, name and unit are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feed_items")
    .insert({
      farm_id: session.farm_id,
      station_id: stationId,
      name,
      unit,
      current_stock: 0,
      low_stock_threshold: Number(lowStockThreshold) || 100,
      is_active: true,
      created_by: session.farm_user_id,
    })
    .select("id, name, unit, current_stock, low_stock_threshold, is_active, station_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create an opening stock_in log if initialStock > 0; trigger will update current_stock
  const qty = Number(initialStock) || 0;
  if (qty > 0) {
    await admin.from("feed_logs").insert({
      farm_id: session.farm_id,
      station_id: stationId,
      feed_item_id: data.id,
      log_type: "stock_in",
      quantity: qty,
      cost: null,
      notes: "Opening stock",
      logged_by: session.farm_user_id,
    });

    // Refetch to get trigger-updated current_stock
    const { data: refreshed } = await admin
      .from("feed_items")
      .select("id, name, unit, current_stock, low_stock_threshold, is_active, station_id")
      .eq("id", data.id)
      .single();

    return NextResponse.json({ feedItem: refreshed ?? data }, { status: 201 });
  }

  return NextResponse.json({ feedItem: data }, { status: 201 });
}
