import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin and accounts can see finance
  if (!["admin", "accounts"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const sf = stationFilter(session);

  const url = new URL(request.url);
  const months = Number(url.searchParams.get("months") ?? "6");

  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const sinceStr = since.toISOString().split("T")[0];

  let query = admin
    .from("transactions")
    .select(`id, type, category, amount, description, transaction_date, station_id, stations(station_name, station_tag)`)
    .eq("farm_id", session.farm_id)
    .gte("transaction_date", sinceStr)
    .order("transaction_date", { ascending: false });

  if (sf.station_id) query = query.eq("station_id", sf.station_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const transactions = data ?? [];
  const income   = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return NextResponse.json({
    transactions,
    summary: { income, expenses, pl: income - expenses },
  });
}
