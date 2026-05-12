import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function Done({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; dash?: string; pending?: string }>;
}) {
  const { slug, dash, pending } = await searchParams;
  const isPending = pending === "1";

  return (
    <div className="space-y-8 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border/60 bg-background/40">
        <Check className="size-6 text-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {isPending ? "Submission received" : "You’re all set"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Brand kit{" "}
          <code className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
            {slug}
          </code>{" "}
          {isPending
            ? "is waiting for review."
            : "is live. Our team will start creating content shortly."}
        </p>
      </div>

      {dash ? (
        <div className="space-y-4 rounded-xl border border-border/60 bg-background/40 p-6 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your client dashboard
            </p>
            <p className="mt-1 text-sm text-foreground">
              We sent a magic link to your email. Or open your dashboard now. This link expires in 1 hour.
            </p>
          </div>
          <Link
            href={dash}
            className={buttonVariants({ variant: "default" })}
          >
            Open my dashboard →
          </Link>
        </div>
      ) : isPending ? (
        <div className="rounded-xl border border-border/60 bg-background/40 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            What happens next
          </p>
          <p className="mt-2 text-sm text-foreground">
            We&apos;re reviewing your submission. You&apos;ll get an email with
            your dashboard link within one business day.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-left">
          <p className="text-sm text-muted-foreground">
            Your account manager will follow up shortly with access to your
            content review dashboard.
          </p>
        </div>
      )}

      <div className="flex justify-center border-t border-border/60 pt-6">
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
