"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Tone = {
  keywords: string[];
  dos: string[];
  donts: string[];
  vocab_use: string[];
  vocab_avoid: string[];
};

type Tier = "starter" | "growth" | "agency" | null;

type AudienceTier = "primary" | "secondary" | "tertiary";

type Audience = {
  tier: AudienceTier;
  description: string;
  pain_points: string[];
};

type Pillar = { name: string; pct: number; description: string };

type Initial = {
  tier: Tier;
  tagline: string;
  positioning: string;
  description: string;
  mission: string;
  colors: { primary: string; secondary: string; accent: string };
  tone: Tone;
  audiences: Audience[];
  content_pillars: Pillar[];
  photography_direction: string;
  compliance_footer: string;
  contact_phone: string;
  preferred_channel: "email" | "sms";
  ig_handle: string;
  website_url: string;
  hq_location: string;
  founded_year: number | null;
  founder_names: string[];
  service_area: string[];
  hashtags: HashtagBuckets;
};

type HashtagBuckets = {
  always_on: string[];
  local: string[];
  service: string[];
  community: string[];
};

type HashtagBucket = keyof HashtagBuckets;

const HASHTAG_BUCKETS: Array<{
  key: HashtagBucket;
  label: string;
  hint: string;
}> = [
  {
    key: "always_on",
    label: "Always-on",
    hint: "Hashtags on every post (brand, category).",
  },
  {
    key: "local",
    label: "Local",
    hint: "City / region / neighborhood reach.",
  },
  {
    key: "service",
    label: "Service",
    hint: "Specific offerings or product lines.",
  },
  {
    key: "community",
    label: "Community",
    hint: "Audience / niche / movement tags.",
  },
];

