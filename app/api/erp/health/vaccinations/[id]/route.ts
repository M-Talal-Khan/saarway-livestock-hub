import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "vet"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined)           updates.status            = body.status;
  if (body.administeredDate !== undefined) updates.administered_date = body.administeredDate;
  if (body.nextDueDate !== undefined)      updates.next_due_date     = body.nextDueDate;
  if (body.notes !== undefined)            updates.notes             = body.notes;
  if (body.administeredDate)               updates.administered_by   = session.farm_user_id;

  const { data, error } = await admin
    .from("vaccinations")
    .update(updates)
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .select("id, vaccine_name, status, administered_date, next_due_date")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vaccination: data });
}
