import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../lib/require-admin";
import { deleteBrandAssetByUrl } from "../../../../../lib/asset-storage";

/**
 * Admin remove a brand asset by id. Hard-deletes both the storage object
 * (best-effort) and the DB row. Preview assets (kind: 'preview') are
 * blocked here — those are managed via the previews endpoint to keep
 * generation lineage intact.
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const sb = supabaseAdmin();
  const { data: asset, error: lookupErr } = await sb
    .from("brand_kit_assets")
    .select("id, kind, url")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !asset) {
    return Response.json({ error: "Asset not found" }, { status: 404 });
  }
  if (asset.kind === "preview") {
    return Response.json(
      { error: "Preview assets are managed via the previews endpoint." },
      { status: 400 }
    );
  }

  // Best-effort storage delete first, then DB row.
  if (typeof asset.url === "string") {
    await deleteBrandAssetByUrl(asset.url).catch(() => {});
  }

  const { error: delErr } = await sb
    .from("brand_kit_assets")
    .delete()
    .eq("id", asset.id);
  if (delErr) {
    return Response.json(
      { error: "Failed to delete record", detail: delErr.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}
