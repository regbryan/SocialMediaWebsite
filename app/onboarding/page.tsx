"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { emptyDraft, type OnboardingDraft } from "../../lib/onboarding-state";

const STEPS = [
  { href: "/onboarding/basics", label: "Basics" },
  { href: "/onboarding/review", label: "Brand" },
  { href: "/onboarding/voice", label: "Voice" },
  { href: "/onboarding/audience", label: "Audience" },
  { href: "/onboarding/confirm", label: "Confirm" },
] as const;

type StepIdx = 0 | 1 | 2 | 3 | 4;

/**
 * Resume page for the onboarding wizard.
 *
 * Behavior:
 *   - No localStorage draft → bounce straight to /onboarding/basics
 *     (first-time user, nothing to resume).
 *   - Draft exists → compute the furthest step they've reached and
 *     show a "Pick up where you left off" card with Continue + Start
 *     over actions.
 *
 * The "furthest reached" heuristic is content-presence per step:
 *   Basics    → name + websiteUrl
 *   Brand     → tagline OR positioning OR colors.primary
 *   Voice     → tone.keywords[] OR complianceFooter
 *   Audience  → audiences[]
 *   Confirm   → everything above complete (no marker of its own)
 *
 * If the heuristic says they're past Basics, they're definitively
 * returning — never auto-redirect, always show the resume card so
 * they know their work is here and not lost.
 */
export default function OnboardingIndex() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboarding:draft:v2");
      if (!raw) {
        router.replace("/onboarding/basics");
        return;
      }
      const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
      const merged: OnboardingDraft = {
        ...emptyDraft,
        ...parsed,
        colors: { ...emptyDraft.colors, ...(parsed.colors ?? {}) },
        fonts: { ...emptyDraft.fonts, ...(parsed.fonts ?? {}) },
        tone: { ...emptyDraft.tone, ...(parsed.tone ?? {}) },
        hashtags: { ...emptyDraft.hashtags, ...(parsed.hashtags ?? {}) },
        logos: { ...emptyDraft.logos, ...(parsed.logos ?? {}) },
        igSnapshot: parsed.igSnapshot ?? null,
      };
      // Empty draft (all defaults, no real fill) → no point resuming.
      if (!merged.name && !merged.websiteUrl) {
        router.replace("/onboarding/basics");
        return;
      }
      setDraft(merged);
    } catch {
      router.replace("/onboarding/basics");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked || !draft) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Checking for saved progress…
      </div>
    );
  }

  const furthest = furthestStep(draft);
  // Resume from the next step after the furthest completed one, capped
  // at the last step. If they completed everything, send them to Confirm.
  const resumeIdx = Math.min(furthest + 1, STEPS.length - 1) as StepIdx;

  const onStartOver = () => {
    if (!window.confirm("Discard everything you've filled in so far?")) return;
    try {
      localStorage.removeItem("onboarding:draft:v2");
    } catch {}
    router.replace("/onboarding/basics");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Pick up where you left off
        </h2>
        <p className="text-sm text-muted-foreground">
          We saved your progress on this browser. You can continue, or start
          fresh.
        </p>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "rgba(139,92,255,0.35)", background: "rgba(139,92,255,0.04)" }}
      >
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Brand kit
        </p>
        <p className="mt-1 text-lg font-medium">{draft.name || "Unnamed"}</p>
        {draft.websiteUrl && (
          <p className="text-xs text-muted-foreground">{draft.websiteUrl}</p>
        )}
        <div className="mt-4 space-y-2">
          {STEPS.map((s, i) => {
            const done = i <= furthest;
            return (
              <div
                key={s.href}
                className="flex items-center gap-3 text-sm"
                style={{ color: done ? "rgb(220 220 230)" : "rgb(140 140 150)" }}
              >
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold"
                  style={{
                    background: done ? "#8b5cff" : "transparent",
                    color: done ? "white" : "rgb(140 140 150)",
                    border: done ? "none" : "1px solid #1a1a2e",
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>
                {s.label}
                {i === resumeIdx && (
                  <span
                    className="ml-auto text-[10px] uppercase tracking-wider"
                    style={{ color: "#b18bff" }}
                  >
                    Next up
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => router.push(STEPS[resumeIdx].href)} className="flex-1">
          Continue → {STEPS[resumeIdx].label}
        </Button>
        <Button variant="outline" onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </div>
  );
}

function furthestStep(d: OnboardingDraft): StepIdx {
  if (!d.name && !d.websiteUrl) return -1 as unknown as StepIdx;
  let idx: StepIdx = 0;
  // Brand completed if any brand-shape field has content
  if (
    d.tagline.trim() ||
    d.positioning.trim() ||
    d.colors.primary.trim() ||
    d.description.trim()
  ) {
    idx = 1;
  }
  // Voice completed if any tone/copy field has content
  if (
    d.tone.keywords.length > 0 ||
    d.tone.dos.length > 0 ||
    d.tone.donts.length > 0 ||
    d.complianceFooter.trim() ||
    d.photographyDirection.trim()
  ) {
    idx = 2;
  }
  // Audience completed once they've added at least one segment
  if (d.audiences.length > 0 || d.contentPillars.length > 0) {
    idx = 3;
  }
  return idx;
}
