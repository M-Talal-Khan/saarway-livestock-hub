import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager", "accounts"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("salary_records")
    .select(`id, staff_name, amount, payment_date, notes, farm_users!farm_user_id(full_name, role)`)
    .eq("farm_id", session.farm_id)
    .order("payment_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ salaries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager", "accounts"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { farmUserId, staffName, amount, paymentDate, notes } = body;

  if (!staffName || !amount || !paymentDate) {
    return NextResponse.json({ error: "Staff name, amount and date are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("salary_records")
    .insert({
      farm_id: session.farm_id,
      farm_user_id: farmUserId || null,
      staff_name: staffName,
      amount: Number(amount),
      payment_date: paymentDate,
      notes: notes || null,
      recorded_by: session.farm_user_id,
    })
    .select("id, staff_name, amount, payment_date")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Post expense to Finance
  await admin.from("transactions").insert({
    farm_id: session.farm_id,
    station_id: null,
    type: "expense",
    category: "salary",
    amount: Number(amount),
    description: `Salary — ${staffName}${notes ? `: ${notes}` : ""}`,
    transaction_date: paymentDate,
    recorded_by: session.farm_user_id,
  });

  return NextResponse.json({ salary: data }, { status: 201 });
}
