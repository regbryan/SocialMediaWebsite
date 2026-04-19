import type { NextRequest } from "next/server";
import { fetchIgProfile } from "../../../../../lib/scrape-ig";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  if (!handle) {
    return Response.json({ error: "handle required" }, { status: 400 });
  }
  try {
    const profile = await fetchIgProfile(handle);
    return Response.json({ ok: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    console.error("[onboarding/ig] failed", { handle, message });
    const status = /IG_SIDECAR_URL/.test(message) ? 503 : 502;
    return Response.json({ error: message }, { status });
  }
}
