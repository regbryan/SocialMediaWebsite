import type { ReactNode } from "react";
import Link from "next/link";
import Stepper from "./Stepper";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="inline-block size-2 rounded-full bg-gradient-to-br from-[#b18bff] to-[#3b81ff]" />
            SocialPulse
          </Link>
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            New brand kit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Brand kit setup
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            A few quick steps and we&apos;ll have everything we need to start
            creating content for you.
          </p>
        </div>

        <div className="mb-8">
          <Stepper />
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
