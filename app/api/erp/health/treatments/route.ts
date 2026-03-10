import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("treatments")
    .select(`id, treatment_date, condition_name, treatment_given, medicine, cost, outcome, notes, cattle_id, station_id, cattle(cattle_code, breed), farm_users!recorded_by(full_name)`)
    .eq("farm_id", session.farm_id)
    .order("treatment_date", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ treatments: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "vet"].includes(session.role)) {
    return NextResponse.json({ error: "Only vets can record treatments" }, { status: 403 });
  }

  const body = await request.json();
  const { cattleId, treatmentDate, conditionName, treatmentGiven, medicine, cost, outcome, notes } = body;

  if (!cattleId || !conditionName || !treatmentGiven || !treatmentDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: cattle } = await admin
    .from("cattle")
    .select("id, station_id")
    .eq("id", cattleId)
    .eq("farm_id", session.farm_id)
    .single();

  if (!cattle) return NextResponse.json({ error: "Cattle not found" }, { status: 404 });

  const { data, error } = await admin
    .from("treatments")
    .insert({
      cattle_id: cattleId,
      farm_id: session.farm_id,
      station_id: cattle.station_id,
      treatment_date: treatmentDate,
      condition_name: conditionName,
      treatment_given: treatmentGiven,
      medicine: medicine || null,
      cost: Number(cost) || 0,
      outcome: outcome || null,
      notes: notes || null,
      recorded_by: session.farm_user_id,
    })
    .select("id, treatment_date, condition_name, treatment_given, medicine, cost, outcome")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ treatment: data }, { status: 201 });
}
