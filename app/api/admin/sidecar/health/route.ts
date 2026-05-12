import { requireAdmin } from "../../../../../lib/require-admin";

/**
 * Probe the IG sidecar `/health` endpoint and report status to the
 * dashboard. Surfaces three distinct states the operator cares about:
 *
 *   - configured: false        → IG_SIDECAR_URL not set; competitor
 *                                refreshes will 503 until deployed.
 *   - ok: true                 → sidecar is awake and responsive.
 *   - ok: false                → URL set but the sidecar timed out,
 *                                returned non-2xx, or refused the token.
 *
 * Latency is reported in ms so we can show "awake (340ms)" — useful
 * because Fly machines cold-start when idle.
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const base = process.env.IG_SIDECAR_URL;
  if (!base) {
    return Response.json({
      configured: false,
      ok: false,
      reason: "IG_SIDECAR_URL is not set",
    });
  }

  const token = process.env.IG_SIDECAR_TOKEN;
  const started = Date.now();
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/health`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(8_000),
    });
    const ms = Date.now() - started;
    if (!res.ok) {
      return Response.json({
        configured: true,
        ok: false,
        latency_ms: ms,
        reason: `HTTP ${res.status}`,
      });
    }
    return Response.json({ configured: true, ok: true, latency_ms: ms });
  } catch (err) {
    return Response.json({
      configured: true,
      ok: false,
      latency_ms: Date.now() - started,
      reason: err instanceof Error ? err.message : "Health check failed",
    });
  }
}
