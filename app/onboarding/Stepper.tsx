"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/onboarding/basics", label: "Basics" },
  { href: "/onboarding/review", label: "Brand" },
  { href: "/onboarding/voice", label: "Voice" },
  { href: "/onboarding/audience", label: "Audience" },
  { href: "/onboarding/confirm", label: "Confirm" },
] as const;

export default function Stepper() {
  const pathname = usePathname();
  const currentIdx = Math.max(
    0,
    STEPS.findIndex((s) => pathname?.startsWith(s.href))
  );

  return (
    <div className="space-y-3">
      <ol className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const state =
          i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
        return (
          <li key={s.href} className="flex min-w-0 flex-1 items-center">
            <Link
              href={state === "pending" ? "#" : s.href}
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "group flex min-w-0 items-center gap-2",
                state === "pending" && "pointer-events-none"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  state === "done" && "bg-foreground text-background",
                  state === "active" &&
                    "bg-foreground text-background ring-4 ring-foreground/15",
                  state === "pending" &&
                    "bg-muted text-muted-foreground/60 ring-1 ring-border"
                )}
              >
                {state === "done" ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium tracking-tight sm:text-sm",
                  state === "active" && "text-foreground",
                  state === "done" && "text-foreground/80",
                  state === "pending" && "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </Link>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-3 h-px flex-1 transition-colors",
                  i < currentIdx ? "bg-foreground/40" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
      </ol>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span
          aria-hidden
          className="inline-block size-1.5 rounded-full"
          style={{ background: "#7ee787" }}
        />
        Auto-saved · close the tab anytime and come back to{" "}
        <Link href="/onboarding" className="underline-offset-2 hover:underline">
          /onboarding
        </Link>{" "}
        to resume.
      </div>
    </div>
  );
}
