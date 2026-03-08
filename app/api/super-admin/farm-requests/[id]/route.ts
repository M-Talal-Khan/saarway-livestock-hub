import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUsername(ownerName: string): string {
  return ownerName.trim().toLowerCase().replace(/\s+/g, ".");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorized = await verifySuperAdminSession(request);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await request.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the registration request
  const { data: req, error: reqError } = await admin
    .from("farm_registration_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (reqError || !req) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (req.status !== "pending") {
    return NextResponse.json({ error: "Request is no longer pending" }, { status: 409 });
  }

  if (action === "reject") {
    const { error } = await admin
      .from("farm_registration_requests")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // action === "approve"
  // Check for duplicate email in farms
  const { data: existing } = await admin
    .from("farms")
    .select("id, is_active")
    .eq("email", req.email)
    .maybeSingle();

  if (existing?.is_active) {
    return NextResponse.json(
      { error: "An active farm with this email already exists. Reject this duplicate request." },
      { status: 409 }
    );
  }

  if (existing && !existing.is_active) {
    return NextResponse.json(
      { error: "This farm is currently suspended. Use the Suspended tab to reactivate it instead." },
      { status: 409 }
    );
  }

  // Get next farm_number
  const { data: maxRow } = await admin
    .from("farms")
    .select("farm_number")
    .order("farm_number", { ascending: false })
    .limit(1)
    .single();

  const nextFarmNumber = (maxRow?.farm_number ?? 999) + 1;

  // Create farm
  const { data: farm, error: farmError } = await admin
    .from("farms")
    .insert({
      farm_number: nextFarmNumber,
      farm_name: req.farm_name,
      owner_name: req.owner_name,
      phone: req.phone,
      email: req.email,
      city: req.city,
      farming_type: "meat",
      description: req.description ?? null,
      is_active: true,
      onboarded_at: new Date().toISOString(),
    })
    .select("id, farm_number")
    .single();

  if (farmError || !farm) {
    return NextResponse.json({ error: farmError?.message ?? "Failed to create farm" }, { status: 500 });
  }

  // Generate admin credentials
  const username = generateUsername(req.owner_name);
  const password = generatePassword();

  // Hash password
  const { data: hashedPw, error: hashError } = await admin.rpc("hash_password", {
    p_password: password,
  });

  if (hashError || !hashedPw) {
    return NextResponse.json({ error: "Password hashing failed" }, { status: 500 });
  }

  // Create admin farm user
  const { error: userError } = await admin.from("farm_users").insert({
    farm_id: farm.id,
    username,
    full_name: req.owner_name,
    role: "admin",
    password_hash: hashedPw,
    station_id: null,
    is_active: true,
  });

  if (userError) {
    // If username taken, append farm number
    const fallbackUsername = `${username}.${nextFarmNumber}`;
    const { error: retryError } = await admin.from("farm_users").insert({
      farm_id: farm.id,
      username: fallbackUsername,
      full_name: req.owner_name,
      role: "admin",
      password_hash: hashedPw,
      station_id: null,
      is_active: true,
    });

    if (retryError) {
      return NextResponse.json({ error: retryError.message }, { status: 500 });
    }

    // Update request status
    await admin
      .from("farm_registration_requests")
      .update({ status: "approved" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      farmNumber: nextFarmNumber,
      username: fallbackUsername,
      password,
    });
  }

  // Update request status
  await admin
    .from("farm_registration_requests")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.json({
    success: true,
    farmNumber: nextFarmNumber,
    username,
    password,
  });
}
