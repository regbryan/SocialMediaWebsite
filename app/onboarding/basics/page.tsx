"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDraft, type OnboardingDraft } from "../../../lib/onboarding-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [invite, setInvite] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/onboarding/invite")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.ok) {
          setInvite({ name: j.name, email: j.email });
          // Prefill name from invite if user hasn't typed one yet.
          if (!draft.name) patch({ name: j.name });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <form onSubmit={onSubmit} className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Let&apos;s find your brand
        </h2>
        <p className="text-sm text-muted-foreground">
          Give us your website and handle — we&apos;ll pull in your logo,
          colors, and profile automatically.
        </p>
        {invite && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Invited as <span className="text-foreground">{invite.name}</span> ·{" "}
            <span className="text-foreground">{invite.email}</span>
          </p>
        )}
      </header>

      <div className="space-y-2">
        <Label>Primary platform</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const on = draft.primaryPlatform === p.value;
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => patch({ primaryPlatform: p.value })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-foreground hover:border-foreground/60"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <div className="flex gap-2">
          <Input
            id="websiteUrl"
            type="url"
            placeholder="https://yourbrand.com"
            value={draft.websiteUrl}
            onChange={(e) => patch({ websiteUrl: e.target.value })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onFetch}
            disabled={scraping || !draft.websiteUrl}
          >
            {scraping ? "Fetching…" : "Fetch"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We&apos;ll scrape it for logo, colors, and copy.
        </p>
        {scrapeNote && (
          <p className="text-xs text-emerald-400">{scrapeNote}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="igHandle">
          {requiresIg ? "Instagram handle" : "Social handle"}
        </Label>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
            <span className="pl-3 text-sm text-muted-foreground">@</span>
            <input
              id="igHandle"
              type="text"
              placeholder="yourbrand"
              value={draft.igHandle}
              onChange={(e) =>
                patch({ igHandle: e.target.value.replace(/^@/, "") })
              }
              className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onFetchIg}
            disabled={igFetching || !draft.igHandle}
          >
            {igFetching ? "Fetching…" : "Fetch IG"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {requiresIg
            ? "Public profile only — no password needed."
            : "Public profile handle on your primary platform."}
        </p>
        {igNote && <p className="text-xs text-emerald-400">{igNote}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hq">Headquarters / primary location</Label>
        <Input
          id="hq"
          type="text"
          placeholder="Riverside, CA"
          value={draft.hqLocation}
          onChange={(e) => patch({ hqLocation: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          City or region — used for local content and hashtags.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end border-t border-border/60 pt-6">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Working…" : "Continue →"}
        </Button>
      </div>
    </form>
  );
}
