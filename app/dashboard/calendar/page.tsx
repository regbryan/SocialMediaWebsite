import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { resolveDashboardUser } from "../../../lib/dashboard-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Kit = { id: string; slug: string; name: string };

type Draft = {
  id: string;
  brand_kit_id: string;
  slot_date: string;
  platform: string;
  pillar: string | null;
  caption: string | null;
  image_url: string | null;
  status: string;
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

export const dynamic = "force-dynamic";

/**
 * Admin-only cross-brand calendar.
 * Shows every brand's scheduled posts over a 30-day window, grouped by
 * day so the agency can answer "what's shipping this week, across the
 * book of business?" in one glance.
 */
export default async function CrossBrandCalendar() {
  const user = await resolveDashboardUser();
  if (user.kind !== "admin") notFound();

  const sb = supabaseAdmin();

  // 7 days back, 30 days forward — covers "what just shipped" + "what's
  // coming next." Tunable later if it gets noisy.
  const today = todayUTC();
  const past = addDaysUTC(today, -7);
  const future = addDaysUTC(today, 30);

  const [{ data: draftRows, error: draftErr }, { data: kitRows }] = await Promise.all([
    sb
      .from("content_drafts")
      .select(
        "id, brand_kit_id, slot_date, platform, pillar, caption, image_url, status"
      )
      .gte("slot_date", past)
      .lte("slot_date", future)
      .order("slot_date", { ascending: true }),
    sb.from("brand_kits").select("id, slug, name"),
  ]);

  if (draftErr) {
    return (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">
            Failed to load schedule
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {draftErr.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const drafts = (draftRows ?? []) as Draft[];
  const kits = (kitRows ?? []) as Kit[];
  const kitById: Record<string, Kit> = Object.fromEntries(
    kits.map((k) => [k.id, k])
  );

  // Pre-bucket drafts by date for fast lookup.
  const byDate: Record<string, Draft[]> = {};
  for (const d of drafts) {
    (byDate[d.slot_date] ??= []).push(d);
  }
  for (const date of Object.keys(byDate)) {
    byDate[date].sort((a, b) => {
      const ak = kitById[a.brand_kit_id]?.name ?? "";
      const bk = kitById[b.brand_kit_id]?.name ?? "";
      return ak.localeCompare(bk);
    });
  }

  // Build the visible date range (every day, even empty).
  const allDates: string[] = [];
  let cursor = past;
  while (cursor <= future) {
    allDates.push(cursor);
    cursor = addDaysUTC(cursor, 1);
  }

  const totals = {
    drafts: drafts.length,
    approved: drafts.filter((d) => d.status === "approved").length,
    changes: drafts.filter((d) => d.status === "changes_requested").length,
    pending: drafts.filter((d) => d.status === "pending").length,
    brands: Object.keys(kitById).filter((id) =>
      drafts.some((d) => d.brand_kit_id === id)
    ).length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totals.drafts} posts across {totals.brands} brand
            {totals.brands === 1 ? "" : "s"}, 7 days back through 30 days out.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">{totals.pending} pending</Badge>
          <Badge variant="default">{totals.approved} approved</Badge>
          {totals.changes > 0 && (
            <Badge variant="destructive">{totals.changes} need changes</Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {allDates.map((date) => (
          <DayRow
            key={date}
            date={date}
            today={today}
            drafts={byDate[date] ?? []}
            kitById={kitById}
          />
        ))}
      </div>
    </div>
  );
}

function DayRow({
  date,
  today,
  drafts,
  kitById,
}: {
  date: string;
  today: string;
  drafts: Draft[];
  kitById: Record<string, Kit>;
}) {
  const isToday = date === today;
  const isPast = date < today;
  const d = parseDateUTC(date);
  const heading = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div
      className="rounded-lg border"
      style={{
        background: isToday ? "rgba(139,92,255,0.05)" : "#0f0f1a",
        borderColor: isToday ? "rgba(139,92,255,0.45)" : "#1a1a2e",
        opacity: isPast && drafts.length === 0 ? 0.4 : 1,
      }}
    >
      <div className="flex items-baseline justify-between gap-4 border-b px-4 py-2.5"
        style={{ borderColor: "#1a1a2e" }}
      >
        <div className="flex items-baseline gap-3">
          <span
            className="text-sm font-semibold"
            style={{ color: isToday ? "#b18bff" : undefined }}
          >
            {heading}
          </span>
          {isToday && (
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "#b18bff" }}
            >
              Today
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {drafts.length === 0
            ? "—"
            : `${drafts.length} post${drafts.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {drafts.length > 0 && (
        <div className="divide-y" style={{ borderColor: "#1a1a2e" }}>
          {drafts.map((draft) => (
            <DraftRow
              key={draft.id}
              draft={draft}
              kit={kitById[draft.brand_kit_id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftRow({ draft, kit }: { draft: Draft; kit: Kit | undefined }) {
  if (!kit) return null;
  return (
    <Link
      href={`/dashboard/${kit.slug}/content#draft-${draft.id}`}
      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
    >
      <div
        className="size-10 shrink-0 overflow-hidden rounded"
        style={{ background: "#0a0a14" }}
      >
        {draft.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={draft.image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{kit.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {draft.platform}
          {draft.pillar ? ` · ${draft.pillar}` : ""}
          {draft.caption ? ` · ${draft.caption.slice(0, 80)}` : ""}
        </span>
      </div>
      <Badge variant={STATUS_VARIANT[draft.status] ?? "secondary"}>
        {STATUS_LABEL[draft.status] ?? draft.status}
      </Badge>
    </Link>
  );
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDateUTC(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

function addDaysUTC(dateStr: string, days: number): string {
  const d = parseDateUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
