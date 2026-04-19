"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify, useDraft } from "../../../lib/onboarding-state";

export default function ConfirmStep() {
  const router = useRouter();
  const { draft, reset, loaded } = useDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loaded) return null;

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          slug: slugify(draft.name || draft.igHandle || draft.websiteUrl),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submit failed (${res.status})`);
      }
      const { slug } = await res.json();
      reset();
      router.push(`/onboarding/done?slug=${slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const pillarSummary = draft.contentPillars.length
    ? draft.contentPillars
        .map((p) => `${p.name || "?"} ${p.pct}%`)
        .join(" · ")
    : "—";

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Looks good?</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Here&apos;s what we captured. Submit to create your brand kit.
        </p>
      </header>

      <dl className="divide-y divide-neutral-200 rounded-lg ring-1 ring-neutral-200">
        <Row label="Platform" value={draft.primaryPlatform} />
        <Row label="Brand name" value={draft.name || "—"} />
        <Row label="Website" value={draft.websiteUrl || "—"} />
        <Row
          label="Handle"
          value={draft.igHandle ? `@${draft.igHandle}` : "—"}
        />
        <Row label="HQ" value={draft.hqLocation || "—"} />
        <Row label="Tagline" value={draft.tagline || "—"} />
        <Row label="Positioning" value={draft.positioning || "—"} />
        <Row label="Tone" value={draft.tone.keywords.join(", ") || "—"} />
        <Row
          label="Vocab (use)"
          value={draft.tone.vocab_use.slice(0, 5).join(", ") || "—"}
        />
        <Row
          label="Audiences"
          value={
            draft.audiences
              .map((a) => `${a.tier}: ${a.description}`)
              .join(" · ") || "—"
          }
        />
        <Row label="Pillars" value={pillarSummary} />
        <Row
          label="Footer"
          value={draft.complianceFooter || "—"}
        />
        <Row
          label="Colors"
          value={
            <div className="flex gap-1.5">
              {(["primary", "secondary", "accent", "bg", "text"] as const).map(
                (k) =>
                  draft.colors[k] ? (
                    <span
                      key={k}
                      className="size-6 rounded ring-1 ring-neutral-300"
                      style={{ background: draft.colors[k] }}
                      title={`${k}: ${draft.colors[k]}`}
                    />
                  ) : null
              )}
            </div>
          }
        />
      </dl>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/onboarding/audience")}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !draft.name}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create brand kit"}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <dt className="w-32 shrink-0 text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="flex-1 text-sm">{value}</dd>
    </div>
  );
}
