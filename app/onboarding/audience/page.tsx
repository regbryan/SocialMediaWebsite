"use client";

import { useRouter } from "next/navigation";
import {
  useDraft,
  type Audience,
  type Pillar,
} from "../../../lib/onboarding-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

const TIERS: Audience["tier"][] = ["primary", "secondary", "tertiary"];

export default function AudienceStep() {
  const router = useRouter();
  const { draft, patch, loaded } = useDraft();

  if (!loaded) return null;

  const audienceFor = (tier: Audience["tier"]): Audience =>
    draft.audiences.find((a) => a.tier === tier) ?? {
      tier,
      description: "",
      pain_points: [],
    };

  const setAudience = (tier: Audience["tier"], next: Partial<Audience>) => {
    const existing = audienceFor(tier);
    const merged = { ...existing, ...next };
    const others = draft.audiences.filter((a) => a.tier !== tier);
    const keep =
      merged.description || merged.pain_points.length ? [merged] : [];
    patch({ audiences: [...others, ...keep] });
  };

  const setPillars = (pillars: Pillar[]) => patch({ contentPillars: pillars });

  const addPillar = () =>
    setPillars([
      ...draft.contentPillars,
      { name: "", pct: 0, description: "" },
    ]);

  const updatePillar = (i: number, next: Partial<Pillar>) => {
    const copy = [...draft.contentPillars];
    copy[i] = { ...copy[i], ...next };
    setPillars(copy);
  };

  const removePillar = (i: number) =>
    setPillars(draft.contentPillars.filter((_, idx) => idx !== i));

  const setHashtags = (
    bucket: keyof typeof draft.hashtags,
    text: string
  ) =>
    patch({
      hashtags: {
        ...draft.hashtags,
        [bucket]: text
          .split(/[,\s]+/)
          .map((h) => h.trim().replace(/^#/, ""))
          .filter(Boolean),
      },
    });

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Who, what, where
        </h2>
        <p className="text-sm text-muted-foreground">
          Audiences, content mix, and hashtags. Everything we need to plan a
          week of posts.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Audiences
        </h3>
        {TIERS.map((tier) => {
          const a = audienceFor(tier);
          return (
            <div
              key={tier}
              className="space-y-3 rounded-lg border border-border/60 bg-background/40 p-4"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {tier}
              </div>
              <Input
                type="text"
                placeholder="Who is this audience? (e.g., first-time homebuyers, 28–40, CA)"
                value={a.description}
                onChange={(e) =>
                  setAudience(tier, { description: e.target.value })
                }
              />
              <Textarea
                rows={2}
                placeholder="Pain points, one per line"
                value={a.pain_points.join("\n")}
                onChange={(e) =>
                  setAudience(tier, {
                    pain_points: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Content pillars
          </h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={addPillar}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Plus className="size-3.5" /> Add pillar
          </Button>
        </div>
        {draft.contentPillars.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            No pillars yet. Common mix: Educational 40% · Behind-the-scenes 20%
            · Testimonials 20% · Promotions 10% · Community 10%.
          </p>
        )}
        {draft.contentPillars.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 rounded-lg border border-border/60 bg-background/40 p-3"
          >
            <Input
              type="text"
              placeholder="Name"
              value={p.name}
              onChange={(e) => updatePillar(i, { name: e.target.value })}
              className="col-span-4"
            />
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="%"
              value={p.pct || ""}
              onChange={(e) =>
                updatePillar(i, { pct: Number(e.target.value) })
              }
              className="col-span-2"
            />
            <Input
              type="text"
              placeholder="Short description"
              value={p.description}
              onChange={(e) =>
                updatePillar(i, { description: e.target.value })
              }
              className="col-span-5"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removePillar(i)}
              aria-label="Remove pillar"
              className="col-span-1 size-9 text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Hashtag buckets
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["always_on", "local", "service", "community"] as const).map((k) => (
            <div key={k} className="space-y-2">
              <Label className="capitalize">{k.replace("_", " ")}</Label>
              <Textarea
                rows={2}
                placeholder="Space or comma separated. No # needed."
                value={draft.hashtags[k].join(" ")}
                onChange={(e) => setHashtags(k, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Compliance &amp; visual direction
        </h3>
        <div className="space-y-2">
          <Label htmlFor="footer">Required footer / disclosure</Label>
          <Textarea
            id="footer"
            rows={2}
            placeholder="e.g., Equal Housing Lender · NMLS #123456"
            value={draft.complianceFooter}
            onChange={(e) => patch({ complianceFooter: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photo">Photography direction</Label>
          <Textarea
            id="photo"
            rows={2}
            placeholder="Real clients, golden hour, diverse families…"
            value={draft.photographyDirection}
            onChange={(e) => patch({ photographyDirection: e.target.value })}
          />
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-border/60 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/voice")}
        >
          ← Back
        </Button>
        <Button onClick={() => router.push("/onboarding/confirm")}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
