import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("farms")
    .select("id, farm_number, farm_name, owner_name, phone, email, city, farming_type, description")
    .eq("id", session.farm_id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  return NextResponse.json({ farm: data });
}

export async function PATCH(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { farmName, ownerName, phone, email, city, farmingType, description } = body;

  if (!farmName || !ownerName || !city) {
    return NextResponse.json({ error: "Farm name, owner name, and city are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("farms")
    .update({
      farm_name: farmName,
      owner_name: ownerName,
      phone: phone || null,
      email: email || null,
      city,
      farming_type: farmingType || null,
      description: description || null,
    })
    .eq("id", session.farm_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
