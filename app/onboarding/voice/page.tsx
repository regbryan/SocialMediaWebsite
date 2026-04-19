"use client";

import { useRouter } from "next/navigation";
import { useDraft } from "../../../lib/onboarding-state";

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
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Voice & tone</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Pick the words that describe how your brand talks, then build your
          vocabulary bank.
        </p>
      </header>

      <fieldset>
        <legend className="text-sm font-medium">Tone keywords</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TONES.map((t) => {
            const on = draft.tone.keywords.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => toggle(t)}
                className={
                  "rounded-full px-4 py-1.5 text-sm ring-1 transition " +
                  (on
                    ? "bg-neutral-900 text-white ring-neutral-900"
                    : "bg-white text-neutral-700 ring-neutral-300 hover:ring-neutral-500")
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <List
          label="Things we should do"
          value={draft.tone.dos}
          onChange={(t) => setList("dos", t)}
          placeholder={"Speak plainly\nUse local references"}
        />
        <List
          label="Things to avoid"
          value={draft.tone.donts}
          onChange={(t) => setList("donts", t)}
          placeholder={"Corporate jargon\nHype words"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <List
          label="Words & phrases we use"
          hint="Signature vocabulary. One per line."
          value={draft.tone.vocab_use}
          onChange={(t) => setList("vocab_use", t)}
          placeholder={"on-time\nowner-operated"}
        />
        <List
          label="Words & phrases to avoid"
          hint="Never use these. One per line."
          value={draft.tone.vocab_avoid}
          onChange={(t) => setList("vocab_avoid", t)}
          placeholder={"cheap\nguaranteed"}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/onboarding/review")}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => router.push("/onboarding/audience")}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function List({
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
    <label className="block text-sm font-medium">
      {label}
      <textarea
        rows={4}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1.5 w-full font-normal"
        placeholder={placeholder}
      />
      {hint && (
        <p className="mt-1 text-xs font-normal text-neutral-500">{hint}</p>
      )}
    </label>
  );
}
