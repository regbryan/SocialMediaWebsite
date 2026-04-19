import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

const CACHE_TTL_HOURS = 24;

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle: raw } = await params;
  const handle = normalizeHandle(raw);
  if (!handle) {
    return Response.json({ error: "handle required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const cacheKey = `related:${handle}`;
  const { data: cached } = await sb
    .from("ig_profile_cache")
    .select("payload, fetched_at")
    .eq("handle", cacheKey)
    .maybeSingle();

  if (cached) {
    const ageH = (Date.now() - new Date(cached.fetched_at as string).getTime()) / 36e5;
    if (ageH < CACHE_TTL_HOURS) {
      return Response.json({
        ok: true,
        source: "cache",
        ...(cached.payload as { handles: string[] }),
      });
    }
  }

  const base = process.env.IG_SIDECAR_URL;
  if (!base) {
    return Response.json(
      { error: "IG_SIDECAR_URL is not set" },
      { status: 503 }
    );
  }

  try {
    const token = process.env.IG_SIDECAR_TOKEN;
    const res = await fetch(
      `${base.replace(/\/$/, "")}/related/${encodeURIComponent(handle)}`,
      {
        headers: token ? { authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (!res.ok) {
      return Response.json(
        { error: `Sidecar ${res.status}` },
        { status: 502 }
      );
    }
    const body = (await res.json()) as { handles?: string[] };
    const payload = { handles: body.handles ?? [] };

    await sb.from("ig_profile_cache").upsert(
      { handle: cacheKey, payload, fetched_at: new Date().toISOString() },
      { onConflict: "handle" }
    );

    return Response.json({ ok: true, source: "sidecar", ...payload });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
