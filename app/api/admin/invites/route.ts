import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../lib/require-admin";
import { signInvite } from "../../../../lib/invite-token";

const DEFAULT_TTL_DAYS = 14;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { data, error } = await supabaseAdmin()
    .from("brand_kit_invites")
    .select(
      "id, slug, name, expires_at, used_at, used_brand_kit_id, created_at, revoked_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ invites: data ?? [] });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    slug?: string;
    ttlDays?: number;
  } | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "valid email is required" }, { status: 400 });
  }

  const slug = (body?.slug?.trim() || slugify(name)).toLowerCase();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return Response.json({ error: "slug must be kebab-case" }, { status: 400 });
  }

  const ttlDays = Math.min(Math.max(body?.ttlDays ?? DEFAULT_TTL_DAYS, 1), 60);
  const expiresAtMs = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
  const exp = Math.floor(expiresAtMs / 1000);
  const jti = crypto.randomUUID();

  const sb = supabaseAdmin();

  const { error: insertErr } = await sb.from("brand_kit_invites").insert({
    slug,
    name,
    email,
    jti,
    expires_at: new Date(expiresAtMs).toISOString(),
  });
  if (insertErr) {
    return Response.json(
      { error: "Failed to create invite", detail: insertErr.message },
      { status: 500 }
    );
  }

  const token = await signInvite({ slug, name, email, jti, exp });
  const origin = req.nextUrl.origin;
  const url = `${origin}/onboarding?invite=${encodeURIComponent(token)}`;

  return Response.json({ ok: true, url, token, slug, name, expires_at: exp });
}
