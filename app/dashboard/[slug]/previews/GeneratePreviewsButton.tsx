"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GeneratePreviewsButton({
  slug,
  hasExisting,
}: {
  slug: string;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const onClick = async () => {
    if (hasExisting) {
      const ok = window.confirm(
        "This will replace the current previews. Continue?"
      );
      if (!ok) return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/kits/${slug}/previews/generate`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Generation failed");
      const note =
        body.failed > 0
          ? `Generated ${body.generated} · ${body.failed} failed`
          : `Generated ${body.generated} previews`;
      setResult(note);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={onClick} disabled={busy}>
        {busy ? "Generating…" : hasExisting ? "Re-generate previews" : "Generate previews"}
      </Button>
      <span className="text-xs text-muted-foreground">
        Uses Gemini · ~30 seconds for 4 previews
      </span>
      {result && <span className="text-xs text-emerald-400">{result}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
