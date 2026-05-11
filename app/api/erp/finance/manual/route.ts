import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function POST(request: NextRequest) {
    const session = await verifyFarmSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only Admin or Accounts can post manual expenses
    if (!["admin", "manager", "accounts"].includes(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { stationId, amount, category, description, transactionDate } = body;

    if (!stationId || !amount || !category || !transactionDate) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("transactions")
        .insert({
            farm_id: session.farm_id,
            station_id: stationId,
            type: "expense",
            category,
            amount: numAmount,
            description: description || "Manual custom expense",
            transaction_date: transactionDate,
            recorded_by: session.farm_user_id,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ transaction: data }, { status: 201 });
}
