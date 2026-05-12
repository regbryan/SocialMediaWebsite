import "server-only";
import { supabaseServer } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";
import { isAdmin } from "./require-admin";

export type DashboardUser =
  | { kind: "admin" }
  | {
      kind: "client";
      userId: string;
      email: string;
      brandIds: string[];
      slugs: string[];
    }
  | { kind: "none" };

/**
 * Resolve who's accessing the dashboard.
 *
 * Two valid identities:
 *   - admin   → password cookie via lib/admin-auth (the 2 internal admins)
 *   - client  → Supabase auth session + at least one user_brand_access row
 *
 * Admin wins if both are present (useful when an admin is impersonating
 * via magic link in dev).
 */
export async function resolveDashboardUser(): Promise<DashboardUser> {
  if (await isAdmin()) return { kind: "admin" };

  // Supabase env may not be configured (local dev). Treat as "no client
  // session available" so admin flows still work and protected routes
  // 401/302 cleanly instead of 500-ing.
  let sb;
  try {
    sb = await supabaseServer();
  } catch {
    return { kind: "none" };
  }
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { kind: "none" };

  // Brand access lives in a service-role table — load it via admin client
  // so we can join to brands.slug regardless of RLS posture.
  const adm = supabaseAdmin();
  const { data: access } = await adm
    .from("user_brand_access")
    .select("brand_id, brands(slug)")
    .eq("user_id", user.id);

  type AccessRow = { brand_id: string; brands: { slug: string } | { slug: string }[] | null };
  const rows = (access ?? []) as AccessRow[];

  const brandIds = rows.map((r) => r.brand_id);
  const slugs = rows
    .flatMap((r) =>
      Array.isArray(r.brands) ? r.brands : r.brands ? [r.brands] : []
    )
    .map((b) => b.slug)
    .filter((s): s is string => Boolean(s));

  return {
    kind: "client",
    userId: user.id,
    email: user.email ?? "",
    brandIds,
    slugs,
  };
}

/**
 * Returns true if `user` may view the kit identified by `slug`.
 * Admin always passes; client passes only if `slug` is in their access list.
 */
export function canViewKit(user: DashboardUser, slug: string): boolean {
  if (user.kind === "admin") return true;
  if (user.kind === "client") return user.slugs.includes(slug);
  return false;
}
