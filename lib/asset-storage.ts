import "server-only";
import { supabaseAdmin } from "./supabase-admin";

const BUCKET = process.env.SUPABASE_ASSET_BUCKET || "brand-assets";

let bucketChecked = false;

async function ensureBucket(): Promise<void> {
  if (bucketChecked) return;
  const sb = supabaseAdmin();
  const { data: existing } = await sb.storage.getBucket(BUCKET);
  if (!existing) {
    await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 12 * 1024 * 1024, // 12 MB ceiling per asset
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml",
        "image/gif",
      ],
    });
  }
  bucketChecked = true;
}

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("svg")) return "svg";
  if (mime.includes("gif")) return "gif";
  return "bin";
}

/**
 * Upload one brand asset (logo, hero image, cutout, etc.) to Supabase
 * Storage. Path shape: `${slug}/${kind}/${uuid}.${ext}` so assets are
 * grouped by kit + kind for easy admin browsing.
 *
 * Returns the public URL to persist on the brand_kit_assets row.
 */
export async function uploadBrandAsset({
  slug,
  kind,
  bytes,
  mimeType,
}: {
  slug: string;
  kind: string;
  bytes: Uint8Array;
  mimeType: string;
}): Promise<{ ok: true; url: string; path: string } | { ok: false; error: string }> {
  try {
    await ensureBucket();
  } catch (err) {
    return {
      ok: false,
      error: `Bucket setup failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const ext = extFromMime(mimeType);
  const path = `${slug}/${kind}/${crypto.randomUUID()}.${ext}`;

  const sb = supabaseAdmin();
  const { error: uploadErr } = await sb.storage.from(BUCKET).upload(path, bytes, {
    contentType: mimeType,
    upsert: false,
  });
  if (uploadErr) {
    return { ok: false, error: `Storage upload failed: ${uploadErr.message}` };
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: publicUrl, path };
}

/**
 * Delete a stored asset by its path (the `path` returned from upload).
 * Soft-fails: if Storage rejects (missing file, perms), we still let the
 * caller remove the DB row.
 */
export async function deleteBrandAssetByUrl(url: string): Promise<void> {
  // Path is everything after `/storage/v1/object/public/${BUCKET}/`
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  const sb = supabaseAdmin();
  await sb.storage.from(BUCKET).remove([path]);
}
