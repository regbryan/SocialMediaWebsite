import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import {
  canViewKit,
  resolveDashboardUser,
} from "../../../../lib/dashboard-auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import CalendarBoard, {
  type CalendarDraft,
  type CalendarWeek,
} from "./CalendarBoard";

type Kit = {
  id: string;
  slug: string;
  name: string;
  kit_approved_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await resolveDashboardUser();
  if (!canViewKit(user, slug)) notFound();

  const sb = supabaseAdmin();
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, slug, name, kit_approved_at")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) notFound();
  const k = kit as Kit;

  const { data: draftRows } = await sb
    .from("content_drafts")
    .select("id, slot_date, platform, pillar, caption, image_url, status")
    .eq("brand_kit_id", k.id)
    .order("slot_date", { ascending: true });
  const drafts = (draftRows ?? []) as CalendarDraft[];

  const weeks = groupByWeek(drafts);
  const today = todayUTC();
  const isAdmin = user.kind === "admin";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {drafts.length === 0
              ? "No drafts scheduled."
              : `${drafts.length} drafts across ${weeks.length} week${weeks.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Link
          href={`/dashboard/${k.slug}/content`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Grid view →
        </Link>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nothing scheduled yet</CardTitle>
            <CardDescription>
              {k.kit_approved_at
                ? "Generate a content batch from the content page to populate the calendar."
                : "Approve the brand kit first, then generate content."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <CalendarBoard
          initialWeeks={weeks}
          slug={k.slug}
          isAdmin={isAdmin}
          today={today}
        />
      )}
    </div>
  );
}

function groupByWeek(drafts: CalendarDraft[]): CalendarWeek[] {
  if (drafts.length === 0) return [];

  const byDate: Record<string, CalendarDraft[]> = {};
  for (const d of drafts) {
    (byDate[d.slot_date] ??= []).push(d);
  }

  const allDates = Object.keys(byDate).sort();
  const first = parseDateUTC(allDates[0]);
  const last = parseDateUTC(allDates[allDates.length - 1]);

  // Monday start of week
  const start = new Date(first);
  const dow = (first.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - dow);

  const end = new Date(last);
  const endDow = (last.getUTCDay() + 6) % 7;
  end.setUTCDate(end.getUTCDate() + (6 - endDow));

  const weeks: CalendarWeek[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const weekStart = formatDateUTC(cursor);
    const days: CalendarWeek["days"] = [];
    for (let i = 0; i < 7; i++) {
      const date = formatDateUTC(cursor);
      days.push({ date, drafts: byDate[date] ?? [] });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push({ start: weekStart, days });
  }
  return weeks;
}

function todayUTC(): string {
  return formatDateUTC(new Date());
}

function parseDateUTC(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

function formatDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}
