import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../lib/require-admin";
import { requireDashboard } from "../../../../../lib/require-dashboard";

/**
 * Client (or admin) action on a single content draft.
 *
 * POST body:
 *   { action: 'approve' }                          — accept this draft
 *   { action: 'request_changes', feedback: '...' } — request revision
 *
 * PATCH body (admin only — used while filling stub captions/images):
 *   { caption?: string, image_url?: string, pillar?: string,
 *     platform?: 'instagram' | 'linkedin' | 'facebook' | 'tiktok',
 *     slot_date?: 'YYYY-MM-DD' }
 *   Editing a draft resets its status to 'pending' so the client sees it
 *   fresh.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    action?: "approve" | "request_changes" | "promote_variant" | "discard_variant";
    feedback?: string;
  } | null;

  const validActions = new Set([
    "approve",
    "request_changes",
    "promote_variant",
    "discard_variant",
  ]);
  if (!body?.action || !validActions.has(body.action)) {
    return Response.json(
      { error: "action must be one of: approve, request_changes, promote_variant, discard_variant" },
      { status: 400 }
    );
  }
  if (body.action === "request_changes" && !body.feedback?.trim()) {
    return Response.json(
      { error: "Feedback text is required when requesting changes." },
      { status: 400 }
    );
  }

  const { data: draft } = await supabaseAdmin()
    .from("content_drafts")
    .select("brand_kit_id, variant_image_url, variant_caption")
    .eq("id", id)
    .maybeSingle();
  if (!draft) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  const gate = await requireDashboard({ kitId: draft.brand_kit_id });
  if (gate instanceof Response) return gate;

  if (
    (body.action === "promote_variant" || body.action === "discard_variant") &&
    !draft.variant_image_url
  ) {
    return Response.json(
      { error: "No variant exists for this draft." },
      { status: 400 }
    );
  }

  let update: Record<string, unknown>;
  if (body.action === "approve") {
    update = {
      status: "approved",
      feedback: null,
      reviewed_at: new Date().toISOString(),
    };
  } else if (body.action === "request_changes") {
    update = {
      status: "changes_requested",
      feedback: body.feedback!.trim(),
      reviewed_at: new Date().toISOString(),
    };
  } else if (body.action === "promote_variant") {
    // Swap variant into primary, clear variant slot, reset review state
    // because the image actually changed.
    update = {
      image_url: draft.variant_image_url,
      caption: draft.variant_caption ?? undefined,
      variant_image_url: null,
      variant_caption: null,
      variant_generated_at: null,
      status: "pending",
      feedback: null,
      reviewed_at: null,
    };
    // Drop caption from update if no variant caption — leave existing.
    if (!draft.variant_caption) delete update.caption;
  } else {
    update = {
      variant_image_url: null,
      variant_caption: null,
      variant_generated_at: null,
    };
  }

  const { error } = await supabaseAdmin()
    .from("content_drafts")
    .update(update)
    .eq("id", id);
  if (error) {
    return Response.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    caption?: string;
    image_url?: string;
    pillar?: string;
    platform?: "instagram" | "linkedin" | "facebook" | "tiktok";
    slot_date?: string;
  } | null;
  if (!body) {
    return Response.json({ error: "Empty body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.caption === "string") patch.caption = body.caption;
  if (typeof body.image_url === "string") patch.image_url = body.image_url;
  if (typeof body.pillar === "string") patch.pillar = body.pillar || null;
  if (typeof body.platform === "string") patch.platform = body.platform;
  if (typeof body.slot_date === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.slot_date)) {
      return Response.json(
        { error: "slot_date must be YYYY-MM-DD" },
        { status: 400 }
      );
    }
    patch.slot_date = body.slot_date;
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Editing resets review state so the client re-evaluates.
  patch.status = "pending";
  patch.feedback = null;
  patch.reviewed_at = null;

  const { error } = await supabaseAdmin()
    .from("content_drafts")
    .update(patch)
    .eq("id", id);
  if (error) {
    return Response.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );
  }
  return Response.json({ ok: true });
}
