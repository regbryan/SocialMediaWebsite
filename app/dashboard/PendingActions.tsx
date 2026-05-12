"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PendingActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const approve = async () => {
    setBusy("approve");
    setError(null);
    try {
      const res = await fetch(`/api/admin/kits/${slug}/approve`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Approve failed");
      setMagicLink(body.dashboardUrl ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    const reason = window.prompt("Reason for rejection (optional):") ?? "";
    setBusy("reject");
    setError(null);
    try {
      const res = await fetch(`/api/admin/kits/${slug}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Reject failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setBusy(null);
    }
  };

  if (magicLink) {
    return (
      <div className="flex flex-col gap-2 text-xs">
        <span className="text-emerald-400">Approved · magic link generated</span>
        <code
          className="break-all rounded border px-2 py-1 font-mono"
          style={{
            borderColor: "rgba(16,185,129,0.3)",
            backgroundColor: "rgba(16,185,129,0.05)",
          }}
        >
          {magicLink}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(magicLink)}
          className="self-start text-xs underline text-muted-foreground hover:text-foreground"
        >
          Copy link
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={reject}
          disabled={busy !== null}
        >
          {busy === "reject" ? "Rejecting…" : "Reject"}
        </Button>
        <Button size="sm" onClick={approve} disabled={busy !== null}>
          {busy === "approve" ? "Approving…" : "Approve"}
        </Button>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
