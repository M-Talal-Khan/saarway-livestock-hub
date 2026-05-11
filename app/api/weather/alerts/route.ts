import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

// GET /api/weather/alerts - Get weather alerts for the farm
export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const farmId = session.farm_id;
  const sf = stationFilter(session);

  const { searchParams } = new URL(request.url);
  const acknowledged = searchParams.get("acknowledged");

  let query = admin
    .from("weather_alerts")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (sf.station_id) query = query.eq("station_id", sf.station_id);
  if (acknowledged === "true") query = query.eq("is_acknowledged", true);
  if (acknowledged === "false") query = query.eq("is_acknowledged", false);

  const { data: alerts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ alerts: alerts ?? [] });
}

// POST /api/weather/alerts - Create manual weather alert (Admin only)
export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { alert_type, severity, temperature_c, humidity, description, recommendation, station_id } = body;

  if (!alert_type || !severity || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: alert, error } = await admin
    .from("weather_alerts")
    .insert({
      farm_id: session.farm_id,
      station_id: station_id || null,
      alert_type,
      severity,
      temperature_c: temperature_c || null,
      humidity: humidity || null,
      description,
      recommendation: recommendation || null,
      source: "manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ alert });
}

// PATCH /api/weather/alerts - Acknowledge alert
export async function PATCH(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { alert_id, action } = body;

  if (!alert_id) return NextResponse.json({ error: "Alert ID required" }, { status: 400 });

  const admin = createAdminClient();

  if (action === "acknowledge") {
    const { data: alert, error } = await admin
      .from("weather_alerts")
      .update({
        is_acknowledged: true,
        acknowledged_by: session.farm_user_id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", alert_id)
      .eq("farm_id", session.farm_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alert });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}