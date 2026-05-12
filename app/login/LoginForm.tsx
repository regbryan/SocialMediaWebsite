"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mode = "client" | "admin";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("client");

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-2">
        <div
          className="flex items-baseline gap-2 tracking-tight"
          style={{ color: "white", fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          SocialPulse
        </div>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          {mode === "client"
            ? "Enter your email and we'll send a sign-in link."
            : "Internal team access only."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className="flex rounded-md p-1"
          style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}
        >
          <ModeTab
            label="Client"
            active={mode === "client"}
            onClick={() => setMode("client")}
          />
          <ModeTab
            label="Admin"
            active={mode === "admin"}
            onClick={() => setMode("admin")}
          />
        </div>

        {mode === "client" ? (
          <ClientForm />
        ) : (
          <AdminForm next={next} router={router} />
        )}
      </CardContent>
    </Card>
  );
}

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors"
      style={{
        background: active ? "white" : "transparent",
        color: active ? "#07070e" : "#9999a6",
      }}
    >
      {label}
    </button>
  );
}

function ClientForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // Always succeed visually — server doesn't leak whether the email exists.
    await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div
        className="rounded-md border px-3 py-3 text-sm"
        style={{
          borderColor: "rgba(16,185,129,0.3)",
          background: "rgba(16,185,129,0.05)",
        }}
      >
        <p style={{ color: "rgb(167,243,208)" }}>
          If your email is on file, we just sent a sign-in link. Check your
          inbox in the next minute or two.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 text-xs underline text-muted-foreground hover:text-foreground"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-email">Email</Label>
        <Input
          id="client-email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          placeholder="you@brand.com"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Send sign-in link"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Links expire in 1 hour. You can request a new one anytime.
      </p>
    </form>
  );
}

function AdminForm({
  next,
  router,
}: {
  next: string;
  router: ReturnType<typeof useRouter>;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Login failed");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      {error ? (
        <p className="text-sm text-[var(--color-destructive)]">{error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
