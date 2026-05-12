import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../../lib/require-admin";
import { notifyClient } from "../../../../../../../lib/notify-client";
import { maxBatchDays, type Tier } from "../../../../../../../lib/tier-limits";

/**
 * Admin action: generate a 30-day batch of content drafts for a kit.
 *
 * Stub mode (now):
 *   Creates 30 placeholder content_drafts dated tomorrow through 30 days
 *   out, distributed across the kit's content pillars when available, and
 *   left with a TODO caption + null image_url. Admin (or future generator)
 *   fills in the real content.
 *
 * Real mode (later):
 *   Same endpoint becomes the place where the generator persists outputs.
 *   No upstream code change.
 *
 * Body (optional):
 *   { days?: number, startDate?: 'YYYY-MM-DD', platform?: 'instagram' | ... }
 *
 * Guard: kit must have kit_approved_at set (client signed off on previews).
 * Returns 409 if not approved.
 */
type Pillar = { name?: string; pct?: number };

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    days?: number;
    startDate?: string;
    platform?: "instagram" | "linkedin" | "facebook" | "tiktok";
  };

  const requestedDays = Math.min(Math.max(body.days ?? 30, 1), 60);
  const platform = body.platform ?? "instagram";
  const startDate = body.startDate
    ? new Date(body.startDate)
    : (() => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return t;
      })();
  if (Number.isNaN(startDate.getTime())) {
    return Response.json(
      { error: "Invalid startDate (use YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, slug, kit_approved_at, content_pillars, primary_platform, tier")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }
  if (!kit.kit_approved_at) {
    return Response.json(
      { error: "Brand kit must be approved before generating content." },
      { status: 409 }
    );
  }

  // Cap batch size by tier. Starter 20, Growth 28, Agency / null 60.
  const tier = (kit.tier as Tier) ?? null;
  const tierMax = maxBatchDays(tier);
  const days = Math.min(requestedDays, tierMax);
  const capped = days < requestedDays;

  const pillars: string[] = Array.isArray(kit.content_pillars)
    ? (kit.content_pillars as Pillar[])
        .map((p) => p.name?.trim())
        .filter((n): n is string => Boolean(n))
    : [];

  const batchId = crypto.randomUUID();
  const rows = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const slotDate = d.toISOString().slice(0, 10);
    const pillar = pillars.length > 0 ? pillars[i % pillars.length] : null;
    return {
      brand_kit_id: kit.id,
      slot_date: slotDate,
      platform: platform || kit.primary_platform || "instagram",
      pillar,
      caption: null,
      image_url: null,
      status: "pending" as const,
      generated_batch_id: batchId,
    };
  });

  // Replace any prior batch so the admin always sees one active calendar.
  await sb.from("content_drafts").delete().eq("brand_kit_id", kit.id);

  const { data: inserted, error: insertErr } = await sb
    .from("content_drafts")
    .insert(rows)
    .select("id, slot_date");
  if (insertErr) {
    return Response.json(
      { error: "Failed to create drafts", detail: insertErr.message },
      { status: 500 }
    );
  }

  await sb
    .from("brand_kits")
    .update({
      last_batch_generated_at: new Date().toISOString(),
      last_batch_id: batchId,
    })
    .eq("id", kit.id);

  // Notify the client their content batch is ready for review.
  const count = inserted?.length ?? 0;
  void notifyClient({
    slug,
    subject: `Your ${count}-day content plan is ready to review`,
    body: `We just produced ${count} posts for your upcoming month. Approve the ones that work, request changes on the rest, and we'll iterate fast.`,
    next: `/dashboard/${slug}/content`,
  }).catch((err) =>
    console.warn("[admin/content/generate] notify failed", err)
  );

  return Response.json({
    ok: true,
    batchId,
    count,
    tier,
    tierMax,
    capped,
    requestedDays,
  });
}
