"use client";

import { useEffect, useState } from "react";

type Status =
  | { state: "loading" }
  | { state: "unconfigured"; reason: string }
  | { state: "ok"; latency: number }
  | { state: "down"; reason: string; latency: number };

/**
 * Live indicator showing whether the IG sidecar is reachable. Polls
 * once on mount — operators don't need a live ticker, just a snapshot
 * to know whether refresh buttons will work.
 */
export default function SidecarStatus() {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/sidecar/health");
        if (res.status === 401) return; // not an admin — hide silently
        const body = (await res.json()) as {
          configured: boolean;
          ok: boolean;
          latency_ms?: number;
          reason?: string;
        };
        if (cancelled) return;
        if (!body.configured) {
          setStatus({ state: "unconfigured", reason: body.reason || "not set" });
        } else if (body.ok) {
          setStatus({ state: "ok", latency: body.latency_ms ?? 0 });
        } else {
          setStatus({
            state: "down",
            reason: body.reason || "unreachable",
            latency: body.latency_ms ?? 0,
          });
        }
      } catch {
        if (!cancelled) setStatus({ state: "down", reason: "fetch failed", latency: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        Checking sidecar…
      </span>
    );
  }

  if (status.state === "unconfigured") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
        title={status.reason}
      >
        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
        Sidecar not deployed
      </span>
    );
  }

  if (status.state === "down") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] text-destructive"
        title={status.reason}
      >
        <span className="size-1.5 rounded-full bg-destructive" />
        Sidecar offline · {status.reason}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="size-1.5 rounded-full" style={{ background: "#7ee787" }} />
      Sidecar awake · {status.latency}ms
    </span>
  );
}
