import "server-only";
import { supabaseAdmin } from "./supabase-admin";
import { provisionClientAccess } from "./client-access";
import { sendEmail, dashboardBaseUrl } from "./email";

type NotifyArgs = {
  slug: string;
  subject: string;
  body: string;
  /** Deep-link target inside the dashboard, e.g. `/dashboard/foo/previews`.
   * Falls back to `/dashboard/${slug}`. */
  next?: string;
};

/**
 * Sends a transactional email to the client tied to a brand kit, with a
 * one-click magic link that lands them on the relevant dashboard surface.
 *
 * Idempotent: re-running issues a fresh magic link each time. Safe to call
 * fire-and-forget — never throws.
 *
 * Returns { ok: true, sent: true } when the email actually went out,
 * { ok: true, sent: false, reason } when it was skipped (missing config,
 * no email on file, etc.), or { ok: false, error } on hard failures the
 * caller may want to log.
 */
export async function notifyClient({
  slug,
  subject,
  body,
  next,
}: NotifyArgs): Promise<
  | { ok: true; sent: boolean; reason?: string }
  | { ok: false; error: string }
> {
  const sb = supabaseAdmin();

  const { data: brand } = await sb
    .from("brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!brand) {
    return { ok: true, sent: false, reason: "no brand row" };
  }

  // Pull contact email from the most recent invite that named this slug.
  // For admin-issued kits (no self-serve invite), we fall back to any
  // invite row regardless of source.
  const { data: invite } = await sb
    .from("brand_kit_invites")
    .select("email")
    .eq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!invite?.email) {
    return { ok: true, sent: false, reason: "no contact email on file" };
  }

  const nextPath = next ?? `/dashboard/${slug}`;
  let magicLink: string | null = null;
  try {
    magicLink = await provisionClientAccess({
      email: invite.email,
      brandId: brand.id,
      next: nextPath,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const url = magicLink || `${dashboardBaseUrl()}${nextPath}`;
  const text = `${body}\n\nOpen your dashboard:\n${url}\n\nThis link signs you in automatically and expires in 1 hour.`;
  const html = `<p>${body.replace(/\n/g, "<br>")}</p>
<p><a href="${url}" style="display:inline-block;background:#8b5cff;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Open your dashboard</a></p>
<p style="font-size:12px;color:#9999a6;">This link signs you in automatically and expires in 1 hour. If the button doesn't work, paste this URL into your browser:<br><span style="word-break:break-all;">${url}</span></p>`;

  const result = await sendEmail({
    to: invite.email,
    subject,
    text,
    html,
  });
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, sent: true };
}
