import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const sf = stationFilter(session);
  const farmId = session.farm_id;

  // ── Cattle counts ────────────────────────────────────────────────────────────
  let cattleQuery = admin
    .from("cattle")
    .select("id, status, station_id")
    .eq("farm_id", farmId);
  if (sf.station_id) cattleQuery = cattleQuery.eq("station_id", sf.station_id);
  const { data: allCattle } = await cattleQuery;

  const cattle = allCattle ?? [];
  const activeCattle   = cattle.filter((c) => !["sold", "slaughtered", "dead"].includes(c.status)).length;
  const readyForSale   = cattle.filter((c) => c.status === "ready_for_sale").length;
  const listedCattle   = cattle.filter((c) => c.status === "listed").length;

  // ── Vaccinations ────────────────────────────────────────────────────────────
  let vacQuery = admin
    .from("vaccinations")
    .select("id, status, next_due_date, vaccine_name, cattle_id, cattle(cattle_code)")
    .eq("farm_id", farmId)
    .in("status", ["overdue", "upcoming"]);
  if (sf.station_id) vacQuery = vacQuery.eq("station_id", sf.station_id);
  const { data: pendingVaccinations } = await vacQuery;

  const overdueVaccinations  = (pendingVaccinations ?? []).filter((v) => v.status === "overdue").length;
  const upcomingVaccinations = (pendingVaccinations ?? []).filter((v) => v.status === "upcoming").length;

  // ── Treatments ───────────────────────────────────────────────────────────────
  let treatQuery = admin
    .from("treatments")
    .select("id, condition_name, treatment_date, outcome, cattle_id, cattle(cattle_code, breed)")
    .eq("farm_id", farmId)
    .is("outcome", null)
    .order("treatment_date", { ascending: false });
  if (sf.station_id) treatQuery = treatQuery.eq("station_id", sf.station_id);
  const { data: activeTreatments } = await treatQuery;

  // ── Finance (6 months) ───────────────────────────────────────────────────────
  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  const sinceStr = since.toISOString().split("T")[0];

  let txnQuery = admin
    .from("transactions")
    .select("type, category, amount, transaction_date")
    .eq("farm_id", farmId)
    .gte("transaction_date", sinceStr);
  if (sf.station_id) txnQuery = txnQuery.eq("station_id", sf.station_id);
  const { data: transactions } = await txnQuery;

  const income   = (transactions ?? []).filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = (transactions ?? []).filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // ── Feed alerts ──────────────────────────────────────────────────────────────
  let feedQuery = admin
    .from("feed_items")
    .select("id, name, current_stock, low_stock_threshold, unit, station_id, stations(station_name)")
    .eq("farm_id", farmId)
    .eq("is_active", true);
  if (sf.station_id) feedQuery = feedQuery.eq("station_id", sf.station_id);
  const { data: feedItems } = await feedQuery;
  const lowFeedAlerts = (feedItems ?? []).filter((f) => f.current_stock <= f.low_stock_threshold);

  // ── Rent ─────────────────────────────────────────────────────────────────────
  let rentQuery = admin
    .from("rent_details")
    .select("id, owner_name, rent_amount, payment_status, payment_due_day, station_id, stations(station_name)")
    .eq("farm_id", farmId);
  if (sf.station_id) rentQuery = rentQuery.eq("station_id", sf.station_id);
  const { data: rentDetails } = await rentQuery;

  // ── Recent sales ─────────────────────────────────────────────────────────────
  let salesQuery = admin
    .from("sales")
    .select("id, sale_type, total_price, sale_date, buyer_name")
    .eq("farm_id", farmId)
    .order("sale_date", { ascending: false })
    .limit(5);
  if (sf.station_id) salesQuery = salesQuery.eq("station_id", sf.station_id);
  const { data: recentSales } = await salesQuery;

  // ── Worker tasks (for worker role) ───────────────────────────────────────────
  let workerCattle: unknown[] = [];
  if (session.role === "worker" && sf.station_id) {
    const { data } = await admin
      .from("cattle")
      .select("id, cattle_code, breed, status, current_weight")
      .eq("farm_id", farmId)
      .eq("station_id", sf.station_id)
      .in("status", ["active", "fattening"])
      .order("cattle_code");
    workerCattle = data ?? [];
  }

  return NextResponse.json({
    cattle: { total: activeCattle, readyForSale, listed: listedCattle },
    health: {
      overdueVaccinations,
      upcomingVaccinations,
      activeTreatments: (activeTreatments ?? []).length,
      recentTreatments: (activeTreatments ?? []).slice(0, 5),
      upcomingVaccinationsList: (pendingVaccinations ?? []).filter((v) => v.status === "upcoming").slice(0, 5),
    },
    finance: { income, expenses, pl: income - expenses },
    alerts: { lowFeed: lowFeedAlerts.slice(0, 5), overdueRent: (rentDetails ?? []).filter((r) => r.payment_status === "overdue") },
    rent: rentDetails ?? [],
    recentSales: recentSales ?? [],
    workerCattle,
  });
}
