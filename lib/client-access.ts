import "server-only";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Resolves (or creates) the Supabase auth user for `email`, grants them
 * `client` role on `brandId`, and mints a magic link that redirects to
 * the configured dashboard.
 *
 * `next` is an optional path within the dashboard to land on after auth —
 * e.g. `/dashboard/foo/previews`. Defaults to `/dashboard`.
 *
 * Returns the magic-link URL, or null if DASHBOARD_URL is not configured.
 * Throws on user-creation or access-grant failures.
 */
export async function provisionClientAccess({
  email,
  brandId,
  next,
}: {
  email: string;
  brandId: string;
  next?: string;
}): Promise<string | null> {
  const sb = supabaseAdmin();
  const dashboardBase = (process.env.DASHBOARD_URL || "").replace(/\/$/, "");
  if (!dashboardBase) {
    console.warn("[provision] DASHBOARD_URL not set — skipping magic link");
    return null;
  }

  let userId: string | null = null;
  const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await sb.auth.admin.createUser(
      { email, email_confirm: true }
    );
    if (createErr || !created.user) {
      throw new Error(`createUser failed: ${createErr?.message ?? "unknown"}`);
    }
    userId = created.user.id;
  }

  const { error: accessErr } = await sb
    .from("user_brand_access")
    .upsert(
      { user_id: userId, brand_id: brandId, role: "client" },
      { onConflict: "user_id,brand_id" }
    );
  if (accessErr) {
    throw new Error(`user_brand_access upsert: ${accessErr.message}`);
  }

  const redirectTo = next
    ? `${dashboardBase}/auth/callback?next=${encodeURIComponent(next)}`
    : `${dashboardBase}/auth/callback`;
  const { data: link, error: linkErr } = await sb.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });
  if (linkErr || !link?.properties?.action_link) {
    throw new Error(`generateLink: ${linkErr?.message ?? "no action_link"}`);
  }
  return link.properties.action_link;
}
