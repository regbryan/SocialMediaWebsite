import type { NextRequest } from "next/server";
import { sendFeedbackDigest } from "../../../../lib/feedback-digest";

/**
 * Vercel Cron Job entry point.
 *
 * Schedule: 0 14 * * * (daily at 14:00 UTC ≈ 9am EST / 10am EDT)
 * configured in vercel.json.
 *
 * Auth: Vercel signs cron requests with the CRON_SECRET env var (via the
 * `authorization: Bearer <secret>` header). For local/manual invocation,
 * an admin password cookie also passes.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  const vercelOk = secret ? auth === `Bearer ${secret}` : false;
  if (!vercelOk) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendFeedbackDigest();
  return Response.json(result);
}
