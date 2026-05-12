"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Row = { url: string; slot_label: string };

const EMPTY: Row = { url: "", slot_label: "" };

function blankRows(n: number): Row[] {
  return Array.from({ length: n }, () => ({ ...EMPTY }));
}

export default function PreviewUploader({ slug }: { slug: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(blankRows(4));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const addRow = () => setRows((rs) => [...rs, { ...EMPTY }]);
  const removeRow = (i: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, j) => j !== i) : rs));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const previews = rows
      .map((r) => ({
        url: r.url.trim(),
        slot_label: r.slot_label.trim() || undefined,
      }))
      .filter((r) => r.url.length > 0);
    if (previews.length === 0) {
      setError("Add at least one preview URL.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/kits/${slug}/previews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previews }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Upload failed");
      setRows(blankRows(4));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto]"
          >
            <div className="space-y-1">
              {i === 0 && (
                <Label htmlFor={`url-${i}`} className="text-xs">
                  Image URL
                </Label>
              )}
              <Input
                id={`url-${i}`}
                type="url"
                value={row.url}
                onChange={(e) => setRow(i, { url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1">
              {i === 0 && (
                <Label htmlFor={`label-${i}`} className="text-xs">
                  Label
                </Label>
              )}
              <Input
                id={`label-${i}`}
                value={row.slot_label}
                onChange={(e) => setRow(i, { slot_label: e.target.value })}
                placeholder={`Style ${String.fromCharCode(65 + i)}`}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="text-muted-foreground"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={rows.length >= 12}
        >
          + Add row
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save previews"}
        </Button>
      </div>
    </form>
  );
}
