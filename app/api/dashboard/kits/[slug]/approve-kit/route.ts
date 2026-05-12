import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireDashboard } from "../../../../../../lib/require-dashboard";

/**
 * Client (or admin) sign-off on the brand kit.
 *
 * Requires every preview to be 'approved'. If any preview is still
 * 'pending' or 'changes_requested', returns 409 with the count so the
 * UI can prompt the client to finish reviewing.
 *
 * Stamps brand_kits.kit_approved_at. This is the gate that the future
 * content-generation pipeline will check before producing a 30-day plan.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const gate = await requireDashboard({ slug });
  if (gate instanceof Response) return gate;

  const sb = supabaseAdmin();

  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }

  const { data: previews, error: previewErr } = await sb
    .from("brand_kit_assets")
    .select("id, status")
    .eq("brand_kit_id", kit.id)
    .eq("kind", "preview");
  if (previewErr) {
    return Response.json(
      { error: "Failed to load previews", detail: previewErr.message },
      { status: 500 }
    );
  }
  if (!previews || previews.length === 0) {
    return Response.json(
      { error: "No previews to approve yet." },
      { status: 409 }
    );
  }
  const notApproved = previews.filter((p) => p.status !== "approved");
  if (notApproved.length > 0) {
    return Response.json(
      {
        error: `${notApproved.length} preview${
          notApproved.length === 1 ? "" : "s"
        } still need to be reviewed.`,
        remaining: notApproved.length,
      },
      { status: 409 }
    );
  }

  const { error: updateErr } = await sb
    .from("brand_kits")
    .update({ kit_approved_at: new Date().toISOString() })
    .eq("id", kit.id);
  if (updateErr) {
    return Response.json(
      { error: "Failed to approve kit", detail: updateErr.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, slug });
}
