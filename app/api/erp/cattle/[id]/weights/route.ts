import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cattle_weight_logs")
    .select("id, weight_kg, logged_at")
    .eq("cattle_id", id)
    .eq("farm_id", session.farm_id)
    .order("logged_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weights: data ?? [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weight } = await request.json();
  if (!weight || Number(weight) <= 0) {
    return NextResponse.json({ error: "Valid weight required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify cattle belongs to this farm and get station_id
  const { data: cattle } = await admin
    .from("cattle")
    .select("id, station_id")
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .single();
  if (!cattle) return NextResponse.json({ error: "Cattle not found" }, { status: 404 });

  const { data, error } = await admin
    .from("cattle_weight_logs")
    .insert({
      cattle_id: id,
      farm_id: session.farm_id,
      station_id: cattle.station_id,
      weight_kg: Number(weight),
      logged_by: session.farm_user_id,
    })
    .select("id, weight_kg, logged_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weight: data }, { status: 201 });
}
