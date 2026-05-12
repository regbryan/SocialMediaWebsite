import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  signInvite,
} from "../../../../lib/invite-token";

const TTL_DAYS = 14;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  // Try base, then base-2, base-3, etc. against both brand_kits and brand_kit_invites
  // so we don't collide with a kit an admin pre-staged.
  const sb = supabaseAdmin();
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const [{ data: kit }, { data: invite }] = await Promise.all([
      sb.from("brand_kits").select("slug").eq("slug", candidate).maybeSingle(),
      sb.from("brand_kit_invites").select("slug").eq("slug", candidate).maybeSingle(),
    ]);
    if (!kit && !invite) return candidate;
  }
  // Extremely unlikely fallback.
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

const VALID_TIERS = new Set(["starter", "growth", "agency"]);

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    brand?: string;
    tier?: string;
  } | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const brand = body?.brand?.trim();
  const tier =
    body?.tier && VALID_TIERS.has(body.tier) ? body.tier : null;

  if (!name) {
    return Response.json({ error: "Your name is required." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }
  if (!brand) {
    return Response.json({ error: "Brand name is required." }, { status: 400 });
  }

  const baseSlug = slugify(brand);
  if (!baseSlug) {
    return Response.json(
      { error: "Brand name must contain letters or numbers." },
      { status: 400 }
    );
  }

  const slug = await uniqueSlug(baseSlug);

  const expiresAtMs = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000;
  const exp = Math.floor(expiresAtMs / 1000);
  const jti = crypto.randomUUID();

  const sb = supabaseAdmin();
  const { error: insertErr } = await sb.from("brand_kit_invites").insert({
    slug,
    name: brand,
    email,
    jti,
    expires_at: new Date(expiresAtMs).toISOString(),
    source: "self-serve",
    tier,
  });
  if (insertErr) {
    console.error("[onboarding/start] insert failed", insertErr.message);
    return Response.json(
      { error: "Failed to start onboarding. Please try again." },
      { status: 500 }
    );
  }

  const token = await signInvite({ slug, name: brand, email, jti, exp });

  const res = NextResponse.json({ ok: true, slug });
  res.cookies.set(INVITE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: INVITE_COOKIE_MAX_AGE,
  });
  return res;
}
