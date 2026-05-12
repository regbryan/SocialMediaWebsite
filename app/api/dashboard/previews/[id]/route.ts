import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { requireDashboard } from "../../../../../lib/require-dashboard";

/**
 * Client (or admin) action on a single preview asset.
 *
 * Body shape:
 *   { action: 'approve' }                         — accept this preview
 *   { action: 'request_changes', feedback: '...' } — request revision
 *
 * Auth: admin via password cookie for now. When the client Supabase-auth
 * gate lands, this same handler will also accept user sessions with
 * user_brand_access on the parent kit.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    action?: "approve" | "request_changes";
    feedback?: string;
  } | null;

  if (body?.action !== "approve" && body?.action !== "request_changes") {
    return Response.json(
      { error: "action must be 'approve' or 'request_changes'" },
      { status: 400 }
    );
  }
  if (body.action === "request_changes" && !body.feedback?.trim()) {
    return Response.json(
      { error: "Feedback text is required when requesting changes." },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();
  const { data: asset, error: lookupErr } = await sb
    .from("brand_kit_assets")
    .select("id, kind, brand_kit_id")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr || !asset) {
    return Response.json({ error: "Preview not found" }, { status: 404 });
  }
  if (asset.kind !== "preview") {
    return Response.json(
      { error: "Asset is not a preview" },
      { status: 400 }
    );
  }

  const gate = await requireDashboard({ kitId: asset.brand_kit_id });
  if (gate instanceof Response) return gate;

  const update =
    body.action === "approve"
      ? {
          status: "approved" as const,
          feedback: null,
          reviewed_at: new Date().toISOString(),
        }
      : {
          status: "changes_requested" as const,
          feedback: body.feedback!.trim(),
          reviewed_at: new Date().toISOString(),
        };

  const { error: updateErr } = await sb
    .from("brand_kit_assets")
    .update(update)
    .eq("id", id);
  if (updateErr) {
    return Response.json(
      { error: "Update failed", detail: updateErr.message },
      { status: 500 }
    );
  }

  // If client clicks "approve" on a preview, also clear any prior kit-level
  // approval if a sibling is still pending or has changes_requested.
  if (body.action === "request_changes") {
    await sb
      .from("brand_kits")
      .update({ kit_approved_at: null })
      .eq("id", asset.brand_kit_id);
  }

  return Response.json({ ok: true });
}
