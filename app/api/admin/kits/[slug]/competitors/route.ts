import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";

/**
 * Admin mutations on a brand kit's competitor handle list.
 *
 * POST   { handle: 'nike' }   — append (idempotent, normalized lowercase)
 * DELETE { handle: 'nike' }   — remove
 *
 * The handle list lives on `brand_kits.competitor_handles` as a text[].
 * Profile data for each handle is cached in `ig_profile_cache` once the
 * sidecar hydrates it — adding here just registers the handle as one we
 * want to track.
 */
function normalize(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

async function mutate(
  slug: string,
  handle: string,
  mode: "add" | "remove"
): Promise<Response> {
  if (!handle) {
    return Response.json({ error: "handle required" }, { status: 400 });
  }
  if (!/^[a-z0-9._]{1,30}$/.test(handle)) {
    return Response.json(
      { error: "Invalid IG handle format." },
      { status: 400 }
    );
  }

  const sb = supabaseAdmin();
  const { data: kit } = await sb
    .from("brand_kits")
    .select("id, competitor_handles")
    .eq("slug", slug)
    .maybeSingle();
  if (!kit) return Response.json({ error: "Kit not found" }, { status: 404 });

  const current = (kit.competitor_handles as string[] | null) ?? [];
  const set = new Set(current.map((h) => h.toLowerCase()));
  if (mode === "add") set.add(handle);
  else set.delete(handle);
  const next = Array.from(set);

  const { error } = await sb
    .from("brand_kits")
    .update({ competitor_handles: next })
    .eq("id", kit.id);
  if (error) {
    return Response.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, competitor_handles: next });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { handle?: string } | null;
  return mutate(slug, normalize(body?.handle ?? ""), "add");
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { handle?: string } | null;
  return mutate(slug, normalize(body?.handle ?? ""), "remove");
}
