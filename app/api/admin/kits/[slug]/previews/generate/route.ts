import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../../lib/require-admin";
import { generateImage } from "../../../../../../../lib/image-gen";
import {
  buildPreviewPromptSet,
  type BrandPromptInput,
} from "../../../../../../../lib/preview-prompts";
import { uploadPreviewImage } from "../../../../../../../lib/preview-storage";
import { notifyClient } from "../../../../../../../lib/notify-client";
import {
  loadReferenceImages,
  referencePromptPreamble,
} from "../../../../../../../lib/image-references";

/**
 * Admin trigger: generate 4 preview designs for a brand kit using
 * Gemini 3 Flash Image, upload each to Supabase Storage, and replace
 * the current preview set.
 *
 * Synchronous. ~25–40s end-to-end for 4 previews (Gemini calls in
 * parallel, each ~6–10s).
 *
 * If any individual preview fails, the successful ones still persist —
 * the response includes counts of generated vs failed.
 */
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { slug } = await ctx.params;
  const sb = supabaseAdmin();

  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select(
      "id, name, tagline, positioning, description, primary_platform, hq_location, colors, tone, photography_direction, content_pillars"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }

  const brand = kit as BrandPromptInput & { id: string };
  const prompts = buildPreviewPromptSet(brand);

  // Load brand-asset references once and reuse across all 4 generations.
  // Each preview gets the same reference set so the four styles share a
  // consistent brand foundation.
  const references = await loadReferenceImages(brand.id);
  const preamble = referencePromptPreamble(references);

  const batchId = crypto.randomUUID();

  // Fan-out generation in parallel. One slow upstream shouldn't drag the
  // others.
  const results = await Promise.all(
    prompts.map(async (p, i) => {
      const fullPrompt = preamble ? `${preamble}\n${p.prompt}` : p.prompt;
      const gen = await generateImage(fullPrompt, references);
      if (!gen.ok) return { ok: false as const, index: i, label: p.label, error: gen.error };

      const upload = await uploadPreviewImage({
        slug,
        batch: batchId,
        index: i,
        bytes: gen.bytes,
        mimeType: gen.mimeType,
      });
      if (!upload.ok) {
        return { ok: false as const, index: i, label: p.label, error: upload.error };
      }
      return {
        ok: true as const,
        index: i,
        label: p.label,
        url: upload.url,
        prompt: p.prompt,
      };
    })
  );

  const successes = results.filter((r) => r.ok);
  const failures = results.filter((r) => !r.ok);

  if (successes.length === 0) {
    return Response.json(
      {
        error: "All previews failed to generate.",
        failures: failures.map((f) => ({ index: f.index, error: f.error })),
      },
      { status: 502 }
    );
  }

  // Replace existing preview set with the new batch.
  await sb
    .from("brand_kit_assets")
    .delete()
    .eq("brand_kit_id", brand.id)
    .eq("kind", "preview");

  const rows = successes.map((s) => ({
    brand_kit_id: brand.id,
    kind: "preview" as const,
    url: s.url,
    slot_label: s.label,
    status: "pending" as const,
    meta: {
      generated_by: "gemini",
      batch_id: batchId,
      prompt: s.prompt,
    },
  }));

  const { error: insertErr } = await sb.from("brand_kit_assets").insert(rows);
  if (insertErr) {
    return Response.json(
      { error: "Failed to save previews", detail: insertErr.message },
      { status: 500 }
    );
  }

  await sb
    .from("brand_kits")
    .update({
      previews_generated_at: new Date().toISOString(),
      kit_approved_at: null,
    })
    .eq("id", brand.id);

  // Notify the client previews are ready — same pattern as upload route.
  void notifyClient({
    slug,
    subject: `${successes.length} preview design${successes.length === 1 ? "" : "s"} ready for your review`,
    body: `We just generated ${successes.length} preview design${
      successes.length === 1 ? "" : "s"
    } for you to review. Approve the ones you love, or request changes on any that need work.`,
    next: `/dashboard/${slug}/previews`,
  }).catch((err) =>
    console.warn("[admin/previews/generate] notify failed", err)
  );

  return Response.json({
    ok: true,
    generated: successes.length,
    failed: failures.length,
    failures: failures.map((f) => ({
      index: f.index,
      label: f.label,
      error: f.error,
    })),
    batchId,
  });
}
