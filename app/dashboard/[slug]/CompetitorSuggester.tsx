"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Admin tool for discovering competitors. Seeds from any IG handle —
 * usually the brand's own — and surfaces IG's "Suggested for you"
 * accounts via the sidecar's `/related/{handle}` endpoint. Each result
 * is a click-to-add chip that appends to the brand kit's
 * `competitor_handles` array.
 *
 * Results that are already on the kit are dimmed and labeled "added"
 * so the operator can spot what's already tracked at a glance.
 */
export default function CompetitorSuggester({
  slug,
  seedHandle,
  existing,
}: {
  slug: string;
  seedHandle: string | null;
  existing: string[];
}) {
  const router = useRouter();
  const [seed, setSeed] = useState(seedHandle ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const existingSet = new Set(existing.map((h) => h.toLowerCase()));

  const onFetch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const h = seed.trim().replace(/^@/, "").toLowerCase();
    if (!h) {
      setError("Enter a handle to seed from.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuggestions(null);
    try {
      const res = await fetch(
        `/api/onboarding/competitors/${encodeURIComponent(h)}`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Lookup failed");
      const handles: string[] = Array.isArray(body.handles) ? body.handles : [];
      setSuggestions(handles);
      if (handles.length === 0) setError("No suggestions returned for that handle.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  const onAdd = async (handle: string) => {
    setAdding(handle);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/kits/${encodeURIComponent(slug)}/competitors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Add failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add failed");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border p-4"
      style={{ borderColor: "#1a1a2e", background: "#0a0a14" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Find similar accounts</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Admin · sidecar
        </span>
      </div>
      <form onSubmit={onFetch} className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            @
          </span>
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder={seedHandle ? `e.g. ${seedHandle}` : "handle to seed from"}
            className="h-9 w-full rounded-md border bg-transparent pl-7 pr-3 text-sm outline-none transition-colors focus:border-foreground/40"
            style={{ borderColor: "#1a1a2e" }}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="h-9 rounded-md px-3 text-xs font-medium uppercase tracking-wider text-white transition-opacity disabled:opacity-50"
          style={{ background: "rgba(139,92,255,0.9)" }}
        >
          {busy ? "Searching…" : "Suggest"}
        </button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">
            {suggestions.length} suggestion{suggestions.length === 1 ? "" : "s"} —
            click to add to this kit
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((h) => {
              const already = existingSet.has(h.toLowerCase());
              const isAdding = adding === h;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => !already && !isAdding && onAdd(h)}
                  disabled={already || isAdding}
                  className="group inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed"
                  style={{
                    borderColor: already ? "rgba(139,92,255,0.25)" : "#1f1f33",
                    background: already ? "rgba(139,92,255,0.08)" : "#0f0f1a",
                    color: already ? "rgba(177,139,255,0.7)" : "inherit",
                    opacity: isAdding ? 0.5 : 1,
                  }}
                >
                  <span>@{h}</span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                    {already ? "added" : isAdding ? "…" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
