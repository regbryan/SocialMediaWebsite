"use client";

import { useRouter } from "next/navigation";
import { useDraft } from "../../../lib/onboarding-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TONES = [
  "Professional",
  "Playful",
  "Bold",
  "Warm",
  "Technical",
  "Luxurious",
  "Down-to-earth",
  "Witty",
];

export default function VoiceStep() {
  const router = useRouter();
  const { draft, patch, loaded } = useDraft();

  if (!loaded) return null;

  const toggle = (k: string) => {
    const has = draft.tone.keywords.includes(k);
    patch({
      tone: {
        ...draft.tone,
        keywords: has
          ? draft.tone.keywords.filter((x) => x !== k)
          : [...draft.tone.keywords, k],
      },
    });
  };

  const setList = (
    key: "dos" | "donts" | "vocab_use" | "vocab_avoid",
    text: string
  ) =>
    patch({
      tone: { ...draft.tone, [key]: text.split("\n").filter(Boolean) },
    });

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Voice &amp; tone</h2>
        <p className="text-sm text-muted-foreground">
          Pick the words that describe how your brand talks, then build your
          vocabulary bank.
        </p>
      </header>

      <div className="space-y-2">
        <Label>Tone keywords</Label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => {
            const on = draft.tone.keywords.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => toggle(t)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-foreground hover:border-foreground/60"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ListField
          label="Things we should do"
          value={draft.tone.dos}
          onChange={(t) => setList("dos", t)}
          placeholder={"Speak plainly\nUse local references"}
        />
        <ListField
          label="Things to avoid"
          value={draft.tone.donts}
          onChange={(t) => setList("donts", t)}
          placeholder={"Corporate jargon\nHype words"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ListField
          label="Words &amp; phrases we use"
          hint="Signature vocabulary. One per line."
          value={draft.tone.vocab_use}
          onChange={(t) => setList("vocab_use", t)}
          placeholder={"on-time\nowner-operated"}
        />
        <ListField
          label="Words &amp; phrases to avoid"
          hint="Never use these. One per line."
          value={draft.tone.vocab_avoid}
          onChange={(t) => setList("vocab_avoid", t)}
          placeholder={"cheap\nguaranteed"}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/review")}
        >
          ← Back
        </Button>
        <Button onClick={() => router.push("/onboarding/audience")}>
          Continue →
        </Button>
      </div>
    </div>
  );
}

function ListField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        rows={4}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
