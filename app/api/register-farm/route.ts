import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { farmName, ownerName, phone, email, city, approxStations, description } =
      await request.json();

    if (!farmName || !ownerName || !phone || !email || !city || !approxStations) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("farm_registration_requests").insert({
      farm_name: farmName,
      owner_name: ownerName,
      phone,
      email,
      city,
      approx_stations: Number(approxStations),
      farming_type: "meat",
      description: description || null,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
