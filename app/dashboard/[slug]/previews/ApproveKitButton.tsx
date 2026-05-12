"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ApproveKitButton({
  slug,
  allApproved,
  kitApproved,
}: {
  slug: string;
  allApproved: boolean;
  kitApproved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (kitApproved) {
    return (
      <Button variant="outline" disabled>
        ✓ Kit approved
      </Button>
    );
  }

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/kits/${slug}/approve-kit`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Approval failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={onClick} disabled={busy || !allApproved}>
        {busy ? "Approving…" : "Approve brand kit"}
      </Button>
      {!allApproved && (
        <span className="text-xs text-muted-foreground">
          Approve every preview first.
        </span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
