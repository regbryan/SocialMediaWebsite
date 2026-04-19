-- Onboarding brand kit storage
-- Apply via Supabase SQL editor or `supabase db push`

create extension if not exists "pgcrypto";

create table if not exists brand_kits (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  website_url text,
  ig_handle text,
  ig_follower_count int,
  ig_is_business boolean,
  competitor_handles text[] default '{}',
  tagline text,
  description text,
  colors jsonb default '{}'::jsonb,      -- {primary, secondary, accent, bg, text}
  fonts jsonb default '{}'::jsonb,       -- {heading, body}
  tone jsonb default '{}'::jsonb,        -- {keywords: [], dos: [], donts: []}
  logos jsonb default '{}'::jsonb,       -- {primary_url, white_url, mark_url}
  discovery_raw jsonb,                   -- raw scrape payload for audit
  onboarding_status text not null default 'in_progress'
    check (onboarding_status in ('in_progress', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_kits_status_idx
  on brand_kits (onboarding_status);

create table if not exists brand_kit_assets (
  id uuid primary key default gen_random_uuid(),
  brand_kit_id uuid not null references brand_kits(id) on delete cascade,
  kind text not null check (kind in ('logo', 'ig_post', 'hero_image', 'other')),
  url text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists brand_kit_assets_brand_idx
  on brand_kit_assets (brand_kit_id);

-- Cache layer for IG scraper (24h TTL enforced in app code)
create table if not exists ig_profile_cache (
  handle text primary key,
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

-- touch updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists brand_kits_touch on brand_kits;
create trigger brand_kits_touch
  before update on brand_kits
  for each row execute function touch_updated_at();
