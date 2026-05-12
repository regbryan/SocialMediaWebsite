import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";

/**
 * Admin trigger: pin one brand asset as the primary for its kind.
 *
 * `loadReferenceImages` picks the most-recent asset of each kind by
 * default — fine when there's one logo on file, useless when the brand
 * has 4 logo variations. Setting one as primary makes `image-gen`
 * deterministically use that exact file across previews + content
 * regenerates.
 *
 * Stored on `brand_kit_assets.meta.primary = true`. Exactly one asset
 * per (kit, kind) can be primary at a time — POST clears the flag on
 * siblings before stamping the new one.
 *
 * Refusing the "preview" kind because previews are generated output, not
 * brand source material, and the priority isn't meaningful there.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: target, error: lookupErr } = await sb
    .from("brand_kit_assets")
    .select("id, brand_kit_id, kind, meta")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !target) {
    return Response.json({ error: "Asset not found" }, { status: 404 });
  }
  if (target.kind === "preview") {
    return Response.json(
      { error: "Previews can't be marked primary." },
      { status: 400 }
    );
  }

  // Clear primary flag on every other asset of this kind in this kit.
  // jsonb_set + filter would be cleaner but two cheap UPDATEs cover both
  // "remove from siblings" and "set on target" without round-tripping.
  const { data: siblings } = await sb
    .from("brand_kit_assets")
    .select("id, meta")
    .eq("brand_kit_id", target.brand_kit_id)
    .eq("kind", target.kind)
    .neq("id", id);

  for (const s of siblings ?? []) {
    const meta = (s.meta ?? {}) as Record<string, unknown>;
    if (meta.primary) {
      const { primary: _omit, ...rest } = meta;
      void _omit;
      await sb.from("brand_kit_assets").update({ meta: rest }).eq("id", s.id);
    }
  }

  const newMeta = { ...((target.meta ?? {}) as Record<string, unknown>), primary: true };
  const { error: updateErr } = await sb
    .from("brand_kit_assets")
    .update({ meta: newMeta })
    .eq("id", target.id);
  if (updateErr) {
    return Response.json(
      { error: "Failed to set primary", detail: updateErr.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, id, kind: target.kind });
}

/**
 * Unpin — clears the primary flag from this asset. `loadReferenceImages`
 * will fall back to most-recent-of-kind for the next generation.
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: target } = await sb
    .from("brand_kit_assets")
    .select("meta")
    .eq("id", id)
    .maybeSingle();
  if (!target) {
    return Response.json({ error: "Asset not found" }, { status: 404 });
  }

  const meta = (target.meta ?? {}) as Record<string, unknown>;
  const { primary: _omit, ...rest } = meta;
  void _omit;

  const { error } = await sb
    .from("brand_kit_assets")
    .update({ meta: rest })
    .eq("id", id);
  if (error) {
    return Response.json(
      { error: "Failed to unpin", detail: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
