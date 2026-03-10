import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const includeInactive =
    request.nextUrl.searchParams.get("includeInactive") === "true";

  const admin = createAdminClient();
  let query = admin
    .from("stations")
    .select("id, station_tag, station_name, city, is_active")
    .eq("farm_id", session.farm_id)
    .order("station_tag", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ stations: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stationTag, stationName, city, address } = await request.json();

  if (!stationTag || !stationName || !city) {
    return NextResponse.json({ error: "Tag, name and city are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("stations")
    .insert({
      farm_id: session.farm_id,
      station_tag: stationTag.toUpperCase(),
      station_name: stationName,
      city,
      address: address || null,
      station_type: "owned",
      is_active: true,
    })
    .select("id, station_tag, station_name, city")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A station with this tag already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ station: data });
}

export async function PATCH(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stationId, action } = await request.json();

  if (!stationId || !["close", "reactivate"].includes(action)) {
    return NextResponse.json(
      { error: "stationId and action (close|reactivate) are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify station belongs to this farm
  const { data: station } = await admin
    .from("stations")
    .select("id, is_active")
    .eq("id", stationId)
    .eq("farm_id", session.farm_id)
    .single();

  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  if (action === "close") {
    if (!station.is_active) {
      return NextResponse.json({ error: "Station is already closed" }, { status: 400 });
    }

    // Check for live animals at this station (exclude sold, slaughtered, dead)
    const { count } = await admin
      .from("cattle")
      .select("id", { count: "exact", head: true })
      .eq("station_id", stationId)
      .eq("farm_id", session.farm_id)
      .not("status", "in", '("sold","slaughtered","dead")');

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot close station — it has ${count} active animal${count > 1 ? "s" : ""}. Move or sell them first.` },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from("stations")
      .update({ is_active: false })
      .eq("id", stationId)
      .eq("farm_id", session.farm_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, is_active: false });
  }

  // action === "reactivate"
  if (station.is_active) {
    return NextResponse.json({ error: "Station is already active" }, { status: 400 });
  }

  const { error } = await admin
    .from("stations")
    .update({ is_active: true })
    .eq("id", stationId)
    .eq("farm_id", session.farm_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, is_active: true });
}
