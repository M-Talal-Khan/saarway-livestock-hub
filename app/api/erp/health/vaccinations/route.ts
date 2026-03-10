import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("vaccinations")
    .select(`id, vaccine_name, status, administered_date, next_due_date, notes, cattle_id, station_id, cattle(cattle_code, breed), farm_users!administered_by(full_name)`)
    .eq("farm_id", session.farm_id)
    .order("next_due_date", { ascending: true });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vaccinations: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "vet"].includes(session.role)) {
    return NextResponse.json({ error: "Only vets can record vaccinations" }, { status: 403 });
  }

  const body = await request.json();
  const { cattleId, cattleIds, vaccineName, administeredDate, nextDueDate, notes } = body;

  // Support both single (cattleId) and bulk (cattleIds)
  const ids: string[] = cattleIds && Array.isArray(cattleIds) ? cattleIds : cattleId ? [cattleId] : [];

  if (ids.length === 0 || !vaccineName || !administeredDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch all cattle to get their station_ids
  const { data: cattleList } = await admin
    .from("cattle")
    .select("id, station_id")
    .in("id", ids)
    .eq("farm_id", session.farm_id);

  if (!cattleList || cattleList.length === 0) {
    return NextResponse.json({ error: "No valid cattle found" }, { status: 404 });
  }

  const rows = cattleList.map((c) => ({
    cattle_id: c.id,
    farm_id: session.farm_id,
    station_id: c.station_id,
    vaccine_name: vaccineName,
    status: "completed",
    administered_date: administeredDate,
    next_due_date: nextDueDate || null,
    administered_by: session.farm_user_id,
    notes: notes || null,
  }));

  const { data, error } = await admin
    .from("vaccinations")
    .insert(rows)
    .select("id, vaccine_name, status, administered_date, next_due_date");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vaccinations: data, count: data?.length ?? 0 }, { status: 201 });
}
