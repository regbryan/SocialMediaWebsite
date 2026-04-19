# Social Pulse — Client Onboarding Scope

## Goal
Replace manual brand-kit setup with a self-serve wizard that produces a complete `brand_kit` record in Supabase, ready for the dashboard's content generation pipeline.

## Outputs (Brand Kit fields)
- **Identity**: brand name, slug, website URL, primary contact email
- **Social**: IG handle, IG user ID, IG access token (long-lived), FB page ID
- **Visual**: logo(s) — primary/white/mark, color palette (primary/secondary/accent/bg/text), fonts (heading/body)
- **Voice**: tagline, 1-paragraph description, tone keywords, do/don't lists
- **Content seed**: top 9 IG post thumbnails (for visual style reference), scraped site hero copy

## Wizard Steps

### 1. Basics
- Website URL + IG handle (text)
- Submit → triggers parallel scrape jobs

### 2. Auto-Discovery (loading state)
Run in parallel server-side:
- **Firecrawl** on website → extract `<title>`, meta description, hero H1, logo `<img>`, OG image, inline CSS color tokens
- **Color extraction** — Vibrant.js or `node-vibrant` on logo + hero image → palette
- **instagrapi-rest sidecar** → `GET /profile/:handle` + `/posts?limit=9` — pull profile pic, bio, follower count, top 9 posts (media URLs, captions, engagement)

Present all discovered data as editable cards in Step 3.

### 3. Review & Refine
- Editable brand name, tagline, description (prefilled from scrape)
- Color swatches — click to edit hex
- Logo upload (replace or keep scraped)
- Font picker (Google Fonts dropdown)

### 4. Voice
- Tone multi-select (Professional, Playful, Bold, Warm, Technical, etc.)
- Do/don't textarea pair
- Optional: upload existing brand guideline PDF → parse with Claude → prefill

### 5. Confirm
- Preview card showing assembled brand kit
- Submit → write to Supabase, redirect to `/dashboard/brand/[slug]`

## Instagram Data — instagrapi sidecar

Using **[subzeroid/instagrapi-rest](https://github.com/subzeroid/instagrapi-rest)** as a Python sidecar service. Skips Meta app review and lets us scrape competitor handles (not just the owner's).

### Architecture
```
Next.js (Social Media Website)  --HTTP-->  instagrapi-rest (Python/FastAPI sidecar)
                                                |
                                                --> IG private API (via proxy pool)
                                                --> Supabase cache (24h TTL)
```

### Deployment
- **Sidecar host**: Fly.io or Railway (Vercel doesn't run long-lived Python well). Dockerized, internal-only URL.
- **Auth between Next.js ↔ sidecar**: shared bearer token in env
- **Account pool**: 3–5 aged IG burner accounts, session files persisted to encrypted volume
- **Proxies**: Bright Data or IPRoyal residential, rotate per request
- **Fallback**: [instaloader](https://github.com/instaloader/instaloader) anonymous mode for public-only lookups when sidecar sessions are rate-limited

### Endpoints we'll expose on the sidecar
- `GET /profile/:handle` → {bio, pic_url, follower_count, following_count, post_count, is_business}
- `GET /profile/:handle/posts?limit=9` → top 9 recent posts w/ media URLs, captions, like/comment counts
- `GET /profile/:handle/competitors` → caller passes list of handles, returns batched profile data
- `POST /session/refresh` → internal, rotates a burner session

### Caching strategy
- Supabase `ig_profile_cache` table keyed by handle, 24h TTL
- Onboarding always hits cache first, falls through to sidecar on miss
- Never re-scrape on page reload

### Risk mitigation
- Circuit breaker: if sidecar returns >3 consecutive 429/ban errors, degrade to Brandfetch-only mode and flag the onboarding for manual review
- Optional paid fallback: Apify Instagram Scraper actor as a circuit-breaker tertiary (pay per call)
- No scraping of non-public data (no DMs, no followers lists)

## Schema — new Supabase tables

```sql
create table brand_kits (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  brand_id uuid references brands(id),
  name text not null,
  website_url text,
  ig_handle text,
  ig_follower_count int,
  ig_is_business boolean,
  competitor_handles text[],
  tagline text,
  description text,
  colors jsonb,                -- {primary, secondary, accent, bg, text}
  fonts jsonb,                 -- {heading, body}
  tone jsonb,                  -- {keywords[], dos[], donts[]}
  logos jsonb,                 -- {primary_url, white_url, mark_url}
  discovery_raw jsonb,         -- raw scrape payload for audit
  onboarding_status text default 'in_progress', -- in_progress | complete
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table brand_kit_assets (
  id uuid primary key default gen_random_uuid(),
  brand_kit_id uuid references brand_kits(id) on delete cascade,
  kind text,  -- 'logo' | 'ig_post' | 'hero_image'
  url text,
  meta jsonb,
  created_at timestamptz default now()
);
```

Storage bucket: `brand-assets/{slug}/logos/…`

## Routes (Next.js App Router — Social Media Website app)

- `app/onboarding/page.tsx` — wizard shell, client component, step state via URL param
- `app/onboarding/basics/page.tsx`
- `app/onboarding/discover/page.tsx` (server component — streams scrape results)
- `app/onboarding/review/page.tsx`
- `app/onboarding/voice/page.tsx`
- `app/onboarding/confirm/page.tsx`
- `app/api/onboarding/scrape/route.ts` — POST {url, ig_handle} → kicks off discovery
- `app/api/onboarding/ig/profile/route.ts` — proxies to instagrapi-rest sidecar, with Supabase caching
- `app/api/onboarding/ig/competitors/route.ts` — batch fetch competitor handles
- `app/api/onboarding/submit/route.ts` — finalizes brand_kit

## External services / env vars

| Var | Purpose |
|---|---|
| `FIRECRAWL_API_KEY` | website scrape |
| `INSTAGRAPI_SIDECAR_URL` | internal URL of instagrapi-rest service |
| `INSTAGRAPI_SIDECAR_TOKEN` | shared bearer auth |
| `PROXY_POOL_URL` | Bright Data / IPRoyal residential endpoint |
| `IG_BURNER_SESSIONS` | encrypted session-file blob for burner accounts |

## Build Phases

**Phase 1 — foundation** (≈1 day)
- Supabase tables + storage bucket
- `/onboarding/basics` + `/onboarding/confirm` working end-to-end with manual entry (no scraping yet)

**Phase 2 — website discovery** (≈1 day)
- Firecrawl integration + color extraction
- Review step with editable prefill

**Phase 3 — instagrapi sidecar** (≈2 days, no Meta review blocker)
- Dockerize instagrapi-rest, deploy to Fly.io/Railway
- Set up burner accounts + residential proxy pool
- Next.js `/api/onboarding/ig/*` routes w/ Supabase caching
- Circuit breaker + instaloader fallback

**Phase 4 — voice + guidelines upload** (≈1 day)
- PDF parse → Claude summarize → tone prefill

**Phase 5 — polish**
- Progress persistence (resume broken onboarding)
- Admin review queue before activation

## Open questions
1. Should `brand_kits` replace or augment the existing `brands` table in the dashboard?
2. Gating — public URL or invite-token required?
3. Sidecar host — Fly.io or Railway? (Fly.io better for persistent session volumes)
4. How many burner IG accounts to provision upfront? (recommend 3–5 to start, scale based on client volume)
