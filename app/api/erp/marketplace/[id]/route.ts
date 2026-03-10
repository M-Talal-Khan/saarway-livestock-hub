import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

const BUCKET = "listing-images";

function parseStoredUrls(photoUrl: string | null): string[] {
  if (!photoUrl) return [];
  const trimmed = photoUrl.trim();
  if (trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed).filter(Boolean); } catch {}
  }
  return [trimmed];
}

function extractPath(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

async function deleteStorageImages(
  admin: ReturnType<typeof createAdminClient>,
  photoUrl: string | null
) {
  const urls = parseStoredUrls(photoUrl);
  const paths = urls.map(extractPath).filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  await admin.storage.from(BUCKET).remove(paths);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await verifyFarmSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  // ── Remove listing ─────────────────────────────────────────────────────────
  if (body.action === "remove") {
    const { data: existing } = await admin
      .from("listings")
      .select("photo_url, cattle_id")
      .eq("id", id)
      .eq("farm_id", session.farm_id)
      .single();

    const { error } = await admin
      .from("listings")
      .update({ status: "removed" })
      .eq("id", id)
      .eq("farm_id", session.farm_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Revert cattle status back to active
    if (existing?.cattle_id) {
      await admin.from("cattle").update({ status: "active" }).eq("id", existing.cattle_id).eq("farm_id", session.farm_id);
    }

    // Clean up images from storage
    if (existing?.photo_url) {
      await deleteStorageImages(admin, existing.photo_url);
    }

    return NextResponse.json({ success: true });
  }

  // ── Mark as Sold ──────────────────────────────────────────────────────────
  if (body.action === "mark-sold") {
    const { data: existing } = await admin
      .from("listings")
      .select("cattle_id")
      .eq("id", id)
      .eq("farm_id", session.farm_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Update listing status to sold
    const { error } = await admin
      .from("listings")
      .update({ status: "sold" })
      .eq("id", id)
      .eq("farm_id", session.farm_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update cattle status to sold
    if (existing.cattle_id) {
      await admin
        .from("cattle")
        .update({ status: "sold" })
        .eq("id", existing.cattle_id)
        .eq("farm_id", session.farm_id);
    }

    return NextResponse.json({ success: true });
  }

  // ── Edit listing ──────────────────────────────────────────────────────────
  const updates: Record<string, unknown> = {};
  if (body.askingPrice !== undefined) updates.asking_price = Number(body.askingPrice);
  if (body.description !== undefined) updates.description = body.description;

  if (body.photoUrls !== undefined) {
    const newUrls: string[] = Array.isArray(body.photoUrls)
      ? (body.photoUrls as unknown[])
          .filter((u): u is string => typeof u === "string" && u.startsWith("http"))
          .slice(0, 3)
      : [];

    // Delete images that were removed during edit
    const { data: existing } = await admin
      .from("listings")
      .select("photo_url")
      .eq("id", id)
      .eq("farm_id", session.farm_id)
      .single();

    if (existing?.photo_url) {
      const oldUrls = parseStoredUrls(existing.photo_url);
      const removedPaths = oldUrls
        .filter((u) => !newUrls.includes(u))
        .map(extractPath)
        .filter((p): p is string => p !== null);
      if (removedPaths.length > 0) {
        await admin.storage.from(BUCKET).remove(removedPaths);
      }
    }

    updates.photo_url =
      newUrls.length === 0
        ? null
        : newUrls.length === 1
        ? newUrls[0]
        : JSON.stringify(newUrls);
  }

  const { data, error } = await admin
    .from("listings")
    .update(updates)
    .eq("id", id)
    .eq("farm_id", session.farm_id)
    .select("id, asking_price, description, photo_url, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data });
}
