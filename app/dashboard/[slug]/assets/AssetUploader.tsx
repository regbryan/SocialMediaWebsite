"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KIND_OPTIONS = [
  { value: "logo", label: "Logo" },
  { value: "hero_image", label: "Hero image" },
  { value: "cutout", label: "Cutout (transparent)" },
  { value: "photo_library", label: "Photo library" },
  { value: "other", label: "Other" },
];

export default function AssetUploader({ slug }: { slug: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState("logo");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Pick a file first.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      if (label.trim()) form.append("label", label.trim());
      const res = await fetch(`/api/admin/kits/${slug}/assets`, {
        method: "POST",
        body: form,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.detail || "Upload failed");
      setResult(`Uploaded ${file.name}`);
      setLabel("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
        <div className="space-y-1.5">
          <Label htmlFor="asset-file">File</Label>
          <Input
            id="asset-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            ref={fileRef}
            disabled={busy}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="asset-kind">Type</Label>
          <select
            id="asset-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            disabled={busy}
            className="block h-9 w-full rounded-md border bg-transparent px-3 text-sm"
            style={{ borderColor: "#1a1a2e" }}
          >
            {KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="asset-label">Label (optional)</Label>
        <Input
          id="asset-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={busy}
          placeholder="e.g. White wordmark, hero shot Oct 2025"
        />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {result && (
        <p
          className="rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: "rgba(16,185,129,0.3)",
            color: "rgb(167,243,208)",
            background: "rgba(16,185,129,0.05)",
          }}
        >
          {result}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Uploading…" : "Upload asset"}
        </Button>
      </div>
    </form>
  );
}
