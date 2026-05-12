import "server-only";
import { supabaseAdmin } from "./supabase-admin";
import { sendEmail, dashboardBaseUrl } from "./email";

type PreviewFeedback = {
  id: string;
  slot_label: string | null;
  feedback: string | null;
  reviewed_at: string | null;
  brand_kit_id: string;
};

type DraftFeedback = {
  id: string;
  slot_date: string;
  pillar: string | null;
  feedback: string | null;
  reviewed_at: string | null;
  brand_kit_id: string;
};

type KitLookup = Record<string, { slug: string; name: string }>;

/**
 * Build + send the daily feedback digest to the agency owner.
 *
 * Pulls all preview and content-draft rows where status='changes_requested'
 * AND notified_at IS NULL, groups them by brand, sends ONE email, and
 * stamps notified_at on every included row so we never double-send.
 *
 * Idempotent. Safe to call from both the Vercel cron and the manual
 * "Send digest now" button.
 */
export async function sendFeedbackDigest(): Promise<{
  ok: boolean;
  sent: boolean;
  reason?: string;
  previewCount?: number;
  draftCount?: number;
  brandCount?: number;
  error?: string;
}> {
  const to = process.env.OWNER_NOTIFY_EMAIL;
  if (!to) {
    return { ok: true, sent: false, reason: "OWNER_NOTIFY_EMAIL unset" };
  }

  const sb = supabaseAdmin();

  const [{ data: previewRows, error: previewErr }, { data: draftRows, error: draftErr }] =
    await Promise.all([
      sb
        .from("brand_kit_assets")
        .select("id, slot_label, feedback, reviewed_at, brand_kit_id")
        .eq("kind", "preview")
        .eq("status", "changes_requested")
        .is("notified_at", null)
        .order("reviewed_at", { ascending: false }),
      sb
        .from("content_drafts")
        .select("id, slot_date, pillar, feedback, reviewed_at, brand_kit_id")
        .eq("status", "changes_requested")
        .is("notified_at", null)
        .order("reviewed_at", { ascending: false }),
    ]);

  if (previewErr) return { ok: false, sent: false, error: previewErr.message };
  if (draftErr) return { ok: false, sent: false, error: draftErr.message };

  const previews = (previewRows ?? []) as PreviewFeedback[];
  const drafts = (draftRows ?? []) as DraftFeedback[];

  if (previews.length === 0 && drafts.length === 0) {
    return { ok: true, sent: false, reason: "no unsent feedback" };
  }

  // Resolve kit metadata for the rows in question.
  const kitIds = Array.from(
    new Set([
      ...previews.map((p) => p.brand_kit_id),
      ...drafts.map((d) => d.brand_kit_id),
    ])
  );
  const { data: kitsData } = await sb
    .from("brand_kits")
    .select("id, slug, name")
    .in("id", kitIds);

  const kits: KitLookup = {};
  for (const k of (kitsData ?? []) as Array<{
    id: string;
    slug: string;
    name: string;
  }>) {
    kits[k.id] = { slug: k.slug, name: k.name };
  }

  const base = dashboardBaseUrl();
  const { html, text } = renderDigest({ previews, drafts, kits, base });

  const result = await sendEmail({
    to,
    subject: digestSubject(previews.length + drafts.length),
    text,
    html,
  });
  if (!result.ok) {
    return { ok: false, sent: false, error: result.error };
  }

  // Stamp notified_at on every row we included.
  const now = new Date().toISOString();
  if (previews.length > 0) {
    await sb
      .from("brand_kit_assets")
      .update({ notified_at: now })
      .in(
        "id",
        previews.map((p) => p.id)
      );
  }
  if (drafts.length > 0) {
    await sb
      .from("content_drafts")
      .update({ notified_at: now })
      .in(
        "id",
        drafts.map((d) => d.id)
      );
  }

  return {
    ok: true,
    sent: true,
    previewCount: previews.length,
    draftCount: drafts.length,
    brandCount: Object.keys(kits).length,
  };
}

function digestSubject(total: number): string {
  return `${total} client feedback item${total === 1 ? "" : "s"} awaiting changes`;
}

function renderDigest({
  previews,
  drafts,
  kits,
  base,
}: {
  previews: PreviewFeedback[];
  drafts: DraftFeedback[];
  kits: KitLookup;
  base: string;
}): { html: string; text: string } {
  // Group both lists by brand_kit_id
  type Group = {
    name: string;
    slug: string;
    previews: PreviewFeedback[];
    drafts: DraftFeedback[];
  };
  const byKit: Record<string, Group> = {};
  for (const p of previews) {
    const k = kits[p.brand_kit_id];
    if (!k) continue;
    byKit[p.brand_kit_id] ??= {
      name: k.name,
      slug: k.slug,
      previews: [],
      drafts: [],
    };
    byKit[p.brand_kit_id].previews.push(p);
  }
  for (const d of drafts) {
    const k = kits[d.brand_kit_id];
    if (!k) continue;
    byKit[d.brand_kit_id] ??= {
      name: k.name,
      slug: k.slug,
      previews: [],
      drafts: [],
    };
    byKit[d.brand_kit_id].drafts.push(d);
  }

  const groups = Object.values(byKit);
  const lines: string[] = [];
  const htmlSections: string[] = [];

  lines.push(
    `${previews.length} preview change request${previews.length === 1 ? "" : "s"} and ${drafts.length} content draft change request${drafts.length === 1 ? "" : "s"} since the last digest.`
  );
  lines.push("");

  for (const g of groups) {
    const previewsLink = `${base}/dashboard/${g.slug}/previews`;
    const contentLink = `${base}/dashboard/${g.slug}/content`;
    lines.push(`— ${g.name} —`);
    let hSec = `<h3 style="margin:24px 0 8px;font-size:16px;">${escape(g.name)}</h3>`;

    if (g.previews.length) {
      lines.push(`Previews (${previewsLink}):`);
      hSec += `<p style="margin:4px 0 6px;font-size:13px;color:#555;"><a href="${previewsLink}">Open previews →</a></p><ul style="margin:0 0 12px;padding-left:18px;">`;
      for (const p of g.previews) {
        const label = p.slot_label || "(untitled)";
        const fb = p.feedback || "(no note)";
        lines.push(`  • ${label}: ${fb}`);
        hSec += `<li style="margin:4px 0;"><strong>${escape(label)}:</strong> ${escape(fb)}</li>`;
      }
      hSec += "</ul>";
    }

    if (g.drafts.length) {
      lines.push(`Content drafts (${contentLink}):`);
      hSec += `<p style="margin:4px 0 6px;font-size:13px;color:#555;"><a href="${contentLink}">Open content →</a></p><ul style="margin:0 0 12px;padding-left:18px;">`;
      for (const d of g.drafts) {
        const fb = d.feedback || "(no note)";
        const pill = d.pillar ? ` · ${d.pillar}` : "";
        lines.push(`  • ${d.slot_date}${pill}: ${fb}`);
        hSec += `<li style="margin:4px 0;"><strong>${escape(d.slot_date)}${escape(pill)}:</strong> ${escape(fb)}</li>`;
      }
      hSec += "</ul>";
    }

    lines.push("");
    htmlSections.push(hSec);
  }

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;color:#1a1a1a;">
<h2 style="margin:0 0 12px;font-size:20px;">SocialPulse client feedback</h2>
<p style="margin:0 0 16px;color:#444;">${escape(lines[0])}</p>
${htmlSections.join("")}
<p style="font-size:12px;color:#888;margin-top:24px;">Daily digest. Items already flagged are marked sent and won't appear again.</p>
</div>`;

  return { html, text: lines.join("\n") };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
