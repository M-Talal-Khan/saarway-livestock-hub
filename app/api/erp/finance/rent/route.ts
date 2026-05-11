import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager", "accounts"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("rent_details")
    .select(`id, rent_amount, rental_cycle, contract_start, contract_end, owner_name, owner_contact, payment_due_day, payment_status, last_paid_at, station_id, stations(station_name, station_tag, city)`)
    .eq("farm_id", session.farm_id)
    .order("created_at", { ascending: true });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rentDetails: data ?? [] });
}
