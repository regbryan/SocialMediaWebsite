import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function resend(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || "SocialPulse Media <hello@socialpulse.media>";
}

/**
 * Send an email. Returns { ok: true } on success, { ok: false, error } on
 * any failure. Never throws — caller can safely fire-and-forget without
 * breaking the request path. If RESEND_API_KEY is unset (local dev),
 * logs to the console and returns ok so flows aren't blocked.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = resend();
  if (!r) {
    console.log("[email] (RESEND_API_KEY unset) skipping send", {
      to,
      subject,
      text: text.slice(0, 160),
    });
    return { ok: true };
  }

  try {
    const { error } = await r.emails.send({
      from: fromAddress(),
      to,
      subject,
      text,
      html: html ?? `<p>${escape(text).replace(/\n/g, "<br>")}</p>`,
      replyTo,
    });
    if (error) {
      console.warn("[email] send error", { to, subject, error: error.message });
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[email] send threw", { to, subject, message });
    return { ok: false, error: message };
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Public-base URL for links inside emails. Falls back to DASHBOARD_URL,
 * then to the request origin (caller can pass that in if available).
 */
export function dashboardBaseUrl(fallback?: string): string {
  return (process.env.DASHBOARD_URL || fallback || "").replace(/\/$/, "");
}
