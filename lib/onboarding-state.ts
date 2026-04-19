"use client";

import { useEffect, useState } from "react";

export type Audience = {
  tier: "primary" | "secondary" | "tertiary";
  description: string;
  pain_points: string[];
};

export type Pillar = {
  name: string;
  pct: number;
  description: string;
};

export type IgSnapshotPost = {
  code: string;
  url: string;
  caption: string | null;
  like_count: number | null;
  comment_count: number | null;
  media_type: "photo" | "video" | "carousel" | "other";
  thumbnail_url: string | null;
  taken_at: string | null;
};

export type IgSnapshot = {
  handle: string;
  follower_count: number | null;
  is_business: boolean | null;
  top_posts: IgSnapshotPost[];
  fetched_at: string;
};

export type OnboardingDraft = {
  primaryPlatform: "instagram" | "linkedin" | "facebook" | "tiktok";
  websiteUrl: string;
  igHandle: string;

  name: string;
  tagline: string;
  positioning: string;
  mission: string;
  description: string;
  foundedYear: string;
  founderNames: string[];
  hqLocation: string;
  serviceArea: string[];

  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
  };
  fonts: { heading: string; body: string };
  tone: {
    keywords: string[];
    dos: string[];
    donts: string[];
    vocab_use: string[];
    vocab_avoid: string[];
  };
  audiences: Audience[];
  contentPillars: Pillar[];
  hashtags: {
    always_on: string[];
    local: string[];
    service: string[];
    community: string[];
  };
  complianceFooter: string;
  photographyDirection: string;
  logos: { primary_url: string; white_url: string; mark_url: string };
  igSnapshot: IgSnapshot | null;
};

export const emptyDraft: OnboardingDraft = {
  primaryPlatform: "instagram",
  websiteUrl: "",
  igHandle: "",
  name: "",
  tagline: "",
  positioning: "",
  mission: "",
  description: "",
  foundedYear: "",
  founderNames: [],
  hqLocation: "",
  serviceArea: [],
  colors: { primary: "", secondary: "", accent: "", bg: "", text: "" },
  fonts: { heading: "", body: "" },
  tone: {
    keywords: [],
    dos: [],
    donts: [],
    vocab_use: [],
    vocab_avoid: [],
  },
  audiences: [],
  contentPillars: [],
  hashtags: { always_on: [], local: [], service: [], community: [] },
  complianceFooter: "",
  photographyDirection: "",
  logos: { primary_url: "", white_url: "", mark_url: "" },
  igSnapshot: null,
};

const KEY = "onboarding:draft:v2";

export function useDraft() {
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
        setDraft({
          ...emptyDraft,
          ...parsed,
          colors: { ...emptyDraft.colors, ...(parsed.colors ?? {}) },
          fonts: { ...emptyDraft.fonts, ...(parsed.fonts ?? {}) },
          tone: { ...emptyDraft.tone, ...(parsed.tone ?? {}) },
          hashtags: { ...emptyDraft.hashtags, ...(parsed.hashtags ?? {}) },
          logos: { ...emptyDraft.logos, ...(parsed.logos ?? {}) },
          igSnapshot: parsed.igSnapshot ?? null,
        });
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, loaded]);

  const patch = (p: Partial<OnboardingDraft>) =>
    setDraft((d) => ({ ...d, ...p }));

  const reset = () => {
    setDraft(emptyDraft);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  return { draft, patch, reset, loaded };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
