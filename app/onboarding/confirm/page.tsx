"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { slugify, useDraft } from "../../../lib/onboarding-state";
import { Button } from "@/components/ui/button";

export default function ConfirmStep() {
  const router = useRouter();
  const { draft, reset, loaded } = useDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<{
    slug: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/invite")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.ok) setInvite({ slug: j.slug, name: j.name, email: j.email });
      })
      .catch(() => {});
  }, []);

  if (!loaded) return null;

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const slug =
        invite?.slug ||
        slugify(draft.name || draft.igHandle || draft.websiteUrl);
      const res = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, slug }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submit failed (${res.status})`);
      }
      const {
        slug: returnedSlug,
        dashboardUrl,
        pendingReview,
      } = await res.json();
      reset();
      const params = new URLSearchParams({ slug: returnedSlug });
      if (dashboardUrl) params.set("dash", dashboardUrl);
      if (pendingReview) params.set("pending", "1");
      router.push(`/onboarding/done?${params.toString()}`);
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
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Looks good?</h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what we captured. Submit to create your brand kit.
        </p>
      </header>

      <dl className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-background/40">
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
        <Row label="Footer" value={draft.complianceFooter || "—"} />
        <Row
          label="Colors"
          value={
            <div className="flex gap-1.5">
              {(["primary", "secondary", "accent", "bg", "text"] as const).map(
                (k) =>
                  draft.colors[k] ? (
                    <span
                      key={k}
                      className="size-6 rounded border border-border/60"
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
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border/60 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/audience")}
        >
          ← Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting || !draft.name}
        >
          {submitting ? "Creating…" : "Create brand kit"}
        </Button>
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
      <dt className="w-32 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
