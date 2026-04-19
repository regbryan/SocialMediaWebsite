"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDraft, type OnboardingDraft } from "../../../lib/onboarding-state";

const PLATFORMS: { value: OnboardingDraft["primaryPlatform"]; label: string }[] =
  [
    { value: "instagram", label: "Instagram" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
  ];

export default function BasicsStep() {
  const router = useRouter();
  const { draft, patch, loaded } = useDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeNote, setScrapeNote] = useState<string | null>(null);
  const [igFetching, setIgFetching] = useState(false);
  const [igNote, setIgNote] = useState<string | null>(null);

  if (!loaded) return null;

  const requiresIg = draft.primaryPlatform === "instagram";

  const onFetch = async () => {
    setError(null);
    setScrapeNote(null);
    if (!draft.websiteUrl) {
      setError("Enter a website URL first.");
      return;
    }
    setScraping(true);
    try {
      const res = await fetch("/api/onboarding/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: draft.websiteUrl }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `Scrape failed (${res.status})`);
      const s = body.scrape as {
        title: string | null;
        tagline: string | null;
        description: string | null;
        colors: { primary?: string };
        logos: { primary_url?: string; favicon_url?: string };
      };
      patch({
        name: draft.name || s.title?.split(/\s+[|–—-]\s+/)[0].trim() || "",
        tagline: draft.tagline || s.tagline || "",
        description: draft.description || s.description || "",
        colors: {
          ...draft.colors,
          primary: draft.colors.primary || s.colors.primary || "",
        },
        logos: {
          ...draft.logos,
          primary_url:
            draft.logos.primary_url ||
            s.logos.primary_url ||
            s.logos.favicon_url ||
            "",
        },
      });
      setScrapeNote("Pulled brand info — review in the next step.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setScraping(false);
    }
  };

  const onFetchIg = async () => {
    setError(null);
    setIgNote(null);
    if (!draft.igHandle) {
      setError("Enter an Instagram handle first.");
      return;
    }
    setIgFetching(true);
    try {
      const res = await fetch(
        `/api/onboarding/ig/${encodeURIComponent(draft.igHandle)}`
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `IG fetch failed (${res.status})`);
      const p = body.profile as {
        full_name: string | null;
        biography: string | null;
        external_url: string | null;
        follower_count: number | null;
        is_business: boolean | null;
        profile_pic_url: string | null;
        source: "cache" | "sidecar";
        top_posts?: import("../../../lib/onboarding-state").IgSnapshotPost[];
      };
      patch({
        name: draft.name || p.full_name || "",
        description: draft.description || p.biography || "",
        websiteUrl: draft.websiteUrl || p.external_url || "",
        logos: {
          ...draft.logos,
          primary_url: draft.logos.primary_url || p.profile_pic_url || "",
        },
        igSnapshot: {
          handle: draft.igHandle,
          follower_count: p.follower_count,
          is_business: p.is_business,
          top_posts: p.top_posts ?? [],
          fetched_at: new Date().toISOString(),
        },
      });
      setIgNote(
        `Pulled @${draft.igHandle} (${p.source}) — ${p.follower_count ?? 0} followers.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "IG fetch failed");
    } finally {
      setIgFetching(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!draft.websiteUrl && !draft.igHandle) {
      setError("We need at least a website URL or a social handle.");
      return;
    }

    setSubmitting(true);
    router.push("/onboarding/review");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Let&apos;s find your brand</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Give us your website and handle — we&apos;ll pull in your logo,
          colors, and profile automatically.
        </p>
      </header>

      <fieldset>
        <legend className="text-sm font-medium">Primary platform</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const on = draft.primaryPlatform === p.value;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => patch({ primaryPlatform: p.value })}
                className={
                  "rounded-full px-4 py-1.5 text-sm ring-1 transition " +
                  (on
                    ? "bg-neutral-900 text-white ring-neutral-900"
                    : "bg-white text-neutral-700 ring-neutral-300 hover:ring-neutral-500")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field
        label="Website URL"
        hint="We'll scrape it for logo, colors, and copy."
        htmlFor="websiteUrl"
      >
        <div className="flex gap-2">
          <input
            id="websiteUrl"
            type="url"
            placeholder="https://yourbrand.com"
            value={draft.websiteUrl}
            onChange={(e) => patch({ websiteUrl: e.target.value })}
            className="input flex-1"
          />
          <button
            type="button"
            onClick={onFetch}
            disabled={scraping || !draft.websiteUrl}
            className="shrink-0 rounded-lg ring-1 ring-neutral-300 px-4 text-sm font-medium text-neutral-700 hover:ring-neutral-900 disabled:opacity-50"
          >
            {scraping ? "Fetching…" : "Fetch"}
          </button>
        </div>
        {scrapeNote && (
          <p className="mt-1 text-xs text-emerald-700">{scrapeNote}</p>
        )}
      </Field>

      <Field
        label={requiresIg ? "Instagram handle" : "Social handle"}
        hint={
          requiresIg
            ? "Public profile only — no password needed."
            : "Public profile handle on your primary platform."
        }
        htmlFor="igHandle"
      >
        <div className="flex gap-2">
          <div className="flex flex-1 items-center rounded-lg ring-1 ring-neutral-300 focus-within:ring-2 focus-within:ring-neutral-900">
            <span className="pl-3 text-neutral-500">@</span>
            <input
              id="igHandle"
              type="text"
              placeholder="yourbrand"
              value={draft.igHandle}
              onChange={(e) =>
                patch({ igHandle: e.target.value.replace(/^@/, "") })
              }
              className="input flex-1 rounded-none ring-0 focus:ring-0"
            />
          </div>
          <button
            type="button"
            onClick={onFetchIg}
            disabled={igFetching || !draft.igHandle}
            className="shrink-0 rounded-lg ring-1 ring-neutral-300 px-4 text-sm font-medium text-neutral-700 hover:ring-neutral-900 disabled:opacity-50"
          >
            {igFetching ? "Fetching…" : "Fetch IG"}
          </button>
        </div>
        {igNote && <p className="mt-1 text-xs text-emerald-700">{igNote}</p>}
      </Field>

      <Field
        label="Headquarters / primary location"
        hint="City or region — used for local content and hashtags."
        htmlFor="hq"
      >
        <input
          id="hq"
          type="text"
          placeholder="Riverside, CA"
          value={draft.hqLocation}
          onChange={(e) => patch({ hqLocation: e.target.value })}
          className="input"
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? "Working…" : "Continue"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
