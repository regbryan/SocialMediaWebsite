"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Asset = {
  id: string;
  kind: string;
  url: string;
  meta: {
    label?: string;
    original_name?: string;
    size_bytes?: number;
    primary?: boolean;
  } | null;
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
  const isPrimary = Boolean(asset.meta?.primary);
  const canBePrimary = asset.kind !== "preview" && canDelete;

  const togglePrimary = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}/primary`, {
        method: isPrimary ? "DELETE" : "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  };

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
      className="overflow-hidden rounded-lg border transition-colors"
      style={{
        background: "#0f0f1a",
        borderColor: isPrimary ? "rgba(139,92,255,0.55)" : "#1a1a2e",
        boxShadow: isPrimary
          ? "0 0 0 1px rgba(139,92,255,0.35), 0 8px 24px -12px rgba(139,92,255,0.35)"
          : undefined,
      }}
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
        {isPrimary && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white"
            style={{ background: "rgba(139,92,255,0.92)" }}
          >
            ★ Primary
          </span>
        )}
      </a>
      <div className="space-y-1 p-3">
        <div className="truncate text-xs font-medium" title={label}>
          {label}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {sizeKb !== null ? `${sizeKb} KB` : ""}
          </span>
          <div className="flex items-center gap-3">
            {canBePrimary && (
              <button
                type="button"
                onClick={togglePrimary}
                disabled={busy}
                className="text-[11px] transition-colors disabled:opacity-50"
                title={
                  isPrimary
                    ? "This asset is being used by image-gen — click to unpin"
                    : "Pin this as the primary for its kind"
                }
                style={{
                  color: isPrimary ? "#b18bff" : "rgb(170 170 180)",
                }}
              >
                {busy ? "…" : isPrimary ? "★ Primary" : "☆ Set primary"}
              </button>
            )}
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
        </div>
        {error && <p className="text-[10px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
