import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

// Phase 4: upsert brand_kit, persist IG top_posts as assets, kick off competitor discovery.

type Audience = {
  tier: "primary" | "secondary" | "tertiary";
  description: string;
  pain_points: string[];
};

type Pillar = { name: string; pct: number; description: string };

type IgSnapshotPost = {
  code: string;
  url: string;
  caption: string | null;
  like_count: number | null;
  comment_count: number | null;
  media_type: "photo" | "video" | "carousel" | "other";
  thumbnail_url: string | null;
  taken_at: string | null;
};

type IgSnapshot = {
  handle: string;
  follower_count: number | null;
  is_business: boolean | null;
  top_posts: IgSnapshotPost[];
  fetched_at: string;
};

type Payload = {
  slug: string;
  name: string;
  primaryPlatform: "instagram" | "linkedin" | "facebook" | "tiktok";
  websiteUrl: string;
  igHandle: string;
  hqLocation: string;
  serviceArea: string[];
  foundedYear: string;
  founderNames: string[];
  tagline: string;
  positioning: string;
  mission: string;
  description: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  tone: {
    keywords: string[];
    dos: string[];
    donts: string[];
    vocab_use: string[];
    vocab_avoid: string[];
  };
  audiences: Audience[];
  contentPillars: Pillar[];
  hashtags: {
    always_on: string[];
    local: string[];
    service: string[];
    community: string[];
  };
  complianceFooter: string;
  photographyDirection: string;
  logos: Record<string, string>;
  igSnapshot: IgSnapshot | null;
};

export async function POST(request: NextRequest) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.slug || !body.name) {
    return Response.json(
      { error: "Brand name is required" },
      { status: 400 }
    );
  }

  const snap = body.igSnapshot;
  const row = {
    slug: body.slug,
    name: body.name,
    primary_platform: body.primaryPlatform ?? "instagram",
    website_url: body.websiteUrl || null,
    ig_handle: body.igHandle || null,
    ig_follower_count: snap?.follower_count ?? null,
    ig_is_business: snap?.is_business ?? null,
    hq_location: body.hqLocation || null,
    service_area: body.serviceArea ?? [],
    founded_year: body.foundedYear ? Number(body.foundedYear) : null,
    founder_names: body.founderNames ?? [],
    tagline: body.tagline || null,
    positioning: body.positioning || null,
    mission: body.mission || null,
    description: body.description || null,
    colors: body.colors ?? {},
    fonts: body.fonts ?? {},
    tone: body.tone ?? {
      keywords: [],
      dos: [],
      donts: [],
      vocab_use: [],
      vocab_avoid: [],
    },
    audiences: body.audiences ?? [],
    content_pillars: body.contentPillars ?? [],
    hashtags: body.hashtags ?? {
      always_on: [],
      local: [],
      service: [],
      community: [],
    },
    compliance_footer: body.complianceFooter || null,
    photography_direction: body.photographyDirection || null,
    logos: body.logos ?? {},
    onboarding_status: "in_progress" as const,
  };

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("brand_kits")
    .upsert(row, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (error) {
    console.error("[onboarding/submit] upsert failed", {
      slug: row.slug,
      code: error.code,
      message: error.message,
    });
    return Response.json(
      { error: "Failed to save brand kit", detail: error.message },
      { status: 500 }
    );
  }

  if (snap && snap.top_posts.length) {
    await sb
      .from("brand_kit_assets")
      .delete()
      .eq("brand_kit_id", data.id)
      .eq("kind", "ig_post");

    const assets = snap.top_posts
      .filter((p) => p.thumbnail_url)
      .map((p) => ({
        brand_kit_id: data.id,
        kind: "ig_post" as const,
        url: p.thumbnail_url!,
        meta: {
          code: p.code,
          permalink: p.url,
          caption: p.caption,
          like_count: p.like_count,
          comment_count: p.comment_count,
          media_type: p.media_type,
          taken_at: p.taken_at,
        },
      }));

    if (assets.length) {
      const { error: assetErr } = await sb.from("brand_kit_assets").insert(assets);
      if (assetErr) {
        console.warn("[onboarding/submit] asset insert failed", assetErr.message);
      }
    }
  }

  // Fire-and-forget competitor discovery. Safe to ignore errors — sidecar may be offline.
  if (body.igHandle) {
    void discoverCompetitors(data.id, body.igHandle).catch((err) =>
      console.warn("[onboarding/submit] competitor discovery failed", err)
    );
  }

  console.log("[onboarding/submit] saved brand kit", {
    id: data.id,
    slug: data.slug,
    ig_posts_persisted: snap?.top_posts.length ?? 0,
  });

  return Response.json({ ok: true, id: data.id, slug: data.slug });
}

async function discoverCompetitors(brandKitId: string, handle: string) {
  const base = process.env.IG_SIDECAR_URL;
  if (!base) return;
  const token = process.env.IG_SIDECAR_TOKEN;

  const res = await fetch(
    `${base.replace(/\/$/, "")}/related/${encodeURIComponent(handle)}`,
    {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!res.ok) return;
  const body = (await res.json()) as { handles?: string[] };
  const handles = (body.handles ?? []).slice(0, 8);
  if (!handles.length) return;

  await supabaseAdmin()
    .from("brand_kits")
    .update({ competitor_handles: handles })
    .eq("id", brandKitId);
}
