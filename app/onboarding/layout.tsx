import type { ReactNode } from "react";
import Link from "next/link";

const STEPS = [
  { href: "/onboarding/basics", label: "Basics", num: 1 },
  { href: "/onboarding/review", label: "Brand", num: 2 },
  { href: "/onboarding/voice", label: "Voice", num: 3 },
  { href: "/onboarding/audience", label: "Audience", num: 4 },
  { href: "/onboarding/confirm", label: "Confirm", num: 5 },
];

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← SocialPulse
        </Link>
        <h1 className="mt-2 font-[var(--font-anton)] text-4xl tracking-tight">
          Brand Kit Setup
        </h1>
        <p className="mt-1 text-neutral-600">
          A few quick steps and we&apos;ll have everything we need to start creating
          content for you.
        </p>

        <nav className="mt-8 flex items-center gap-2 text-sm">
          {STEPS.map((s, i) => (
            <div key={s.href} className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-700">
                {s.num}
              </span>
              <span className="text-neutral-700">{s.label}</span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 text-neutral-300">—</span>
              )}
            </div>
          ))}
        </nav>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          {children}
        </section>
      </div>
    </main>
  );
}
