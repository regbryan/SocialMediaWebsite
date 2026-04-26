"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InviteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [ttlDays, setTtlDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIssued(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          slug: slug || undefined,
          ttlDays,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `Failed (${res.status})`);
      setIssued(body.url);
      setName("");
      setEmail("");
      setSlug("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="invite-name">Brand / client name</Label>
          <Input
            id="invite-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Riverside Hat Co"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Client email</Label>
          <Input
            id="invite-email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ceo@riversidehat.co"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-slug">Slug (optional)</Label>
          <Input
            id="invite-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="riverside"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-ttl">Expires in (days)</Label>
          <Input
            id="invite-ttl"
            type="number"
            min={1}
            max={60}
            value={ttlDays}
            onChange={(e) => setTtlDays(Number(e.target.value))}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {issued && (
        <div className="space-y-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">
            Invite link
          </p>
          <div className="flex gap-2">
            <Input value={issued} readOnly onFocus={(e) => e.currentTarget.select()} />
            <Button
              type="button"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(issued)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Generating…" : "Generate invite"}
        </Button>
      </div>
    </form>
  );
}
