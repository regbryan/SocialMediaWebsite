import "server-only";
import { supabaseAdmin } from "./supabase-admin";

const BUCKET = process.env.SUPABASE_PREVIEW_BUCKET || "preview-assets";

let bucketChecked = false;

/**
 * Ensure the preview bucket exists. Idempotent — only does the API call
 * once per server cold start.
 */
async function ensureBucket(): Promise<void> {
  if (bucketChecked) return;
  const sb = supabaseAdmin();
  const { data: existing } = await sb.storage.getBucket(BUCKET);
  if (!existing) {
    await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 8 * 1024 * 1024, // 8 MB ceiling per preview
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });
  }
  bucketChecked = true;
}

/**
 * Upload generated image bytes to Supabase Storage and return the public URL.
 *
 * Path shape: `${slug}/${batch}/${index}.${ext}` so each generation run
 * is grouped under one folder (handy when iterating).
 */
export async function uploadPreviewImage({
  slug,
  batch,
  index,
  bytes,
  mimeType,
}: {
  slug: string;
  batch: string;
  index: number;
  bytes: Uint8Array;
  mimeType: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await ensureBucket();
  } catch (err) {
    return {
      ok: false,
      error: `Bucket setup failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const ext = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
    ? "webp"
    : "jpg";
  const path = `${slug}/${batch}/${index}.${ext}`;

  const sb = supabaseAdmin();
  const { error: uploadErr } = await sb.storage.from(BUCKET).upload(path, bytes, {
    contentType: mimeType,
    upsert: true,
  });
  if (uploadErr) {
    return { ok: false, error: `Storage upload failed: ${uploadErr.message}` };
  }

  const {
    data: { publicUrl },
  } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: publicUrl };
}
