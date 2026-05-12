import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

/**
 * Self-service magic-link recovery for clients.
 *
 * Flow:
 *  1. Client visits /login, switches to "Sign-in link" tab, enters email
 *  2. POST here with { email }
 *  3. If a user with that email exists AND has at least one user_brand_access
 *     row, we generate a fresh magic link via Supabase admin and email it
 *     to them (Supabase's built-in SMTP delivers it).
 *  4. Either way, we return { ok: true } so we never leak which emails
 *     exist in the system.
 *
 * Admin password sign-in stays in a separate endpoint — this only handles
 * client recovery.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  const dashboardBase = (process.env.DASHBOARD_URL || "").replace(/\/$/, "");
  if (!dashboardBase) {
    // Server misconfig — surface as a server error to ops without
    // disclosing details to the requester.
    console.warn("[auth/request-link] DASHBOARD_URL not set");
    return Response.json({ ok: true });
  }

  const sb = supabaseAdmin();

  // Don't leak existence. We look up but always respond identically.
  try {
    const { data: list } = await sb.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const user = list?.users?.find(
      (u) => u.email?.toLowerCase() === email
    );
    if (!user) return Response.json({ ok: true });

    // Must have at least one brand access row — guards against using this
    // endpoint to send arbitrary auth emails to Supabase users that don't
    // belong to our dashboard product.
    const { data: access } = await sb
      .from("user_brand_access")
      .select("brand_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!access) return Response.json({ ok: true });

    // signInWithOtp via the admin REST shortcut. This causes Supabase to
    // email the magic link directly using its configured SMTP — we don't
    // touch Resend here.
    await sb.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${dashboardBase}/auth/callback` },
    });
    // The generateLink call returns the link in the response, but for the
    // recovery flow we want Supabase to actually deliver it via email.
    // signInWithOtp is the right primitive here:
    await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${dashboardBase}/auth/callback` },
    });
  } catch (err) {
    console.warn(
      "[auth/request-link] failed",
      err instanceof Error ? err.message : err
    );
    // Still return ok — don't disclose internal failures.
  }

  return Response.json({ ok: true });
}
