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
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined)               updates.name                = body.name;
  if (body.unit !== undefined)               updates.unit                = body.unit;
  if (body.lowStockThreshold !== undefined)  updates.low_stock_threshold = Number(body.lowStockThreshold);
  if (body.isActive !== undefined)           updates.is_active           = body.isActive;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feed_items")
    .update(updates)
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .select("id, name, unit, current_stock, low_stock_threshold, is_active")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ feedItem: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Delete dependent logs first to satisfy foreign key constraint
  const { error: logsError } = await admin
    .from("feed_logs")
    .delete()
    .eq("feed_item_id", id)
    .eq("farm_id", session.farm_id);

  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 });

  const { error } = await admin
    .from("feed_items")
    .delete()
    .eq("id", id)
    .eq("farm_id", session.farm_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
