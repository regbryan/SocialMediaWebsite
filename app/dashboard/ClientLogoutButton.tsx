"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ClientLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — sign-out is best-effort
    }
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
