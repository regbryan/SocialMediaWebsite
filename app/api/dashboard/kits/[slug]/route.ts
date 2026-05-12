import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { requireDashboard } from "../../../../../lib/require-dashboard";

/**
 * Update editable fields on a brand kit.
 *
 * Allowed (client + admin):
 *   tagline, positioning, description, mission, colors,
 *   tone.{keywords, dos, donts, vocab_use, vocab_avoid},
 *   audiences, content_pillars, photography_direction,
 *   compliance_footer, hashtags, contact_phone, preferred_channel
 *
 * NOT allowed (admin-only path, separate endpoint):
 *   slug, name, primary_platform, ig_handle, review_status,
 *   kit_approved_at, onboarding_status
 *
 * Editing any field does NOT auto-regenerate previews or content drafts;
 * the admin can trigger that explicitly afterward.
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const gate = await requireDashboard({ slug });
  if (gate instanceof Response) return gate;
  const isAdmin = gate.user.kind === "admin";

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Empty body" }, { status: 400 });
  }

  // Fields any kit owner can edit (client + admin).
  const allowed = new Set([
    "tagline",
    "positioning",
    "description",
    "mission",
    "colors",
    "tone",
    "audiences",
    "content_pillars",
    "photography_direction",
    "compliance_footer",
    "hashtags",
    "contact_phone",
    "preferred_channel",
    "ig_handle",
    "website_url",
    "hq_location",
    "founded_year",
    "founder_names",
    "service_area",
  ]);
  // Admin-only — `tier` is effectively a billing change. If a client sends
  // it, we silently strip rather than 403, so the rest of their patch still
  // applies.
  const adminOnly = new Set(["tier"]);

  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (allowed.has(key)) patch[key] = value;
    else if (adminOnly.has(key) && isAdmin) patch[key] = value;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No editable fields in body" }, { status: 400 });
  }

  // Light validation for the structured fields.
  if (
    "preferred_channel" in patch &&
    patch.preferred_channel !== "email" &&
    patch.preferred_channel !== "sms"
  ) {
    return Response.json(
      { error: "preferred_channel must be 'email' or 'sms'" },
      { status: 400 }
    );
  }
  if ("tier" in patch) {
    const t = patch.tier;
    if (t !== null && t !== "starter" && t !== "growth" && t !== "agency") {
      return Response.json(
        { error: "tier must be 'starter', 'growth', 'agency', or null" },
        { status: 400 }
      );
    }
  }

  // Normalize / lightly validate the business-basics fields.
  if ("ig_handle" in patch && typeof patch.ig_handle === "string") {
    const h = patch.ig_handle.trim().replace(/^@+/, "").toLowerCase();
    if (h && !/^[a-z0-9._]{1,30}$/.test(h)) {
      return Response.json(
        { error: "IG handle must be 1–30 chars of letters, numbers, dots, underscores" },
        { status: 400 }
      );
    }
    patch.ig_handle = h || null;
  }
  if ("website_url" in patch && typeof patch.website_url === "string") {
    const u = patch.website_url.trim();
    if (u && !/^https?:\/\/\S+\.\S+/.test(u)) {
      return Response.json(
        { error: "Website URL must start with http:// or https://" },
        { status: 400 }
      );
    }
    patch.website_url = u || null;
  }
  if ("founded_year" in patch) {
    const v = patch.founded_year;
    if (v === "" || v === null || v === undefined) {
      patch.founded_year = null;
    } else {
      const n = Number(v);
      const thisYear = new Date().getFullYear();
      if (!Number.isInteger(n) || n < 1800 || n > thisYear + 1) {
        return Response.json(
          { error: `Founded year must be between 1800 and ${thisYear + 1}` },
          { status: 400 }
        );
      }
      patch.founded_year = n;
    }
  }
  if ("founder_names" in patch && Array.isArray(patch.founder_names)) {
    patch.founder_names = (patch.founder_names as unknown[])
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length > 0);
  }
  if ("service_area" in patch && Array.isArray(patch.service_area)) {
    patch.service_area = (patch.service_area as unknown[])
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length > 0);
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("brand_kits").update(patch).eq("slug", slug);
  if (error) {
    return Response.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, updated: Object.keys(patch) });
}
