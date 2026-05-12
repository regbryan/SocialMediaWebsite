"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export type CalendarDraft = {
  id: string;
  slot_date: string;
  platform: string;
  pillar: string | null;
  caption: string | null;
  image_url: string | null;
  status: string;
};

export type CalendarWeek = {
  start: string;
  days: Array<{ date: string; drafts: CalendarDraft[] }>;
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  approved: "default",
  changes_requested: "destructive",
  pending: "secondary",
};

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  changes_requested: "Changes",
  pending: "Pending",
};

type DragState = {
  draftId: string;
  fromDate: string;
} | null;

/**
 * Drag-and-drop reschedule calendar.
 *
 * Admin-only behavior: drag a draft pill from one day cell onto another.
 * On drop, the day cell PATCHes `slot_date` and the page refreshes.
 * Clients see the same calendar but pills are just links — no drag, no
 * drop targets.
 *
 * Optimistic state: we keep a local `weeks` mirror so the pill visually
 * moves immediately on drop. If the PATCH fails, we revert and surface
 * the error inline.
 */
export default function CalendarBoard({
  initialWeeks,
  slug,
  isAdmin,
  today,
}: {
  initialWeeks: CalendarWeek[];
  slug: string;
  isAdmin: boolean;
  today: string;
}) {
  const router = useRouter();
  const [weeks, setWeeks] = useState<CalendarWeek[]>(initialWeeks);
  const [drag, setDrag] = useState<DragState>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const moveDraftLocal = (
    snapshot: CalendarWeek[],
    draftId: string,
    targetDate: string
  ): CalendarWeek[] => {
    let moving: CalendarDraft | null = null;
    const stripped = snapshot.map((w) => ({
      ...w,
      days: w.days.map((d) => {
        const idx = d.drafts.findIndex((x) => x.id === draftId);
        if (idx === -1) return d;
        moving = { ...d.drafts[idx], slot_date: targetDate };
        return { ...d, drafts: d.drafts.filter((x) => x.id !== draftId) };
      }),
    }));
    if (!moving) return snapshot;
    return stripped.map((w) => ({
      ...w,
      days: w.days.map((d) =>
        d.date === targetDate ? { ...d, drafts: [...d.drafts, moving!] } : d
      ),
    }));
  };

  const onDrop = async (targetDate: string) => {
    setHoverDate(null);
    if (!drag) return;
    if (drag.fromDate === targetDate) {
      setDrag(null);
      return;
    }

    const previous = weeks;
    const optimistic = moveDraftLocal(weeks, drag.draftId, targetDate);
    setWeeks(optimistic);
    setPendingDate(targetDate);
    setError(null);

    try {
      const res = await fetch(`/api/dashboard/content/${drag.draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_date: targetDate }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Reschedule failed");
      // Server sync: pulls in any side effects (status reset to pending,
      // reviewed_at cleared by the PATCH handler).
      router.refresh();
    } catch (err) {
      setWeeks(previous);
      setError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setDrag(null);
      setPendingDate(null);
    }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <p className="text-xs text-muted-foreground">
          Drag a post to reschedule it. Moving a draft resets its review state
          so the client re-approves.
        </p>
      )}
      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {weeks.map((week) => (
        <WeekRow
          key={week.start}
          week={week}
          slug={slug}
          today={today}
          isAdmin={isAdmin}
          drag={drag}
          hoverDate={hoverDate}
          pendingDate={pendingDate}
          onDragStart={(draftId, fromDate) => setDrag({ draftId, fromDate })}
          onDragEnd={() => {
            setDrag(null);
            setHoverDate(null);
          }}
          onDragEnter={(date) => setHoverDate(date)}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

function WeekRow({
  week,
  slug,
  today,
  isAdmin,
  drag,
  hoverDate,
  pendingDate,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: {
  week: CalendarWeek;
  slug: string;
  today: string;
  isAdmin: boolean;
  drag: DragState;
  hoverDate: string | null;
  pendingDate: string | null;
  onDragStart: (draftId: string, fromDate: string) => void;
  onDragEnd: () => void;
  onDragEnter: (date: string) => void;
  onDrop: (date: string) => void;
}) {
  const startDate = parseDateUTC(week.start);
  const endDate = parseDateUTC(week.days[6].date);
  const label = `${formatHuman(startDate)} – ${formatHuman(endDate, true)}`;
  const weekCount = week.days.reduce((acc, d) => acc + d.drafts.length, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
        <span className="text-xs text-muted-foreground">{weekCount} posts</span>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
      <div
        className="grid gap-2 sm:grid-cols-7"
        style={{ gridTemplateColumns: "repeat(7, minmax(120px, 1fr))" }}
      >
        {week.days.map((day) => (
          <DayCell
            key={day.date}
            day={day}
            slug={slug}
            today={today}
            isAdmin={isAdmin}
            drag={drag}
            isHover={hoverDate === day.date}
            isPending={pendingDate === day.date}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

function DayCell({
  day,
  slug,
  today,
  isAdmin,
  drag,
  isHover,
  isPending,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: {
  day: { date: string; drafts: CalendarDraft[] };
  slug: string;
  today: string;
  isAdmin: boolean;
  drag: DragState;
  isHover: boolean;
  isPending: boolean;
  onDragStart: (draftId: string, fromDate: string) => void;
  onDragEnd: () => void;
  onDragEnter: (date: string) => void;
  onDrop: (date: string) => void;
}) {
  const date = parseDateUTC(day.date);
  const isToday = day.date === today;
  const isPast = day.date < today;
  const dayNum = date.getUTCDate();
  const dayName = date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });

  const isDropTarget = isAdmin && drag && drag.fromDate !== day.date;
  const showRing = isDropTarget && isHover;

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDropTarget) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={() => isDropTarget && onDragEnter(day.date)}
      onDrop={(e) => {
        if (!isDropTarget) return;
        e.preventDefault();
        onDrop(day.date);
      }}
      className="rounded-lg border p-2 transition-colors"
      style={{
        background: showRing
          ? "rgba(139,92,255,0.12)"
          : isToday
            ? "rgba(139,92,255,0.06)"
            : "#0f0f1a",
        borderColor: showRing
          ? "rgba(139,92,255,0.75)"
          : isToday
            ? "rgba(139,92,255,0.45)"
            : "#1a1a2e",
        minHeight: "120px",
        opacity: isPast && day.drafts.length === 0 ? 0.4 : 1,
        outline: isPending ? "1px dashed rgba(139,92,255,0.6)" : undefined,
      }}
    >
      <div className="mb-1 flex items-baseline justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{dayName}</span>
        <span style={{ color: isToday ? "#b18bff" : undefined }}>{dayNum}</span>
      </div>
      <div className="space-y-1.5">
        {day.drafts.map((d) => (
          <DraftPill
            key={d.id}
            draft={d}
            slug={slug}
            draggable={isAdmin}
            isDragging={drag?.draftId === d.id}
            onDragStart={() => onDragStart(d.id, day.date)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

function DraftPill({
  draft,
  slug,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  draft: CalendarDraft;
  slug: string;
  draggable: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const content = (
    <div
      className="overflow-hidden rounded-md border transition-colors hover:border-foreground/30"
      style={{
        borderColor: "#1a1a2e",
        cursor: draggable ? "grab" : "pointer",
        opacity: isDragging ? 0.4 : 1,
      }}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.effectAllowed = "move";
        // Some browsers require a payload for drag to work.
        e.dataTransfer.setData("text/plain", draft.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
    >
      {draft.image_url ? (
        <div className="relative h-16 w-full" style={{ background: "#0a0a14" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={draft.image_url}
            alt={draft.pillar ?? "Draft"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>
      ) : (
        <div
          className="flex h-10 items-center justify-center text-[10px] text-muted-foreground"
          style={{ background: "#0a0a14" }}
        >
          {draft.pillar ?? "Empty"}
        </div>
      )}
      <div className="flex items-center justify-between gap-1 px-1.5 py-1">
        <span className="text-[10px] text-muted-foreground">
          {draft.platform.slice(0, 2).toUpperCase()}
        </span>
        <Badge
          variant={STATUS_VARIANT[draft.status] ?? "secondary"}
          className="px-1 py-0 text-[9px]"
        >
          {STATUS_LABEL[draft.status] ?? draft.status}
        </Badge>
      </div>
    </div>
  );

  // Admins drag, everyone clicks through to the grid view.
  if (draggable) {
    return (
      <Link
        href={`/dashboard/${slug}/content#draft-${draft.id}`}
        className="block"
        onDragStart={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    );
  }
  return (
    <Link href={`/dashboard/${slug}/content#draft-${draft.id}`} className="block">
      {content}
    </Link>
  );
}

function parseDateUTC(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

function formatHuman(d: Date, withYear?: boolean): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}
