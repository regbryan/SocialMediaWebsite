import "server-only";
import { resolveDashboardUser, type DashboardUser } from "./dashboard-auth";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Auth gate for endpoints under /api/dashboard/* and the per-kit admin
 * endpoints that clients are also allowed to call (per-preview review,
 * per-draft review, kit approval).
 *
 * Returns either { user } if authorized, or a Response (401/403) the
 * caller should return immediately.
 *
 * If `kitId` is provided, the user is also checked for access to that
 * specific brand kit (admin always passes; client must have a row in
 * user_brand_access for the kit's brand).
 *
 * If `slug` is provided instead, this resolves the kit id by slug first.
 */
export async function requireDashboard({
  kitId,
  slug,
}: {
  kitId?: string;
  slug?: string;
} = {}): Promise<{ user: DashboardUser } | Response> {
  const user = await resolveDashboardUser();
  if (user.kind === "none") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.kind === "admin") return { user };

  // Client — confirm access to the target kit if one was named.
  if (!kitId && !slug) return { user };

  let targetKitId = kitId;
  if (!targetKitId && slug) {
    const { data } = await supabaseAdmin()
      .from("brand_kits")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    targetKitId = data.id;
  }

  // brand_kits.id maps to brands.id via the slug mirror — they share a slug
  // but use different row ids. Look up the brand row by slug to get the id
  // user_brand_access references.
  if (slug) {
    const { data: brand } = await supabaseAdmin()
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!brand || !user.brandIds.includes(brand.id)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return { user };
  }

  // When given a kit id directly, resolve its slug then check brands.
  if (kitId) {
    const { data: kit } = await supabaseAdmin()
      .from("brand_kits")
      .select("slug")
      .eq("id", kitId)
      .maybeSingle();
    if (!kit) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    const { data: brand } = await supabaseAdmin()
      .from("brands")
      .select("id")
      .eq("slug", kit.slug)
      .maybeSingle();
    if (!brand || !user.brandIds.includes(brand.id)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return { user };
  }

  return { user };
}
