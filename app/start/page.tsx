"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TIER_LABELS: Record<string, string> = {
  starter: "Starter · $497/mo",
  growth: "Growth · $997/mo",
  agency: "Agency · Custom",
};

export default function StartPage() {
  const router = useRouter();
  const search = useSearchParams();
  const planParam = search.get("plan");
  const tier =
    planParam && TIER_LABELS[planParam] ? planParam : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, brand, tier }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not start onboarding.");
      router.push("/onboarding/basics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start onboarding.");
      setSubmitting(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-40 border-b"
        style={{ borderColor: "#1a1a2e", backgroundColor: "rgba(7,7,14,0.96)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="tracking-tight"
            style={{ color: "white", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            SocialPulse
          </Link>
          <Link href="/" className="text-xs" style={{ color: "#9999a6" }}>
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-16">
        <div className="mb-8 space-y-3">
          <p className="eyebrow">Get started</p>
          <h1
            className="display-heading"
            style={{ fontSize: "clamp(40px, 6vw, 56px)" }}
          >
            Tell us who you are.
          </h1>
          <p className="text-sm" style={{ color: "#9999a6", maxWidth: "32ch" }}>
            Three quick questions and you&apos;re in the wizard. Takes about 8 minutes.
          </p>
          {tier && (
            <p
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: "rgba(139,92,255,0.45)",
                color: "#b18bff",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#8b5cff",
                  display: "inline-block",
                }}
              />
              Plan selected: {TIER_LABELS[tier]}
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reggie Bryant"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand or company name</Label>
            <Input
              id="brand"
              required
              autoComplete="organization"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Riverside Hat Co"
            />
          </div>

          {error && (
            <p
              className="rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: "rgba(248, 113, 113, 0.4)",
                backgroundColor: "rgba(248, 113, 113, 0.08)",
                color: "rgb(252, 165, 165)",
              }}
            >
              {error}
            </p>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Starting…" : "Start the wizard →"}
            </Button>
          </div>

          <p className="text-xs" style={{ color: "#9999a6" }}>
            We&apos;ll review your submission and email you once your dashboard is live.
            Usually within one business day.
          </p>
        </form>
      </main>
    </div>
  );
}
