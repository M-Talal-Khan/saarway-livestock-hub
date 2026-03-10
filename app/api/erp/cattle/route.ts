import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);

  let query = admin
    .from("cattle")
    .select(`
      id, cattle_code, breed, teeth, coat_color, gender, status,
      initial_weight, current_weight, purchase_price, purchase_date,
      station_id, notes,
      stations(station_tag, station_name, city)
    `)
    .eq("farm_id", session.farm_id)
    .order("created_at", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-sync: fix cattle whose status doesn't reflect their sale state
  const allIds = (data ?? []).map((c: { id: string }) => c.id);
  if (allIds.length > 0) {
    const { data: saleItems } = await admin
      .from("sale_items")
      .select("cattle_id, sales(sale_type)")
      .in("cattle_id", allIds);

    if (saleItems && saleItems.length > 0) {
      const cattleStatusMap = new Map(
        (data ?? []).map((c: { id: string; status: string }) => [c.id, c.status])
      );
      const toMarkSold: string[] = [];
      const toMarkSlaughtered: string[] = [];

      for (const item of saleItems) {
        const currentStatus = cattleStatusMap.get(item.cattle_id);
        if (currentStatus && !["sold", "slaughtered", "dead"].includes(currentStatus)) {
          const salesObj = item.sales as any;
          const saleType = Array.isArray(salesObj) ? salesObj[0]?.sale_type : salesObj?.sale_type;
          if (saleType === "slaughter") {
            toMarkSlaughtered.push(item.cattle_id);
          } else {
            toMarkSold.push(item.cattle_id);
          }
        }
      }

      if (toMarkSold.length > 0) {
        await admin.from("cattle").update({ status: "sold" }).in("id", toMarkSold);
      }
      if (toMarkSlaughtered.length > 0) {
        await admin.from("cattle").update({ status: "slaughtered" }).in("id", toMarkSlaughtered);
      }

      if (toMarkSold.length > 0 || toMarkSlaughtered.length > 0) {
        const fixedData = (data ?? []).map((c: { id: string; status: string }) => {
          if (toMarkSold.includes(c.id)) return { ...c, status: "sold" };
          if (toMarkSlaughtered.includes(c.id)) return { ...c, status: "slaughtered" };
          return c;
        });
        return NextResponse.json({ cattle: fixedData });
      }
    }
  }

  return NextResponse.json({ cattle: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin and manager can add cattle
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { stationId, breed, teeth, weight, gender, purchasePrice, purchaseDate, coatColor, notes } = body;

  if (!stationId || !breed || teeth == null || !weight || !gender || !purchasePrice || !purchaseDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Generate cattle_code: C-000001, C-000002, etc.
  const { count } = await admin
    .from("cattle")
    .select("id", { count: "exact", head: true })
    .eq("farm_id", session.farm_id);
  const nextNum = (count ?? 0) + 1;
  const cattleCode = `C-${String(nextNum).padStart(6, "0")}`;

  const { data, error } = await admin
    .from("cattle")
    .insert({
      farm_id: session.farm_id,
      station_id: stationId,
      cattle_code: cattleCode,
      breed,
      teeth: Number(teeth),
      initial_weight: Number(weight),
      current_weight: Number(weight),
      gender: String(gender).toLowerCase(),
      purchase_price: Number(purchasePrice),
      purchase_date: purchaseDate,
      coat_color: coatColor || null,
      notes: notes || null,
      created_by: session.farm_user_id,
      status: "active",
    })
    .select(`id, cattle_code, breed, teeth, gender, status, current_weight, purchase_price, purchase_date, station_id, stations(station_tag, station_name, city)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cattle: data }, { status: 201 });
}
