"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Asset = {
  id: string;
  kind: string;
  url: string;
  meta: { label?: string; original_name?: string; size_bytes?: number } | null;
};

export default function AssetCard({
  asset,
  canDelete,
}: {
  asset: Asset;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    if (!window.confirm(`Delete ${asset.meta?.label || asset.meta?.original_name || "asset"}?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Delete failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  };

  const label = asset.meta?.label || asset.meta?.original_name || "Untitled";
  const sizeKb = asset.meta?.size_bytes
    ? Math.round(asset.meta.size_bytes / 1024)
    : null;

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ background: "#0f0f1a", borderColor: "#1a1a2e" }}
    >
      <a
        href={asset.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block"
        style={{
          aspectRatio: "1 / 1",
          background:
            "repeating-conic-gradient(#0a0a14 0deg 90deg, #0f0f1a 90deg 180deg) 0 0 / 16px 16px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.url}
          alt={label}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: "8px",
          }}
        />
      </a>
      <div className="space-y-1 p-3">
        <div className="truncate text-xs font-medium" title={label}>
          {label}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {sizeKb !== null ? `${sizeKb} KB` : ""}
          </span>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
            >
              {busy ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
        {error && <p className="text-[10px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
