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
 * Admin trigger: regenerate one content draft.
 *
 * Reads the draft, joins the parent brand kit for prompt context, asks
 * Gemini for image + caption in one call, uploads the image, and stamps
 * the new content on the draft. Resets review state to 'pending' so the
 * client re-reviews.
 *
 * If the draft has `feedback` from a prior client revision request, it's
 * baked into the prompt so the regenerated output actually responds to
 * the change request. After successful regen, feedback is cleared.
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
      "id, brand_kit_id, slot_date, platform, pillar, caption, feedback, status"
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

  // Load brand-asset references so Gemini conditions on real logos/photos.
  const references = await loadReferenceImages(brand.id);
  const preamble = referencePromptPreamble(references);

  const draftPrompt = buildDraftPrompt(brand, {
    slot_date: draft.slot_date,
    platform: draft.platform,
    pillar: draft.pillar,
    previousFeedback: draft.feedback,
    previousCaption: draft.caption,
  });
  const prompt = preamble ? `${preamble}\n${draftPrompt}` : draftPrompt;

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

  // Reset review state — client needs to re-evaluate. Editing the draft
  // already follows this same rule via the PATCH handler.
  const { error: updateErr } = await sb
    .from("content_drafts")
    .update({
      image_url: upload.url,
      caption: gen.textNote?.trim() || draft.caption,
      status: "pending",
      feedback: null,
      reviewed_at: null,
    })
    .eq("id", draft.id);
  if (updateErr) {
    return Response.json(
      { error: "Failed to save", detail: updateErr.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    id: draft.id,
    image_url: upload.url,
    caption_changed: Boolean(gen.textNote?.trim()),
  });
}
