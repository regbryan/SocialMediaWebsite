import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";
import { generateImage } from "../../../../../../lib/image-gen";
import { buildDraftPrompt } from "../../../../../../lib/content-prompts";
import type { BrandPromptInput } from "../../../../../../lib/preview-prompts";
import { uploadPreviewImage } from "../../../../../../lib/preview-storage";
import {
  loadReferenceImages,
  referencePromptPreamble,
} from "../../../../../../lib/image-references";

/**
 * Admin trigger: generate a second image variation for a draft.
 *
 * Writes to `variant_image_url` / `variant_caption` so the existing
 * primary image stays put. The client (or admin) can then promote the
 * variant or discard it via the dashboard endpoint.
 *
 * Unlike `regenerate`, this never resets `status` / `feedback` —
 * having a variant available isn't a review-state event; choosing one is.
 */
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: draft, error: draftErr } = await sb
    .from("content_drafts")
    .select(
      "id, brand_kit_id, slot_date, platform, pillar, caption, feedback"
    )
    .eq("id", id)
    .maybeSingle();
  if (draftErr || !draft) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select(
      "id, slug, name, tagline, positioning, description, primary_platform, hq_location, colors, tone, photography_direction, content_pillars, hashtags"
    )
    .eq("id", draft.brand_kit_id)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json(
      { error: "Parent brand kit not found" },
      { status: 404 }
    );
  }

  const brand = kit as BrandPromptInput & { id: string; slug: string };

  const references = await loadReferenceImages(brand.id);
  const preamble = referencePromptPreamble(references);

  // Variant prompt: same context but explicitly ask for a different
  // composition / angle so we don't get a near-identical re-roll.
  const draftPrompt = buildDraftPrompt(brand, {
    slot_date: draft.slot_date,
    platform: draft.platform,
    pillar: draft.pillar,
    previousFeedback: draft.feedback,
    previousCaption: draft.caption,
  });
  const variantInstruction =
    "\n\nVARIANT REQUEST: This is an alternate take. Use a DIFFERENT composition, camera angle, or visual approach than the primary version of this post. Same brand, same topic, fresh look.";
  const prompt = (preamble ? `${preamble}\n${draftPrompt}` : draftPrompt) +
    variantInstruction;

  const gen = await generateImage(prompt, references);
  if (!gen.ok) {
    return Response.json(
      { error: "Generation failed", detail: gen.error },
      { status: 502 }
    );
  }

  const batchId = crypto.randomUUID();
  const upload = await uploadPreviewImage({
    slug: `${brand.slug}/content`,
    batch: batchId,
    index: 0,
    bytes: gen.bytes,
    mimeType: gen.mimeType,
  });
  if (!upload.ok) {
    return Response.json(
      { error: "Storage upload failed", detail: upload.error },
      { status: 500 }
    );
  }

  const { error: updateErr } = await sb
    .from("content_drafts")
    .update({
      variant_image_url: upload.url,
      variant_caption: gen.textNote?.trim() || null,
      variant_generated_at: new Date().toISOString(),
    })
    .eq("id", draft.id);
  if (updateErr) {
    return Response.json(
      { error: "Failed to save variant", detail: updateErr.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    id: draft.id,
    variant_image_url: upload.url,
    variant_caption_changed: Boolean(gen.textNote?.trim()),
  });
}
