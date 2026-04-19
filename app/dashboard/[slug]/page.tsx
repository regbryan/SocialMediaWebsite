import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase-admin";

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
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← All brand kits
        </Link>
        <div className="mt-2 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">{k.name}</h1>
            {k.tagline && (
              <p className="mt-1 text-neutral-600">{k.tagline}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Pill>{k.primary_platform}</Pill>
              {k.ig_handle && <Pill>@{k.ig_handle}</Pill>}
              {k.hq_location && <Pill>{k.hq_location}</Pill>}
              {k.ig_is_business && <Pill>business</Pill>}
            </div>
          </div>
          {k.colors?.primary && (
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-neutral-200">
              <span
                className="size-6 rounded"
                style={{ background: k.colors.primary }}
              />
              <code className="text-xs">{k.colors.primary}</code>
            </div>
          )}
        </div>
      </div>

      {(k.positioning || k.description) && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {k.positioning && (
            <Card label="Positioning">{k.positioning}</Card>
          )}
          {k.description && (
            <Card label="Description">{k.description}</Card>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">Follower comparison</h2>
        <p className="text-sm text-neutral-600">
          Followers across {k.ig_handle ?? "this brand"} and its auto-discovered
          competitors.
        </p>
        <div className="mt-4 space-y-2 rounded-xl bg-white p-4 ring-1 ring-neutral-200">
          <Bar
            label={k.ig_handle ? `@${k.ig_handle} (you)` : k.name}
            value={k.ig_follower_count ?? 0}
            max={maxFollowers}
            highlight
          />
          {competitorHandles.length === 0 ? (
            <p className="pt-2 text-sm text-neutral-500">
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
                  value={match?.follower_count ?? 0}
                  max={maxFollowers}
                  muted={!match}
                  suffix={
                    match
                      ? null
                      : "not fetched"
                  }
                />
              );
            })
          )}
        </div>
      </section>

      {competitors.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Competitor profiles</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((c) => (
              <div
                key={c.handle}
                className="rounded-xl bg-white p-4 ring-1 ring-neutral-200"
              >
                <div className="flex items-center gap-3">
                  {c.profile_pic_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={c.profile_pic_url}
                      alt=""
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-neutral-200" />
                  )}
                  <div>
                    <div className="font-medium">@{c.handle}</div>
                    {c.full_name && (
                      <div className="text-xs text-neutral-500">
                        {c.full_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-neutral-600">
                  <Stat
                    label="followers"
                    value={c.follower_count?.toLocaleString() ?? "—"}
                  />
                  <Stat
                    label="posts"
                    value={c.post_count?.toLocaleString() ?? "—"}
                  />
                </div>
                {c.biography && (
                  <p className="mt-2 line-clamp-3 text-xs text-neutral-600">
                    {c.biography}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Top posts</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {posts.map((p, i) => {
              const permalink = p.meta?.permalink;
              return (
                <a
                  key={p.meta?.code ?? i}
                  href={permalink ?? p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200 hover:ring-neutral-400"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.meta?.caption ?? ""}
                    className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                  />
                  <div className="flex justify-between p-2 text-xs text-neutral-600">
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
          <h2 className="text-lg font-semibold">Content mix</h2>
          <div className="mt-3 flex h-6 w-full overflow-hidden rounded-full ring-1 ring-neutral-200">
            {k.content_pillars.map((p, i) => (
              <div
                key={p.name + i}
                title={`${p.name} · ${p.pct}%`}
                className="flex items-center justify-center text-xs text-white"
                style={{
                  width: `${p.pct}%`,
                  background: `hsl(${(i * 67) % 360} 60% 45%)`,
                }}
              >
                {p.pct >= 10 ? p.name : ""}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-2 py-0.5 text-neutral-700 ring-1 ring-neutral-300">
      {children}
    </span>
  );
}

function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-neutral-200">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-neutral-800">{children}</div>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  highlight,
  muted,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  highlight?: boolean;
  muted?: boolean;
  suffix?: string | null;
}) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <div className="grid grid-cols-[180px_1fr_90px] items-center gap-3 text-sm">
      <div className={"truncate " + (highlight ? "font-semibold" : "")}>
        {label}
      </div>
      <div className="h-5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={
            "h-full rounded-full " +
            (highlight
              ? "bg-neutral-900"
              : muted
                ? "bg-neutral-300"
                : "bg-neutral-500")
          }
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-xs tabular-nums text-neutral-600">
        {suffix ?? value.toLocaleString()}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-neutral-400">{label}</div>
      <div className="font-medium text-neutral-900">{value}</div>
    </div>
  );
}
