"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GenerateBatchButton({
  slug,
  disabled,
  hasExisting,
  tierMax,
  tierLabel,
}: {
  slug: string;
  disabled: boolean;
  hasExisting: boolean;
  tierMax: number;
  tierLabel: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (hasExisting) {
      const ok = window.confirm(
        "This will replace the current batch. Continue?"
      );
      if (!ok) return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/kits/${slug}/content/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ask for the tier's cap explicitly. The server clamps too, but
        // requesting the right number keeps the UX honest.
        body: JSON.stringify({ days: tierMax }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Generation failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={onClick} disabled={busy || disabled}>
        {busy
          ? "Generating…"
          : hasExisting
          ? `Re-generate ${tierMax}-day batch`
          : `Generate ${tierMax}-day batch`}
      </Button>
      <span className="text-xs text-muted-foreground">{tierLabel}</span>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
