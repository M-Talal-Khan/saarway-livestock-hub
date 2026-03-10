import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "accounts"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action } = await request.json();

  if (action !== "mark-paid") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch rent details for finance posting
  const { data: rent } = await admin
    .from("rent_details")
    .select("rent_amount, station_id, owner_name, rental_cycle")
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .single();

  // Set last_paid_at from app layer (per schema requirement — not done in trigger to avoid recursion)
  const { data, error } = await admin
    .from("rent_details")
    .update({ payment_status: "paid", last_paid_at: new Date().toISOString() })
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .select("id, payment_status, last_paid_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Post expense to Finance
  if (rent) {
    await admin.from("transactions").insert({
      farm_id: session.farm_id,
      station_id: rent.station_id,
      type: "expense",
      category: "rent",
      amount: rent.rent_amount,
      description: `Rent paid to ${rent.owner_name} (${rent.rental_cycle})`,
      transaction_date: new Date().toISOString().split("T")[0],
      recorded_by: session.farm_user_id,
    });
  }

  return NextResponse.json({ rentDetail: data });
}
