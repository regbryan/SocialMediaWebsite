import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

type BrandKit = {
  id: string;
  slug: string;
  name: string;
  primary_platform: string;
  tagline: string | null;
  positioning: string | null;
  description: string | null;
  ig_handle: string | null;
  ig_follower_count: number | null;
  ig_is_business: boolean | null;
  competitor_handles: string[] | null;
  colors: Record<string, string> | null;
  hq_location: string | null;
  audiences: Array<{ tier: string; description: string }> | null;
  content_pillars: Array<{ name: string; pct: number }> | null;
};

type AssetRow = {
  url: string;
  meta: {
    code?: string;
    permalink?: string;
    caption?: string | null;
    like_count?: number | null;
    comment_count?: number | null;
    media_type?: string;
    taken_at?: string | null;
  } | null;
};

type CachedProfile = {
  handle: string;
  full_name: string | null;
  follower_count: number | null;
  post_count: number | null;
  is_business: boolean | null;
  profile_pic_url: string | null;
  biography: string | null;
};

export const dynamic = "force-dynamic";

export default async function BrandKitDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = supabaseAdmin();

  const { data: kit, error } = await sb
    .from("brand_kits")
    .select(
      "id, slug, name, primary_platform, tagline, positioning, description, ig_handle, ig_follower_count, ig_is_business, competitor_handles, colors, hq_location, audiences, content_pillars"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !kit) notFound();
  const k = kit as BrandKit;

  const { data: postRows } = await sb
    .from("brand_kit_assets")
    .select("url, meta")
    .eq("brand_kit_id", k.id)
    .eq("kind", "ig_post")
    .order("created_at", { ascending: false });

  const posts = (postRows ?? []) as AssetRow[];

  const competitorHandles = (k.competitor_handles ?? []).map((h) =>
    h.toLowerCase()
  );
  let competitors: CachedProfile[] = [];
  if (competitorHandles.length) {
    const { data: cached } = await sb
      .from("ig_profile_cache")
      .select("handle, payload")
      .in("handle", competitorHandles);
    competitors = (cached ?? []).map((c) => {
      const p = c.payload as Partial<CachedProfile>;
      return {
        handle: c.handle as string,
        full_name: p.full_name ?? null,
        follower_count: p.follower_count ?? null,
        post_count: p.post_count ?? null,
        is_business: p.is_business ?? null,
        profile_pic_url: p.profile_pic_url ?? null,
        biography: p.biography ?? null,
      };
    });
  }

  const maxFollowers = Math.max(
    k.ig_follower_count ?? 0,
    ...competitors.map((c) => c.follower_count ?? 0),
    1
  );

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All brand kits
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{k.name}</h1>
            {k.tagline && (
              <p className="mt-2 max-w-xl text-muted-foreground">{k.tagline}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">
                {k.primary_platform}
              </Badge>
              {k.ig_handle && <Badge variant="outline">@{k.ig_handle}</Badge>}
              {k.hq_location && <Badge variant="outline">{k.hq_location}</Badge>}
              {k.ig_is_business && <Badge>business</Badge>}
            </div>
          </div>
          {k.colors?.primary && (
            <Card className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="size-8 rounded-md ring-1 ring-border"
                  style={{ background: k.colors.primary }}
                />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Primary</span>
                  <code className="text-xs font-medium">{k.colors.primary}</code>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {(k.positioning || k.description) && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {k.positioning && (
            <Card>
              <CardHeader>
                <CardDescription className="uppercase tracking-wide">
                  Positioning
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-foreground/90">
                {k.positioning}
              </CardContent>
            </Card>
          )}
          {k.description && (
            <Card>
              <CardHeader>
                <CardDescription className="uppercase tracking-wide">
                  Description
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-foreground/90">
                {k.description}
              </CardContent>
            </Card>
          )}
        </section>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Follower comparison</h2>
          <span className="text-xs text-muted-foreground">
            {competitors.length}/{competitorHandles.length} competitors hydrated
          </span>
        </div>
        <Card>
          <CardContent className="space-y-4 py-5">
            <Bar
              label={k.ig_handle ? `@${k.ig_handle}` : k.name}
              sublabel="you"
              value={k.ig_follower_count ?? 0}
              max={maxFollowers}
              highlight
            />
            {competitorHandles.length === 0 ? (
              <p className="pt-2 text-sm text-muted-foreground">
                No competitors discovered yet. Deploy the IG sidecar and re-run
                submit to populate.
              </p>
            ) : (
              competitorHandles.map((h) => {
                const match = competitors.find((c) => c.handle === h);
                return (
                  <Bar
                    key={h}
                    label={`@${h}`}
                    sublabel={match?.full_name ?? undefined}
                    value={match?.follower_count ?? 0}
                    max={maxFollowers}
                    muted={!match}
                    suffix={match ? null : "not fetched"}
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      {competitors.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">
            Competitor profiles
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((c) => (
              <Card key={c.handle} className="transition hover:border-foreground/30">
                <CardContent className="py-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11">
                      {c.profile_pic_url ? (
                        <AvatarImage src={c.profile_pic_url} alt={c.handle} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {c.handle.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">@{c.handle}</div>
                      {c.full_name && (
                        <div className="truncate text-xs text-muted-foreground">
                          {c.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MiniStat
                      label="followers"
                      value={c.follower_count?.toLocaleString() ?? "—"}
                    />
                    <MiniStat
                      label="posts"
                      value={c.post_count?.toLocaleString() ?? "—"}
                    />
                  </div>
                  {c.biography && (
                    <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">
                      {c.biography}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Top posts</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {posts.map((p, i) => {
              const permalink = p.meta?.permalink;
              return (
                <a
                  key={p.meta?.code ?? i}
                  href={permalink ?? p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-xl border border-border bg-card transition hover:border-foreground/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.meta?.caption ?? ""}
                    className="aspect-square w-full object-cover transition group-hover:scale-[1.03]"
                  />
                  <div className="flex justify-between px-3 py-2 text-xs text-muted-foreground">
                    <span>♥ {p.meta?.like_count?.toLocaleString() ?? "—"}</span>
                    <span>
                      💬 {p.meta?.comment_count?.toLocaleString() ?? "—"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {k.content_pillars && k.content_pillars.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Content mix</h2>
          <Card>
            <CardContent className="py-5">
              <div className="flex h-8 w-full overflow-hidden rounded-md ring-1 ring-border">
                {k.content_pillars.map((p, i) => (
                  <div
                    key={p.name + i}
                    title={`${p.name} · ${p.pct}%`}
                    className="flex items-center justify-center text-xs font-medium text-white"
                    style={{
                      width: `${p.pct}%`,
                      background: `hsl(${(i * 67 + 250) % 360} 55% 50%)`,
                    }}
                  >
                    {p.pct >= 10 ? p.name : ""}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {k.content_pillars.map((p, i) => (
                  <div
                    key={p.name + i}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span
                      className="size-2 rounded-sm"
                      style={{ background: `hsl(${(i * 67 + 250) % 360} 55% 50%)` }}
                    />
                    {p.name} · {p.pct}%
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function Bar({
  label,
  sublabel,
  value,
  max,
  highlight,
  muted,
  suffix,
}: {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  highlight?: boolean;
  muted?: boolean;
  suffix?: string | null;
}) {
  const pct = Math.max(1.5, (value / max) * 100);
  return (
    <div className="grid grid-cols-[200px_1fr_100px] items-center gap-4 text-sm">
      <div className="min-w-0">
        <div className={"truncate " + (highlight ? "font-semibold" : "")}>
          {label}
        </div>
        {sublabel && (
          <div className="truncate text-xs text-muted-foreground">{sublabel}</div>
        )}
      </div>
      <Progress
        value={pct}
        className={
          "h-2.5 " +
          (highlight
            ? "[&>div]:bg-foreground"
            : muted
              ? "[&>div]:bg-muted-foreground/30"
              : "[&>div]:bg-muted-foreground/70")
        }
      />
      <div className="text-right text-xs tabular-nums text-muted-foreground">
        {suffix ?? value.toLocaleString()}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}
