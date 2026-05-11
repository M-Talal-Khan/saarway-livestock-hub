import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

// GET /api/weather/settings - Get weather settings
export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: settings, error } = await admin
    .from("weather_settings")
    .select("*")
    .eq("farm_id", session.farm_id)
    .single();

  if (error || !settings) {
    // Get city from stations
    const { data: stations } = await admin
      .from("stations")
      .select("city")
      .eq("farm_id", session.farm_id)
      .limit(5);

    return NextResponse.json({
      settings: {
        city: stations?.[0]?.city || "Lahore",
        area: "Farm Area",
        heat_alert_threshold: 40,
        cold_alert_threshold: 5,
        enabled: true,
      },
      availableCities: stations?.map(s => s.city).filter(Boolean) || ["Lahore"],
    });
  }

  return NextResponse.json({ settings });
}

// PATCH /api/weather/settings - Update weather settings (Admin/Manager only)
export async function PATCH(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: `Forbidden: role "${session.role}" cannot modify settings` }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { city, area, heat_alert_threshold, cold_alert_threshold, enabled } = body as {
    city?: string;
    area?: string;
    heat_alert_threshold?: number;
    cold_alert_threshold?: number;
    enabled?: boolean;
  };

  if (!city || typeof city !== "string") {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const heatThreshold = Number(heat_alert_threshold ?? 40);
  const coldThreshold = Number(cold_alert_threshold ?? 5);

  if (!Number.isFinite(heatThreshold) || heatThreshold < 20 || heatThreshold > 60) {
    return NextResponse.json({ error: "Heat threshold must be between 20 and 60 C" }, { status: 400 });
  }

  if (!Number.isFinite(coldThreshold) || coldThreshold < -10 || coldThreshold > 20) {
    return NextResponse.json({ error: "Cold threshold must be between -10 and 20 C" }, { status: 400 });
  }

  if (heatThreshold <= coldThreshold) {
    return NextResponse.json({ error: "Heat threshold must be higher than cold threshold" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Use maybeSingle to avoid PostgREST error when no row exists
  const { data: existing, error: lookupError } = await admin
    .from("weather_settings")
    .select("id")
    .eq("farm_id", session.farm_id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: `Lookup failed: ${lookupError.message}` }, { status: 500 });
  }

  if (existing) {
    const { data, error } = await admin
      .from("weather_settings")
      .update({
        city: city.trim(),
        area: typeof area === "string" && area.trim() ? area.trim() : null,
        heat_alert_threshold: heatThreshold,
        cold_alert_threshold: coldThreshold,
        enabled: enabled ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("farm_id", session.farm_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } else {
    const { data, error } = await admin
      .from("weather_settings")
      .insert({
        farm_id: session.farm_id,
        city: city.trim(),
        area: typeof area === "string" && area.trim() ? area.trim() : null,
        heat_alert_threshold: heatThreshold,
        cold_alert_threshold: coldThreshold,
        enabled: enabled ?? true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  }
}
