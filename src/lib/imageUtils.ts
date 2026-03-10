/**
 * Client-side image utilities for cattle listing photos.
 * Compression runs entirely in the browser using Canvas API — no external libraries.
 */

const BUCKET = "listing-images";

/** Compress a File to JPEG using Canvas. Returns a new File (image/jpeg). */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  quality = 0.78
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

/**
 * Parse the photo_url DB field into an ordered array of URLs.
 * Supports JSON arrays (new multi-photo format) and plain single URLs (legacy).
 */
export function parsePhotoUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === "string" && u.length > 0);
    } catch {}
  }
  return [trimmed];
}

/** Serialize an array of URLs into the photo_url DB field format. */
export function serializePhotoUrls(urls: string[]): string | null {
  const valid = urls.filter(Boolean);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0]; // legacy compat for single photo
  return JSON.stringify(valid);
}

/**
 * Extract the storage object path from a Supabase Storage public URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/listing-images/farm-id/abc.jpg"
 * → "farm-id/abc.jpg"
 */
export function extractStoragePath(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}
