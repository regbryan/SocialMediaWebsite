import type { NextRequest } from "next/server";
import { requireAdmin } from "../../../../../../lib/require-admin";
import { fetchIgProfile } from "../../../../../../lib/scrape-ig";

/**
 * Admin trigger: refetch one IG profile via the sidecar, bypassing the
 * 24h cache. Used by the competitor cards on the brand kit dashboard so
 * operators can pull updated follower counts on demand.
 */
export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ handle: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { handle } = await ctx.params;
  if (!handle) {
    return Response.json({ error: "handle required" }, { status: 400 });
  }

  try {
    const profile = await fetchIgProfile(handle, { forceRefetch: true });
    return Response.json({ ok: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    const status = /IG_SIDECAR_URL/.test(message) ? 503 : 502;
    return Response.json({ error: message }, { status });
  }
}