function parseHashtags(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((h) => h.trim().replace(/^#+/, "").toLowerCase())
    .filter((h) => /^[a-z0-9_]{1,100}$/.test(h));
}

const AUDIENCE_TIERS: AudienceTier[] = ["primary", "secondary", "tertiary"];

const TIER_OPTIONS: Array<{ value: Tier; label: string; note: string }> = [
  { value: null, label: "No plan", note: "Unassigned" },
  { value: "starter", label: "Starter", note: "$497/mo · 5 posts/wk · 1 platform" },
  { value: "growth", label: "Growth", note: "$997/mo · 7 posts/wk · 3 platforms" },
  { value: "agency", label: "Agency", note: "Custom · unlimited" },
];

const TONE_OPTIONS = [
  "Professional",
  "Playful",
  "Bold",
  "Warm",
  "Technical",
  "Luxurious",
  "Down-to-earth",
  "Witty",
];

export default function EditKitForm({
  slug,
  isAdmin,
  initial,
}: {
  slug: string;
  isAdmin: boolean;
  initial: Initial;
}) {
  const router = useRouter();
  const [state, setState] = useState<Initial>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = <K extends keyof Initial>(key: K, value: Initial[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const setColor = (k: "primary" | "secondary" | "accent", v: string) =>
    setState((s) => ({ ...s, colors: { ...s.colors, [k]: v } }));

  const setToneList = (
    k: "dos" | "donts" | "vocab_use" | "vocab_avoid",
    text: string
  ) =>
    setState((s) => ({
      ...s,
      tone: { ...s.tone, [k]: text.split("\n").map((l) => l.trim()).filter(Boolean) },
    }));

  const toggleKeyword = (kw: string) =>
    setState((s) => {
      const has = s.tone.keywords.includes(kw);
      return {
        ...s,
        tone: {
          ...s.tone,
          keywords: has
            ? s.tone.keywords.filter((x) => x !== kw)
            : [...s.tone.keywords, kw],
        },
      };
    });

  const getAudience = (tier: AudienceTier): Audience =>
    state.audiences.find((a) => a.tier === tier) ?? {
      tier,
      description: "",
      pain_points: [],
    };

  const setAudience = (tier: AudienceTier, next: Partial<Audience>) =>
    setState((s) => {
      const existing = s.audiences.find((a) => a.tier === tier) ?? {
        tier,
        description: "",
        pain_points: [],
      };
      const merged = { ...existing, ...next };
      const others = s.audiences.filter((a) => a.tier !== tier);
      // Drop empty audiences entirely so we don't persist noise.
      const keep =
        merged.description.trim() || merged.pain_points.length ? [merged] : [];
      return { ...s, audiences: [...others, ...keep] };
    });

  const addPillar = () =>
    setState((s) => ({
      ...s,
      content_pillars: [
        ...s.content_pillars,
        { name: "", pct: 0, description: "" },
      ],
    }));

  const updatePillar = (i: number, next: Partial<Pillar>) =>
    setState((s) => ({
      ...s,
      content_pillars: s.content_pillars.map((p, idx) =>
        idx === i ? { ...p, ...next } : p
      ),
    }));

  const removePillar = (i: number) =>
    setState((s) => ({
      ...s,
      content_pillars: s.content_pillars.filter((_, idx) => idx !== i),
    }));

  const pillarTotal = state.content_pillars.reduce(
    (sum, p) => sum + (Number(p.pct) || 0),
    0
  );

  const setHashtagBucket = (bucket: HashtagBucket, text: string) =>
    setState((s) => ({
      ...s,
      hashtags: { ...s.hashtags, [bucket]: parseHashtags(text) },
    }));

  const hashtagTotal =
    state.hashtags.always_on.length +
    state.hashtags.local.length +
    state.hashtags.service.length +
    state.hashtags.community.length;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const body: Record<string, unknown> = {
        tagline: state.tagline,
        positioning: state.positioning,
        description: state.description,
        mission: state.mission,
        colors: state.colors,
        tone: state.tone,
        audiences: state.audiences,
        content_pillars: state.content_pillars.filter(
          (p) => p.name.trim() || p.pct > 0
        ),
        photography_direction: state.photography_direction,
        compliance_footer: state.compliance_footer,
        contact_phone: state.contact_phone,
        preferred_channel: state.preferred_channel,
        ig_handle: state.ig_handle,
        website_url: state.website_url,
        hq_location: state.hq_location,
        founded_year: state.founded_year,
        founder_names: state.founder_names,
        service_area: state.service_area,
        hashtags: state.hashtags,
      };
      // Only admin can change tier — server also enforces this, but skip the
      // payload entirely for clients to keep PATCH bodies clean.
      if (isAdmin) body.tier = state.tier;
      const res = await fetch(`/api/dashboard/kits/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Save failed");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan</CardTitle>
            <CardDescription>
              Which tier this client signed up for. Admin-only — changing this
              should reflect a billing change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TIER_OPTIONS.map((opt) => {
                const on = state.tier === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value ?? "none"}
                    onClick={() => patch("tier", opt.value)}
                    className="rounded-md border px-3 py-2 text-left text-xs transition-colors"
                    style={{
                      borderColor: on ? "white" : "#1a1a2e",
                      background: on ? "rgba(255,255,255,0.06)" : "transparent",
                      minWidth: "180px",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{
                          background: on ? "#8b5cff" : "#1a1a2e",
                        }}
                      />
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {opt.note}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business basics</CardTitle>
          <CardDescription>
            Where you are, what you go by online, when you started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ig_handle">Instagram handle</Label>
              <div className="flex items-center overflow-hidden rounded-md border focus-within:ring-1"
                style={{ borderColor: "#1a1a2e" }}
              >
                <span className="pl-3 text-sm text-muted-foreground">@</span>
                <input
                  id="ig_handle"
                  type="text"
                  value={state.ig_handle}
                  onChange={(e) =>
                    patch(
                      "ig_handle",
                      e.target.value.replace(/^@+/, "").toLowerCase()
                    )
                  }
                  className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="riversidehatco"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website_url">Website</Label>
              <Input
                id="website_url"
                type="url"
                value={state.website_url}
                onChange={(e) => patch("website_url", e.target.value)}
                placeholder="https://yourbrand.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hq_location">HQ location</Label>
              <Input
                id="hq_location"
                value={state.hq_location}
                onChange={(e) => patch("hq_location", e.target.value)}
                placeholder="Riverside, CA"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="founded_year">Founded</Label>
              <Input
                id="founded_year"
                type="number"
                min={1800}
                max={new Date().getFullYear() + 1}
                value={state.founded_year ?? ""}
                onChange={(e) =>
                  patch(
                    "founded_year",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="2018"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="founder_names">Founder names</Label>
            <Textarea
              id="founder_names"
              rows={2}
              value={state.founder_names.join("\n")}
              onChange={(e) =>
                patch(
                  "founder_names",
                  e.target.value
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                )
              }
              placeholder="One per line"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service_area">Service area</Label>
            <Textarea
              id="service_area"
              rows={2}
              value={state.service_area.join("\n")}
              onChange={(e) =>
                patch(
                  "service_area",
                  e.target.value
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                )
              }
              placeholder="Cities, regions, or zip codes you serve — one per line"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
          <CardDescription>Headline copy that appears across content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={state.tagline}
              onChange={(e) => patch("tagline", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="positioning">Positioning</Label>
            <Textarea
              id="positioning"
              rows={3}
              value={state.positioning}
              onChange={(e) => patch("positioning", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={state.description}
              onChange={(e) => patch("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              rows={2}
              value={state.mission}
              onChange={(e) => patch("mission", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Colors</CardTitle>
          <CardDescription>Hex values used in generated designs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["primary", "secondary", "accent"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={`color-${k}`} className="capitalize">
                  {k}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`color-${k}`}
                    value={state.colors[k]}
                    onChange={(e) => setColor(k, e.target.value)}
                    placeholder="#8b5cff"
                  />
                  <span
                    className="size-9 shrink-0 rounded-md border"
                    style={{
                      background: state.colors[k] || "#0a0a14",
                      borderColor: "#1a1a2e",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice</CardTitle>
          <CardDescription>
            Tone keywords and rules the AI references when generating.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tone keywords</Label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((t) => {
                const on = state.tone.keywords.includes(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleKeyword(t)}
                    className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    style={{
                      borderColor: on ? "white" : "#1a1a2e",
                      background: on ? "white" : "transparent",
                      color: on ? "#07070e" : "white",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dos">Things we should do</Label>
              <Textarea
                id="dos"
                rows={3}
                value={state.tone.dos.join("\n")}
                onChange={(e) => setToneList("dos", e.target.value)}
                placeholder={"Speak plainly\nUse local references"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donts">Things to avoid</Label>
              <Textarea
                id="donts"
                rows={3}
                value={state.tone.donts.join("\n")}
                onChange={(e) => setToneList("donts", e.target.value)}
                placeholder={"Corporate jargon\nHype words"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vocab_use">Vocabulary we use</Label>
              <Textarea
                id="vocab_use"
                rows={3}
                value={state.tone.vocab_use.join("\n")}
                onChange={(e) => setToneList("vocab_use", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vocab_avoid">Vocabulary to avoid</Label>
              <Textarea
                id="vocab_avoid"
                rows={3}
                value={state.tone.vocab_avoid.join("\n")}
                onChange={(e) => setToneList("vocab_avoid", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audiences</CardTitle>
          <CardDescription>
            Who the content is for. Each tier feeds the AI prompts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {AUDIENCE_TIERS.map((tier) => {
            const a = getAudience(tier);
            return (
              <div key={tier} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label className="capitalize">{tier}</Label>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Tier {tier === "primary" ? "1" : tier === "secondary" ? "2" : "3"}
                  </span>
                </div>
                <Input
                  value={a.description}
                  onChange={(e) =>
                    setAudience(tier, { description: e.target.value })
                  }
                  placeholder={
                    tier === "primary"
                      ? "Mid-size franchise marketing directors"
                      : tier === "secondary"
                      ? "Independent business owners 40-60"
                      : "Adjacent professionals (e.g., PR contacts)"
                  }
                />
                <Textarea
                  rows={2}
                  value={a.pain_points.join("\n")}
                  onChange={(e) =>
                    setAudience(tier, {
                      pain_points: e.target.value
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Pain points, one per line"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content pillars</CardTitle>
          <CardDescription>
            Topic buckets used to vary post-to-post content. Percentages
            indicate the rough share of monthly output for each.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {state.content_pillars.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No pillars yet. Add one to start.
              </p>
            )}
            {state.content_pillars.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_88px_auto]"
              >
                <div className="space-y-1">
                  <Input
                    value={p.name}
                    onChange={(e) => updatePillar(i, { name: e.target.value })}
                    placeholder="Pillar name (e.g., Education, Behind the scenes)"
                  />
                  <Textarea
                    rows={2}
                    value={p.description}
                    onChange={(e) =>
                      updatePillar(i, { description: e.target.value })
                    }
                    placeholder="What this pillar covers"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={p.pct || 0}
                    onChange={(e) =>
                      updatePillar(i, { pct: Number(e.target.value) || 0 })
                    }
                    aria-label="Percentage"
                  />
                  <span className="block pl-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    % share
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePillar(i)}
                  className="self-start text-muted-foreground"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <span
              className="text-xs"
              style={{
                color:
                  pillarTotal === 100
                    ? "rgb(167, 243, 208)"
                    : pillarTotal === 0
                    ? "#9999a6"
                    : pillarTotal > 100
                    ? "rgb(252, 165, 165)"
                    : "#9999a6",
              }}
            >
              {pillarTotal === 0
                ? "—"
                : `Total: ${pillarTotal}%${
                    pillarTotal === 100 ? " ✓" : pillarTotal > 100 ? " over 100" : ""
                  }`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPillar}
              disabled={state.content_pillars.length >= 8}
            >
              + Add pillar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hashtags</CardTitle>
          <CardDescription>
            Four buckets the generator mixes into each post caption. Space or
            comma separated. No # needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HASHTAG_BUCKETS.map((b) => {
              const current = state.hashtags[b.key];
              return (
                <div key={b.key} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor={`hashtag-${b.key}`}>{b.label}</Label>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {current.length}
                    </span>
                  </div>
                  <Textarea
                    id={`hashtag-${b.key}`}
                    rows={3}
                    value={current.map((h) => `#${h}`).join(" ")}
                    onChange={(e) => setHashtagBucket(b.key, e.target.value)}
                    placeholder="riversidehats westernwear made_in_usa"
                  />
                  <p className="text-xs text-muted-foreground">{b.hint}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Total across buckets: {hashtagTotal}
            {hashtagTotal > 30
              ? " — IG caps at 30 per post; generator picks a relevant subset."
              : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Direction</CardTitle>
          <CardDescription>
            Visual rules and compliance footer applied to every generated piece.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="photography_direction">Photography direction</Label>
            <Textarea
              id="photography_direction"
              rows={3}
              value={state.photography_direction}
              onChange={(e) =>
                patch("photography_direction", e.target.value)
              }
              placeholder="Real customers, golden hour, no stock photography…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compliance_footer">Compliance footer</Label>
            <Textarea
              id="compliance_footer"
              rows={2}
              value={state.compliance_footer}
              onChange={(e) => patch("compliance_footer", e.target.value)}
              placeholder="NMLS #… etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
          <CardDescription>
            How we reach you for review notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact_phone">Phone (optional)</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={state.contact_phone}
                onChange={(e) => patch("contact_phone", e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred channel</Label>
              <div className="flex gap-2">
                {(["email", "sms"] as const).map((c) => {
                  const on = state.preferred_channel === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => patch("preferred_channel", c)}
                      className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
                      style={{
                        borderColor: on ? "white" : "#1a1a2e",
                        background: on ? "white" : "transparent",
                        color: on ? "#07070e" : "white",
                      }}
                    >
                      {c.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: "#1a1a2e", background: "rgba(7,7,14,0.96)" }}
      >
        {saved && !error ? (
          <span className="text-sm text-emerald-400">Saved.</span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Changes apply on next preview / content generation.
          </span>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
