import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("feed_logs")
    .select(`id, log_type, quantity, cost, notes, logged_at, station_id, feed_item_id, feed_items(name, unit), farm_users!logged_by(full_name), stations(station_name, station_tag)`)
    .eq("farm_id", session.farm_id)
    .order("logged_at", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Workers can log consumption; admin/manager can do both stock-in and consumption
  const body = await request.json();
  const { feedItemId, stationId, logType, quantity, cost, notes } = body;

  if (!feedItemId || !stationId || !logType || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (logType === "stock_in" && !["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Only admin/manager can add stock" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feed_logs")
    .insert({
      farm_id: session.farm_id,
      station_id: stationId,
      feed_item_id: feedItemId,
      log_type: logType,
      quantity: Number(quantity),
      cost: cost ? Number(cost) : null,
      notes: notes || null,
      logged_by: session.farm_user_id,
    })
    .select("id, log_type, quantity, cost, logged_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Post feed purchase cost to Finance
  if (logType === "stock_in" && cost && Number(cost) > 0) {
    await admin.from("transactions").insert({
      farm_id: session.farm_id,
      station_id: stationId,
      type: "expense",
      category: "Feed",
      amount: Number(cost),
      description: notes || `Feed stock-in — ${quantity} units`,
      transaction_date: new Date().toISOString().split("T")[0],
      recorded_by: session.farm_user_id,
    });
  }

  return NextResponse.json({ log: data }, { status: 201 });
}
