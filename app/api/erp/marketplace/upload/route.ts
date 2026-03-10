/**
 * POST /api/erp/marketplace/upload
 *
 * Accepts a single image file via multipart/form-data (field: "file").
 * Uploads to Supabase Storage bucket "listing-images".
 * Returns the public URL.
 *
 * ⚠️  SETUP REQUIRED (one-time, in Supabase Dashboard):
 *   1. Go to Storage → New bucket → Name: "listing-images" → Public: ON
 *   2. Add policy: Allow authenticated service_role full access (default with service key).
 *   3. Optionally add a public read policy for anon role on SELECT.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

const BUCKET = "listing-images";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (after client-side compression)
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB after compression)" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Path: {farm_id}/{timestamp}-{random}.jpg
  const ext = file.type === "image/png" ? "png" : "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `${session.farm_id}/${fileName}`;

  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
}
