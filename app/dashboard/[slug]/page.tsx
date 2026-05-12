import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import {
  canViewKit,
  resolveDashboardUser,
} from "../../../lib/dashboard-auth";
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
import {
  engagementRate,
  engagementTone,
  formatEngagementRate,
  relativeTimeFrom,
} from "../../../lib/competitor-metrics";
import type { IgPost } from "../../../lib/scrape-ig";
import CompetitorRefreshButton from "./CompetitorRefreshButton";
import SidecarStatus from "./SidecarStatus";
import CompetitorSuggester from "./CompetitorSuggester";

type BrandKit = {
  id: string;
  slug: string;
  name: string;
  primary_platform: string;
  tier: string | null;
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
  top_posts: IgPost[];
  fetched_at: string | null;
  engagement_rate: number | null;
};

export const dynamic = "force-dynamic";

export default async function BrandKitDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await resolveDashboardUser();
  if (!canViewKit(user, slug)) notFound();

  const sb = supabaseAdmin();

  const { data: kit, error } = await sb
    .from("brand_kits")
    .select(
      "id, slug, name, primary_platform, tier, tagline, positioning, description, ig_handle, ig_follower_count, ig_is_business, competitor_handles, colors, hq_location, audiences, content_pillars"
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
      .select("handle, payload, fetched_at")
      .in("handle", competitorHandles);
    competitors = (cached ?? []).map((c) => {
      const p = c.payload as Partial<CachedProfile> & {
        top_posts?: IgPost[];
      };
      const posts = p.top_posts ?? [];
      return {
        handle: c.handle as string,
        full_name: p.full_name ?? null,
        follower_count: p.follower_count ?? null,
        post_count: p.post_count ?? null,
        is_business: p.is_business ?? null,
        profile_pic_url: p.profile_pic_url ?? null,
        biography: p.biography ?? null,
        top_posts: posts,
        fetched_at: (c.fetched_at as string | null) ?? null,
        engagement_rate: engagementRate(posts, p.follower_count ?? null),
      };
    });
    // Sort by engagement rate desc — the operator wants to see who's
    // actually winning attention, not just who has the largest audience.
    competitors.sort(
      (a, b) => (b.engagement_rate ?? -1) - (a.engagement_rate ?? -1)
    );
  }

  const maxFollowers = Math.max(
    k.ig_follower_count ?? 0,
    ...competitors.map((c) => c.follower_count ?? 0),
    1
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          {k.tagline && (
            <p className="max-w-xl text-muted-foreground">{k.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {k.tier && (
              <Badge className="capitalize" style={{ background: "#8b5cff" }}>
                {k.tier} plan
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {k.primary_platform}
            </Badge>
            {k.ig_handle && <Badge variant="outline">@{k.ig_handle}</Badge>}
            {k.hq_location && <Badge variant="outline">{k.hq_location}</Badge>}
            {k.ig_is_business && <Badge>Business account</Badge>}
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
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Follower comparison</h2>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-muted-foreground">
              {competitors.length} of {competitorHandles.length} competitor
              profile{competitorHandles.length === 1 ? "" : "s"} loaded
            </span>
            {user.kind === "admin" && <SidecarStatus />}
          </div>
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
                No competitors listed for this kit yet.
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
                    suffix={match ? null : "not loaded"}
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      {user.kind === "admin" && (
        <section>
          <CompetitorSuggester
            slug={k.slug}
            seedHandle={k.ig_handle}
            existing={competitorHandles}
          />
        </section>
      )}

      {competitors.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">
            Competitor profiles
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((c) => {
              const tone = engagementTone(c.engagement_rate);
              const toneColor =
                tone === "strong"
                  ? "#7ee787"
                  : tone === "healthy"
                    ? "#b18bff"
                    : tone === "weak"
                      ? "#f0a37a"
                      : undefined;
              return (
                <Card
                  key={c.handle}
                  className="transition hover:border-foreground/30"
                >
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={`https://instagram.com/${c.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-3 group"
                      >
                        <Avatar className="size-11">
                          {c.profile_pic_url ? (
                            <AvatarImage src={c.profile_pic_url} alt={c.handle} />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {c.handle.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium group-hover:underline">
                            @{c.handle}
                          </div>
                          {c.full_name && (
                            <div className="truncate text-xs text-muted-foreground">
                              {c.full_name}
                            </div>
                          )}
                        </div>
                      </a>
                      {user.kind === "admin" && (
                        <CompetitorRefreshButton handle={c.handle} />
                      )}
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <MiniStat
                        label="followers"
                        value={c.follower_count?.toLocaleString() ?? "—"}
                      />
                      <MiniStat
                        label="posts"
                        value={c.post_count?.toLocaleString() ?? "—"}
                      />
                      <MiniStat
                        label="engagement"
                        value={formatEngagementRate(c.engagement_rate)}
                        valueColor={toneColor}
                      />
                    </div>
                    {c.biography && (
                      <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                        {c.biography}
                      </p>
                    )}
                    {c.top_posts.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {c.top_posts.slice(0, 4).map((post) => (
                          <a
                            key={post.code}
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative block overflow-hidden rounded-md border border-border bg-muted"
                            style={{ aspectRatio: "1 / 1" }}
                            title={
                              post.caption
                                ? post.caption.slice(0, 120)
                                : "View on Instagram"
                            }
                          >
                            {post.thumbnail_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={post.thumbnail_url}
                                alt=""
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-[9px] uppercase text-muted-foreground">
                                {post.media_type}
                              </div>
                            )}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-1 py-1 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <span>♥ {compactNumber(post.like_count)}</span>
                              <span>💬 {compactNumber(post.comment_count)}</span>
                            </div>
                            {post.media_type === "video" && (
                              <span className="absolute right-1 top-1 rounded-sm bg-black/60 px-1 text-[8px] font-medium uppercase tracking-wider text-white">
                                ▸
                              </span>
                            )}
                            {post.media_type === "carousel" && (
                              <span className="absolute right-1 top-1 rounded-sm bg-black/60 px-1 text-[8px] font-medium uppercase tracking-wider text-white">
                                ▦
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Updated {relativeTimeFrom(c.fetched_at)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
    <div className="grid grid-cols-[1fr_auto] gap-2 text-sm sm:grid-cols-[minmax(120px,180px)_1fr_72px] sm:gap-4 sm:items-center">
      <div className="min-w-0">
        <div className={"truncate " + (highlight ? "font-semibold" : "")}>
          {label}
        </div>
        {sublabel && (
          <div className="truncate text-xs text-muted-foreground">{sublabel}</div>
        )}
      </div>
      <div className="text-right text-xs tabular-nums text-muted-foreground sm:order-last">
        {suffix ?? value.toLocaleString()}
      </div>
      <Progress
        value={pct}
        className={
          "col-span-2 h-2 sm:col-span-1 sm:h-2.5 " +
          (highlight
            ? "[&>div]:bg-foreground"
            : muted
              ? "[&>div]:bg-muted-foreground/30"
              : "[&>div]:bg-muted-foreground/70")
        }
      />
    </div>
  );
}

function compactNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${(n / 1_000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
}

function MiniStat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className="font-medium tabular-nums"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
