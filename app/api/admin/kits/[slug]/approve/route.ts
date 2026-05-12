import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";
import { provisionClientAccess } from "../../../../../../lib/client-access";
import { sendEmail } from "../../../../../../lib/email";

/**
 * Admin action: approve a self-serve brand kit.
 *
 * Side effects:
 * - Looks up the invite email tied to this slug.
 * - Provisions Supabase auth user + grants user_brand_access.
 * - Mints a magic link that lands on the configured dashboard.
 * - Stamps brand_kits.review_status = 'approved', reviewed_at = now.
 *
 * Returns the magic link so the admin can hand it off to the client
 * (or just confirm it generated).
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { slug } = await ctx.params;
  const sb = supabaseAdmin();

  // Find the brand kit + the brand mirror row (provisioning needs brand_id).
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, slug, review_status")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }
  if (kit.review_status === "approved") {
    return Response.json({ error: "Already approved" }, { status: 409 });
  }

  const { data: brandRow, error: brandErr } = await sb
    .from("brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (brandErr || !brandRow) {
    return Response.json(
      { error: "Brand mirror row missing — re-run submit" },
      { status: 500 }
    );
  }

  // Pull the contact email from the invite tied to this slug. We look up the
  // most recently used self-serve invite as the source of truth.
  const { data: invite, error: inviteErr } = await sb
    .from("brand_kit_invites")
    .select("email")
    .eq("slug", slug)
    .eq("source", "self-serve")
    .not("used_at", "is", null)
    .order("used_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (inviteErr || !invite) {
    return Response.json(
      { error: "No used self-serve invite found for this slug" },
      { status: 404 }
    );
  }

  let magicLink: string | null = null;
  try {
    magicLink = await provisionClientAccess({
      email: invite.email,
      brandId: brandRow.id,
      next: `/dashboard/${slug}/previews`,
    });
  } catch (err) {
    console.error("[admin/approve] provisioning failed", err);
    return Response.json(
      {
        error: "Failed to provision client access",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  await sb
    .from("brand_kits")
    .update({
      review_status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", kit.id);

  // Email the client a single-click sign-in link. Fire-and-forget — admin
  // still gets the magicLink in the response in case manual delivery is
  // preferred.
  if (magicLink) {
    void sendEmail({
      to: invite.email,
      subject: "Welcome to SocialPulse — your dashboard is ready",
      text: `Your brand kit was just approved. Open your dashboard to review the first round of preview designs.\n\nSign in:\n${magicLink}\n\nThis link expires in 1 hour.`,
      html: `<p>Your brand kit was just approved. Open your dashboard to review the first round of preview designs.</p>
<p><a href="${magicLink}" style="display:inline-block;background:#8b5cff;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Open my dashboard</a></p>
<p style="font-size:12px;color:#9999a6;">This link expires in 1 hour.</p>`,
    }).catch((err) =>
      console.warn("[admin/approve] email send failed", err)
    );
  }

  return Response.json({ ok: true, slug, dashboardUrl: magicLink });
}
