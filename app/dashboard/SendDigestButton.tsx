"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SendDigestButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/feedback-digest", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Send failed");
      if (body.sent) {
        setResult(
          `Sent · ${body.previewCount} preview / ${body.draftCount} content across ${body.brandCount} brand${body.brandCount === 1 ? "" : "s"}`
        );
      } else {
        setResult(body.reason || "Nothing to send");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="outline" onClick={onClick} disabled={busy}>
        {busy ? "Sending…" : "Send feedback digest"}
      </Button>
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
