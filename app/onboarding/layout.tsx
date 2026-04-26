import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import Stepper from "./Stepper";
import { INVITE_COOKIE, verifyInvite } from "../../lib/invite-token";
import { isAdmin } from "../../lib/require-admin";
import { supabaseAdmin } from "../../lib/supabase-admin";

async function resolveAccess(): Promise<
  | { kind: "ok"; brandName: string; admin: boolean }
  | { kind: "blocked"; reason: string }
> {
  const jar = await cookies();
  const admin = await isAdmin();

  const cookieToken = jar.get(INVITE_COOKIE)?.value;
  const payload = await verifyInvite(cookieToken);
  if (payload) {
    // Cheap revocation/usage check on each render.
    const { data } = await supabaseAdmin()
      .from("brand_kit_invites")
      .select("used_at, revoked_at")
      .eq("jti", payload.jti)
      .maybeSingle();
    if (data?.revoked_at) {
      return { kind: "blocked", reason: "This invite has been revoked." };
    }
    if (data?.used_at) {
      return { kind: "blocked", reason: "This invite has already been used." };
    }
    return { kind: "ok", brandName: payload.name, admin };
  }

  if (admin) {
    return { kind: "ok", brandName: "New brand kit", admin: true };
  }

  return {
    kind: "blocked",
    reason: "Onboarding is invite-only. Ask your account manager for a link.",
  };
}

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await resolveAccess();

  if (access.kind === "blocked") {
    return (
      <div className="dark min-h-screen bg-background text-foreground">
        <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
          <span className="mb-6 inline-block size-2 rounded-full bg-gradient-to-br from-[#b18bff] to-[#3b81ff]" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Invite required
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{access.reason}</p>
          <Link
            href="/"
            className="mt-8 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </main>
      </div>
    );
  }

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
          <span className="text-xs text-muted-foreground">
            {access.admin ? "Admin · internal kit" : `Onboarding · ${access.brandName}`}
          </span>
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
