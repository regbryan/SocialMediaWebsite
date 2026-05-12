"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompetitorRefreshButton({ handle }: { handle: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/competitors/${encodeURIComponent(handle)}/refresh`,
        { method: "POST" }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Refresh failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {busy ? "Refreshing…" : "Refresh"}
      </button>
      {error && (
        <span className="text-[10px] text-destructive" title={error}>
          failed
        </span>
      )}
    </div>
  );
}
