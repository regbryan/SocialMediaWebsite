"use client";

import { useRouter } from "next/navigation";
import { useDraft } from "../../../lib/onboarding-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ReviewStep() {
  const router = useRouter();
  const { draft, patch, loaded } = useDraft();

  if (!loaded) return null;

  const colorKeys = ["primary", "secondary", "accent", "bg", "text"] as const;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Your brand</h2>
        <p className="text-sm text-muted-foreground">
          Tagline, positioning, and visual identity.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Brand name</Label>
          <Input
            id="name"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={draft.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
            placeholder="Finally, a lender you'd refer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="positioning">Positioning</Label>
        <Textarea
          id="positioning"
          rows={2}
          value={draft.positioning}
          onChange={(e) => patch({ positioning: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          How you want the market to see you, in 1–2 sentences.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mission">Mission</Label>
        <Textarea
          id="mission"
          rows={2}
          value={draft.mission}
          onChange={(e) => patch({ mission: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Why you exist, beyond making money.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          What you do, in plain English.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="founded">Founded year</Label>
          <Input
            id="founded"
            value={draft.foundedYear}
            onChange={(e) => patch({ foundedYear: e.target.value })}
            placeholder="2015"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Service area</Label>
          <Input
            id="service"
            value={draft.serviceArea.join(", ")}
            onChange={(e) =>
              patch({
                serviceArea: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Riverside County, San Bernardino"
          />
          <p className="text-xs text-muted-foreground">Comma-separated</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Colors</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {colorKeys.map((k) => (
            <div key={k} className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{k}</p>
              <div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-2 py-1.5">
                <input
                  type="color"
                  value={draft.colors[k] || "#000000"}
                  onChange={(e) =>
                    patch({ colors: { ...draft.colors, [k]: e.target.value } })
                  }
                  className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={draft.colors[k]}
                  placeholder="#000000"
                  onChange={(e) =>
                    patch({ colors: { ...draft.colors, [k]: e.target.value } })
                  }
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heading">Heading font</Label>
          <Input
            id="heading"
            value={draft.fonts.heading}
            onChange={(e) =>
              patch({ fonts: { ...draft.fonts, heading: e.target.value } })
            }
            placeholder="Anton"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Body font</Label>
          <Input
            id="body"
            value={draft.fonts.body}
            onChange={(e) =>
              patch({ fonts: { ...draft.fonts, body: e.target.value } })
            }
            placeholder="Inter"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/basics")}
        >
          ← Back
        </Button>
        <Button onClick={() => router.push("/onboarding/voice")}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
