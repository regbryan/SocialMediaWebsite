"use client";

import { useState } from "react";

/**
 * Pricing CTA that creates a Stripe Checkout Session and redirects the
 * user to it. The session is created server-side on the Dashboard
 * project (Stripe secret key lives there, not on the marketing site).
 *
 * NEXT_PUBLIC_DASHBOARD_URL points at the Dashboard origin
 * (e.g. https://dashboard-eight-theta-24.vercel.app). Falls back to a
 * relative path which works in case both projects end up under the
 * same domain later.
 */
const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ||
  "https://dashboard-eight-theta-24.vercel.app";

export default function CheckoutButton({
  tier,
  label,
  variant = "primary",
}: {
  tier: "starter" | "growth";
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${DASHBOARD_URL}/api/stripe/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data?.error || `Checkout failed (${res.status})`);
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: "auto" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={
          variant === "primary"
            ? "sp-shiny"
            : "sp-shiny sp-shiny--secondary"
        }
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "Redirecting…" : `${label} →`}
      </button>
      {error && (
        <p
          role="alert"
          style={{
            marginTop: "8px",
            fontSize: "11px",
            color: "rgb(252, 165, 165)",
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
