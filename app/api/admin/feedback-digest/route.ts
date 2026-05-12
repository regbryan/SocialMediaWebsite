import { requireAdmin } from "../../../../lib/require-admin";
import { sendFeedbackDigest } from "../../../../lib/feedback-digest";

/**
 * Manual override: admin clicks "Send digest now" in the dashboard.
 * Shares the same implementation as the daily Vercel cron — both stamp
 * notified_at so we never double-send.
 */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const result = await sendFeedbackDigest();
  return Response.json(result);
}
