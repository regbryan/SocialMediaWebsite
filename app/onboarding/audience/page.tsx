"use client";

import { useRouter } from "next/navigation";
import {
  useDraft,
  type Audience,
  type Pillar,
} from "../../../lib/onboarding-state";

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
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold">Who, what, where</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Audiences, content mix, and hashtags. Everything we need to plan a
          week of posts.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Audiences
        </h3>
        {TIERS.map((tier) => {
          const a = audienceFor(tier);
          return (
            <div
              key={tier}
              className="rounded-lg ring-1 ring-neutral-200 p-4 space-y-2"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {tier}
              </div>
              <input
                type="text"
                placeholder="Who is this audience? (e.g., first-time homebuyers, 28–40, CA)"
                value={a.description}
                onChange={(e) =>
                  setAudience(tier, { description: e.target.value })
                }
                className="input"
              />
              <textarea
                rows={2}
                placeholder="Pain points — one per line"
                value={a.pain_points.join("\n")}
                onChange={(e) =>
                  setAudience(tier, {
                    pain_points: e.target.value.split("\n").filter(Boolean),
                  })
                }
                className="input"
              />
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Content pillars
          </h3>
          <button
            type="button"
            onClick={addPillar}
            className="text-xs text-neutral-600 hover:text-neutral-900"
          >
            + Add pillar
          </button>
        </div>
        {draft.contentPillars.length === 0 && (
          <p className="text-xs text-neutral-500">
            No pillars yet. Common mix: Educational 40% · Behind-the-scenes 20%
            · Testimonials 20% · Promotions 10% · Community 10%.
          </p>
        )}
        {draft.contentPillars.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 rounded-lg ring-1 ring-neutral-200 p-3"
          >
            <input
              type="text"
              placeholder="Name"
              value={p.name}
              onChange={(e) => updatePillar(i, { name: e.target.value })}
              className="input col-span-4"
            />
            <input
              type="number"
              min={0}
              max={100}
              placeholder="%"
              value={p.pct || ""}
              onChange={(e) =>
                updatePillar(i, { pct: Number(e.target.value) })
              }
              className="input col-span-2"
            />
            <input
              type="text"
              placeholder="Short description"
              value={p.description}
              onChange={(e) =>
                updatePillar(i, { description: e.target.value })
              }
              className="input col-span-5"
            />
            <button
              type="button"
              onClick={() => removePillar(i)}
              className="col-span-1 text-xs text-neutral-400 hover:text-red-600"
              aria-label="Remove pillar"
            >
              ✕
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Hashtag buckets
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            ["always_on", "local", "service", "community"] as const
          ).map((k) => (
            <label key={k} className="block text-sm font-medium">
              {k.replace("_", " ")}
              <textarea
                rows={2}
                placeholder="Space or comma separated — no # needed"
                value={draft.hashtags[k].join(" ")}
                onChange={(e) => setHashtags(k, e.target.value)}
                className="input mt-1.5 w-full font-normal"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Compliance &amp; visual direction
        </h3>
        <label className="block text-sm font-medium">
          Required footer / disclosure
          <textarea
            rows={2}
            placeholder="e.g., Equal Housing Lender · NMLS #123456"
            value={draft.complianceFooter}
            onChange={(e) => patch({ complianceFooter: e.target.value })}
            className="input mt-1.5 w-full font-normal"
          />
        </label>
        <label className="block text-sm font-medium">
          Photography direction
          <textarea
            rows={2}
            placeholder="Real clients, golden hour, diverse families…"
            value={draft.photographyDirection}
            onChange={(e) =>
              patch({ photographyDirection: e.target.value })
            }
            className="input mt-1.5 w-full font-normal"
          />
        </label>
      </section>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/onboarding/voice")}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => router.push("/onboarding/confirm")}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
