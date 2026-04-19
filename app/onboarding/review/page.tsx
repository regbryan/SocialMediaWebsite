"use client";

import { useRouter } from "next/navigation";
import { useDraft } from "../../../lib/onboarding-state";

export default function ReviewStep() {
  const router = useRouter();
  const { draft, patch, loaded } = useDraft();

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Your brand</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Tagline, positioning, and visual identity. Phase 2 will auto-fill
          these from your site.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Brand name"
          value={draft.name}
          onChange={(v) => patch({ name: v })}
        />
        <Input
          label="Tagline"
          value={draft.tagline}
          onChange={(v) => patch({ tagline: v })}
          placeholder="Finally, a lender you'd refer"
        />
      </div>

      <TextArea
        label="Positioning"
        hint="How you want the market to see you, in 1–2 sentences."
        rows={2}
        value={draft.positioning}
        onChange={(v) => patch({ positioning: v })}
      />

      <TextArea
        label="Mission"
        hint="Why you exist, beyond making money."
        rows={2}
        value={draft.mission}
        onChange={(v) => patch({ mission: v })}
      />

      <TextArea
        label="Description"
        hint="What you do, in plain English."
        rows={3}
        value={draft.description}
        onChange={(v) => patch({ description: v })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Founded year"
          value={draft.foundedYear}
          onChange={(v) => patch({ foundedYear: v })}
          placeholder="2015"
        />
        <Input
          label="Service area"
          hint="Comma-separated"
          value={draft.serviceArea.join(", ")}
          onChange={(v) =>
            patch({
              serviceArea: v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="Riverside County, San Bernardino"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Colors</legend>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            ["primary", "secondary", "accent", "bg", "text"] as const
          ).map((k) => (
            <label key={k} className="block text-xs text-neutral-600">
              {k}
              <div className="mt-1 flex items-center gap-2 rounded-lg ring-1 ring-neutral-300 px-2 py-1.5">
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
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Heading font"
          value={draft.fonts.heading}
          onChange={(v) => patch({ fonts: { ...draft.fonts, heading: v } })}
          placeholder="Anton"
        />
        <Input
          label="Body font"
          value={draft.fonts.body}
          onChange={(v) => patch({ fonts: { ...draft.fonts, body: v } })}
          placeholder="Inter"
        />
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/onboarding/basics")}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => router.push("/onboarding/voice")}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input mt-1.5 w-full font-normal"
      />
      {hint && <p className="mt-1 text-xs font-normal text-neutral-500">{hint}</p>}
    </label>
  );
}

function TextArea({
  label,
  hint,
  rows,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  rows: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1.5 w-full font-normal"
      />
      {hint && <p className="mt-1 text-xs font-normal text-neutral-500">{hint}</p>}
    </label>
  );
}
