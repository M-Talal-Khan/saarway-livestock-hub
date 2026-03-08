import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("stations")
    .select("id, station_tag, station_name, city")
    .eq("farm_id", session.farm_id)
    .order("station_tag", { ascending: true });

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
