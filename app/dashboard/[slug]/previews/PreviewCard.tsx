"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Preview = {
  id: string;
  url: string;
  slot_label: string | null;
  status: string | null;
  feedback: string | null;
  reviewed_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  changes_requested: "Changes requested",
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

export default function PreviewCard({ preview }: { preview: Preview }) {
  const router = useRouter();
  const status = preview.status || "pending";
  const [busy, setBusy] = useState<"approve" | "changes" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(
    status === "changes_requested"
  );
  const [feedback, setFeedback] = useState(preview.feedback ?? "");

  const submit = async (
    action: "approve" | "request_changes",
    feedbackText?: string
  ) => {
    setBusy(action === "approve" ? "approve" : "changes");
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/previews/${preview.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback: feedbackText }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Update failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const onApprove = () => submit("approve");

  const onSubmitFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError("Tell us what to change.");
      return;
    }
    submit("request_changes", feedback.trim());
  };

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: "#0f0f1a", borderColor: "#1a1a2e" }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "4 / 5", background: "#0a0a14" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview.url}
          alt={preview.slot_label ?? "Preview"}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            {preview.slot_label ?? "Untitled"}
          </span>
          <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>
            {STATUS_LABEL[status] ?? status}
          </Badge>
        </div>

        {status === "changes_requested" && preview.feedback && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-foreground/80">
            <span className="font-medium text-destructive">Feedback:</span>{" "}
            {preview.feedback}
          </p>
        )}

        {!showFeedback ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setShowFeedback(true)}
              disabled={busy !== null}
            >
              Request changes
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={onApprove}
              disabled={busy !== null}
            >
              {busy === "approve" ? "Saving…" : status === "approved" ? "Approved" : "Approve"}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmitFeedback} className="space-y-2">
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
                onClick={() => setShowFeedback(false)}
                disabled={busy !== null}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="ml-auto"
                disabled={busy !== null}
              >
                {busy === "changes" ? "Sending…" : "Send feedback"}
              </Button>
            </div>
          </form>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
