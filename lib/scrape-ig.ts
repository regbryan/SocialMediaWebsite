import "server-only";
import { supabaseAdmin } from "./supabase-admin";

export type IgPost = {
  code: string;
  url: string;
  caption: string | null;
  like_count: number | null;
  comment_count: number | null;
  media_type: "photo" | "video" | "carousel" | "other";
  thumbnail_url: string | null;
  taken_at: string | null;
};

export type IgProfile = {
  handle: string;
  full_name: string | null;
  biography: string | null;
  external_url: string | null;
  follower_count: number | null;
  following_count: number | null;
  post_count: number | null;
  is_business: boolean | null;
  is_verified: boolean | null;
  profile_pic_url: string | null;
  top_posts: IgPost[];
  fetched_at: string;
  source: "cache" | "sidecar";
};

const CACHE_TTL_HOURS = 24;

function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

export async function fetchIgProfile(rawHandle: string): Promise<IgProfile> {
  const handle = normalizeHandle(rawHandle);
  if (!handle) throw new Error("Handle is required");

  const cached = await readCache(handle);
  if (cached) return cached;

  const fresh = await fetchFromSidecar(handle);
  await writeCache(handle, fresh);
  return fresh;
}

async function readCache(handle: string): Promise<IgProfile | null> {
  const { data, error } = await supabaseAdmin()
    .from("ig_profile_cache")
    .select("payload, fetched_at")
    .eq("handle", handle)
    .maybeSingle();

  if (error || !data) return null;

  const fetchedAt = new Date(data.fetched_at as string);
  const ageHours = (Date.now() - fetchedAt.getTime()) / 36e5;
  if (ageHours > CACHE_TTL_HOURS) return null;

  return { ...(data.payload as IgProfile), source: "cache" };
}

async function writeCache(handle: string, profile: IgProfile): Promise<void> {
  const payload = { ...profile, source: undefined };
  const { error } = await supabaseAdmin().from("ig_profile_cache").upsert(
    { handle, payload, fetched_at: new Date().toISOString() },
    { onConflict: "handle" }
  );
  if (error) console.warn("[scrape-ig] cache write failed", error.message);
}

// Sidecar contract: GET {BASE}/profile/{handle}?top_posts=6
// Returns JSON matching IgProfile (minus handle, source, fetched_at).
async function fetchFromSidecar(handle: string): Promise<IgProfile> {
  const base = process.env.IG_SIDECAR_URL;
  const token = process.env.IG_SIDECAR_TOKEN;

  if (!base) {
    throw new Error(
      "IG_SIDECAR_URL is not set — deploy instagrapi-rest sidecar to enable live IG fetch"
    );
  }

  const res = await fetch(
    `${base.replace(/\/$/, "")}/profile/${encodeURIComponent(handle)}?top_posts=6`,
    {
      headers: token ? { authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(30_000),
    }
  );

  if (!res.ok) {
    throw new Error(`Sidecar ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const body = (await res.json()) as Omit<IgProfile, "handle" | "source" | "fetched_at">;

  return {
    handle,
    full_name: body.full_name ?? null,
    biography: body.biography ?? null,
    external_url: body.external_url ?? null,
    follower_count: body.follower_count ?? null,
    following_count: body.following_count ?? null,
    post_count: body.post_count ?? null,
    is_business: body.is_business ?? null,
    is_verified: body.is_verified ?? null,
    profile_pic_url: body.profile_pic_url ?? null,
    top_posts: body.top_posts ?? [],
    fetched_at: new Date().toISOString(),
    source: "sidecar",
  };
}
