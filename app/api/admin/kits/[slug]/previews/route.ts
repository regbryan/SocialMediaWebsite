import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";
import { notifyClient } from "../../../../../../lib/notify-client";

/**
 * Admin action: attach preview designs to a brand kit.
 *
 * Body shape:
 *   { previews: [{ url, slot_label?, notes? }] }
 *
 * In the current stub mode, the admin pastes URLs (Figma exports, Canva
 * shares, manually-generated images, etc). When the real image-gen pipeline
 * is wired in, this same endpoint becomes the destination for generator
 * output — no change to the upstream code.
 *
 * Replaces any existing preview assets for the kit so the admin can iterate
 * without manual cleanup.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    previews?: Array<{ url?: string; slot_label?: string; notes?: string }>;
  } | null;

  const previews = (body?.previews ?? []).filter(
    (p) => typeof p.url === "string" && p.url.trim().length > 0
  );
  if (previews.length === 0) {
    return Response.json(
      { error: "At least one preview URL is required." },
      { status: 400 }
    );
  }
  if (previews.length > 12) {
    return Response.json(
      { error: "Maximum 12 previews at a time." },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }

  // Clear out prior previews so the admin's latest set is the source of truth.
  await sb
    .from("brand_kit_assets")
    .delete()
    .eq("brand_kit_id", kit.id)
    .eq("kind", "preview");

  const rows = previews.map((p, i) => ({
    brand_kit_id: kit.id,
    kind: "preview" as const,
    url: p.url!.trim(),
    slot_label: p.slot_label?.trim() || `Style ${String.fromCharCode(65 + i)}`,
    status: "pending" as const,
    meta: p.notes ? { notes: p.notes } : {},
  }));

  const { data: inserted, error: insertErr } = await sb
    .from("brand_kit_assets")
    .insert(rows)
    .select("id, slot_label, url");
  if (insertErr) {
    return Response.json(
      { error: "Failed to save previews", detail: insertErr.message },
      { status: 500 }
    );
  }

  // Stamp the kit so the admin can see at a glance which kits have previews.
  // We also clear any prior client approval since previews changed.
  await sb
    .from("brand_kits")
    .update({
      previews_generated_at: new Date().toISOString(),
      kit_approved_at: null,
    })
    .eq("id", kit.id);

  // Email the client a one-click sign-in link to the previews page.
  // Fire-and-forget — never blocks the admin response.
  const count = inserted?.length ?? 0;
  void notifyClient({
    slug,
    subject: `${count} preview design${count === 1 ? "" : "s"} ready for your review`,
    body: `Your team uploaded ${count} preview design${
      count === 1 ? "" : "s"
    } for you to review. Approve the ones you love, or request changes on any that need work — we'll iterate.`,
    next: `/dashboard/${slug}/previews`,
  }).catch((err) => console.warn("[admin/previews] notify failed", err));

  return Response.json({ ok: true, count, previews: inserted ?? [] });
}
