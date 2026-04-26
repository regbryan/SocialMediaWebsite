"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function RevokeButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!confirm("Revoke this invite? The client won't be able to use it.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || `Failed (${res.status})`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={busy}
      className="text-destructive hover:text-destructive"
    >
      {busy ? "…" : "Revoke"}
    </Button>
  );
}
