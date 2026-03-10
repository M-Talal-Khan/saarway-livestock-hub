import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  // Verify cattle belongs to this farm
  const { data: existing } = await admin
    .from("cattle")
    .select("id")
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined)        updates.status         = body.status;
  if (body.stationId !== undefined)     updates.station_id     = body.stationId;
  if (body.breed !== undefined)         updates.breed          = body.breed;
  if (body.teeth !== undefined)         updates.teeth          = Number(body.teeth);
  if (body.notes !== undefined)         updates.notes          = body.notes;
  if (body.coatColor !== undefined)     updates.coat_color     = body.coatColor;

  const { data, error } = await admin
    .from("cattle")
    .update(updates)
    .eq("id", id)
    .select("id, cattle_code, status, station_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cattle: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Only admin can delete cattle" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("cattle")
    .delete()
    .eq("id", id)
    .eq("farm_id", session.farm_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
