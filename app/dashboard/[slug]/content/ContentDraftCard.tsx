"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Draft = {
  id: string;
  slot_date: string;
  platform: string;
  pillar: string | null;
  caption: string | null;
  image_url: string | null;
  variant_image_url: string | null;
  variant_caption: string | null;
  status: string;
  feedback: string | null;
  reviewed_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  changes_requested: "Changes",
  pending: "Pending",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  approved: "default",
  changes_requested: "destructive",
  pending: "secondary",
};

/**
 * Pull `#tags` out of a caption. We strip them from the displayed prose
 * (the chip row carries them) and dedupe by lowercase. Matches the
 * standard IG tag charset — letters, digits, underscore.
 */
function splitCaption(caption: string | null): {
  captionBody: string;
  hashtags: string[];
} {
  if (!caption) return { captionBody: "", hashtags: [] };
  const seen = new Set<string>();
  const hashtags: string[] = [];
  const body = caption.replace(/#([A-Za-z0-9_]{2,50})/g, (_, tag: string) => {
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      hashtags.push(tag);
    }
    return "";
  });
  return {
    captionBody: body.replace(/\s+/g, " ").trim(),
    hashtags,
  };
}

export default function ContentDraftCard({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "feedback" | "edit">("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(draft.feedback ?? "");
  const [caption, setCaption] = useState(draft.caption ?? "");
  const [imageUrl, setImageUrl] = useState(draft.image_url ?? "");

  const review = async (action: "approve" | "request_changes", note?: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/content/${draft.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback: note }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Update failed");
      setMode("view");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/content/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          image_url: imageUrl,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Save failed");
      setMode("view");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${draft.id}/regenerate`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.detail || "Generation failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const generateVariant = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${draft.id}/variant`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.detail || "Variant failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Variant failed");
    } finally {
      setBusy(false);
    }
  };

  const variantAction = async (action: "promote_variant" | "discard_variant") => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/content/${draft.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Variant action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Variant action failed");
    } finally {
      setBusy(false);
    }
  };

  const submitFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Tell us what to change.");
      return;
    }
    review("request_changes", feedback.trim());
  };

  const dateLabel = new Date(`${draft.slot_date}T12:00:00Z`).toLocaleDateString(
    undefined,
    { weekday: "short", month: "short", day: "numeric" }
  );

  // Pull hashtags out of the caption so we can show them separately as
  // chips. Strip them from the displayed prose — the chip row carries
  // them and the line-clamp shows actual copy.
  const { captionBody, hashtags } = splitCaption(draft.caption);
  const platformCap =
    draft.platform === "linkedin"
      ? 0
      : draft.platform === "tiktok" || draft.platform === "facebook"
        ? 3
        : draft.platform === "instagram"
          ? 30
          : 8;
  const overCap = platformCap > 0 && hashtags.length > platformCap;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: "#0f0f1a", borderColor: "#1a1a2e" }}
    >
      {draft.variant_image_url ? (
        <div className="grid grid-cols-2" style={{ background: "#0a0a14" }}>
          <div
            className="relative"
            style={{ aspectRatio: "1 / 1", background: "#0a0a14" }}
          >
            {draft.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={draft.image_url}
                alt="Primary"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No primary
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-sm bg-black/65 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white">
              A · current
            </span>
            <button
              type="button"
              onClick={() => variantAction("discard_variant")}
              disabled={busy}
              className="absolute bottom-2 left-2 rounded-md border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-black/80 disabled:opacity-50"
            >
              {busy ? "…" : "Keep A"}
            </button>
          </div>
          <div
            className="relative border-l"
            style={{ aspectRatio: "1 / 1", background: "#0a0a14", borderColor: "#1a1a2e" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.variant_image_url}
              alt="Variant"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <span
              className="absolute left-2 top-2 rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white"
              style={{ background: "rgba(139,92,255,0.85)" }}
            >
              B · variant
            </span>
            <button
              type="button"
              onClick={() => variantAction("promote_variant")}
              disabled={busy}
              className="absolute bottom-2 right-2 rounded-md px-2 py-1 text-[10px] font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: "rgba(139,92,255,0.9)" }}
            >
              {busy ? "…" : "Use B"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full"
          style={{ aspectRatio: "1 / 1", background: "#0a0a14" }}
        >
          {draft.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={draft.image_url}
              alt={draft.pillar ?? "Content draft"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image yet
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {dateLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {draft.platform}
              {draft.pillar ? ` · ${draft.pillar}` : ""}
            </span>
          </div>
          <Badge variant={STATUS_VARIANT[draft.status] ?? "secondary"}>
            {STATUS_LABEL[draft.status] ?? draft.status}
          </Badge>
        </div>

        {mode === "view" && (
          <>
            <p className="line-clamp-4 min-h-[3em] text-xs leading-relaxed text-foreground/80">
              {captionBody ? (
                captionBody
              ) : draft.caption ? (
                <span className="text-muted-foreground italic">
                  (caption is only hashtags)
                </span>
              ) : (
                <span className="text-muted-foreground italic">
                  Caption pending
                </span>
              )}
            </p>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {hashtags.map((t) => (
                  <span
                    key={t}
                    className="rounded-sm border px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground"
                    style={{ borderColor: "#1f1f33", background: "#0a0a14" }}
                  >
                    #{t}
                  </span>
                ))}
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: overCap ? "#f0a37a" : "rgb(115 115 115)" }}
                  title={
                    overCap
                      ? `${draft.platform} caps at ${platformCap} hashtags`
                      : undefined
                  }
                >
                  {hashtags.length}
                  {platformCap > 0 ? `/${platformCap}` : ""}
                </span>
              </div>
            )}

            {draft.status === "changes_requested" && draft.feedback && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-foreground/80">
                <span className="font-medium text-destructive">Feedback:</span>{" "}
                {draft.feedback}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={regenerate}
                disabled={busy}
                className="flex-1"
                variant={draft.image_url ? "outline" : "default"}
              >
                {busy
                  ? "Generating…"
                  : draft.image_url
                  ? draft.status === "changes_requested"
                    ? "Regenerate with feedback"
                    : "Regenerate"
                  : "Generate"}
              </Button>
              {draft.image_url && !draft.variant_image_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateVariant}
                  disabled={busy}
                  title="Generate a second image variation to compare A/B"
                >
                  Try a variant
                </Button>
              )}
            </div>
            {draft.variant_image_url && (
              <p className="rounded-md border px-3 py-2 text-[11px] leading-relaxed text-foreground/80"
                style={{ borderColor: "rgba(139,92,255,0.35)", background: "rgba(139,92,255,0.06)" }}
              >
                Two takes generated. Pick one above — choosing B replaces the
                primary image and resets review state.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode("edit")}
                disabled={busy}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode("feedback")}
                disabled={busy}
                className="flex-1"
              >
                Request changes
              </Button>
              <Button
                size="sm"
                onClick={() => review("approve")}
                disabled={busy || draft.status === "approved"}
                className="flex-1"
              >
                {draft.status === "approved" ? "Approved" : "Approve"}
              </Button>
            </div>
          </>
        )}

        {mode === "feedback" && (
          <form onSubmit={submitFeedback} className="space-y-2">
            <Textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What needs to change?"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setMode("view")}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="ml-auto"
                disabled={busy}
              >
                {busy ? "Sending…" : "Send feedback"}
              </Button>
            </div>
          </form>
        )}

        {mode === "edit" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`img-${draft.id}`} className="text-xs">
                Image URL
              </Label>
              <Input
                id={`img-${draft.id}`}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`cap-${draft.id}`} className="text-xs">
                Caption
              </Label>
              <Textarea
                id={`cap-${draft.id}`}
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Post caption…"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCaption(draft.caption ?? "");
                  setImageUrl(draft.image_url ?? "");
                  setMode("view");
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="ml-auto"
                onClick={saveEdit}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
