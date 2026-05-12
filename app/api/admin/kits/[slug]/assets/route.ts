import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";
import { uploadBrandAsset } from "../../../../../../lib/asset-storage";

/**
 * Admin upload a brand asset (logo, hero image, cutout, photo library
 * reference) to the kit. Accepts multipart/form-data:
 *   file:  the image
 *   kind:  'logo' | 'hero_image' | 'cutout' | 'photo_library' | 'other'
 *   label: optional human label (stored in meta.label)
 *
 * Returns the inserted row.
 */
export const maxDuration = 30;

const ALLOWED_KINDS = new Set([
  "logo",
  "hero_image",
  "cutout",
  "photo_library",
  "other",
]);

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { slug } = await ctx.params;
  const form = await req.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  const kind = (form.get("kind") as string | null)?.trim() ?? "other";
  const label = (form.get("label") as string | null)?.trim() || null;

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return Response.json(
      { error: `kind must be one of: ${Array.from(ALLOWED_KINDS).join(", ")}` },
      { status: 400 }
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return Response.json(
      { error: "Only PNG, JPEG, WEBP, SVG, GIF supported" },
      { status: 400 }
    );
  }
  if (file.size > 12 * 1024 * 1024) {
    return Response.json({ error: "Max file size is 12 MB" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const upload = await uploadBrandAsset({
    slug,
    kind,
    bytes,
    mimeType: file.type,
  });
  if (!upload.ok) {
    return Response.json(
      { error: "Upload failed", detail: upload.error },
      { status: 500 }
    );
  }

  const { data: row, error: insertErr } = await sb
    .from("brand_kit_assets")
    .insert({
      brand_kit_id: kit.id,
      kind,
      url: upload.url,
      meta: {
        label,
        original_name: file.name,
        size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
      },
    })
    .select("id, kind, url, meta")
    .single();
  if (insertErr) {
    return Response.json(
      { error: "Failed to save asset record", detail: insertErr.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, asset: row });
}
