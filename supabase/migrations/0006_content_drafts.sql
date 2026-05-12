-- Phase 8: content generation + review.
-- Once brand_kits.kit_approved_at is set, admin (or generator) creates a
-- 30-day batch of content_drafts. Client reviews each draft in their
-- dashboard with the same pending → approved | changes_requested pattern
-- used on previews.

create table if not exists content_drafts (
  id uuid primary key default gen_random_uuid(),
  brand_kit_id uuid not null references brand_kits(id) on delete cascade,
  slot_date date not null,
  platform text not null default 'instagram'
    check (platform in ('instagram', 'linkedin', 'facebook', 'tiktok')),
  pillar text,
  caption text,
  image_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'changes_requested')),
  feedback text,
  reviewed_at timestamptz,
  published_at timestamptz,
  generated_batch_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_drafts_kit_date_idx
  on content_drafts (brand_kit_id, slot_date);

create index if not exists content_drafts_pending_idx
  on content_drafts (brand_kit_id, status)
  where status = 'pending';

-- updated_at touch on every change. Reuses standard trigger pattern.
create or replace function content_drafts_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_drafts_set_updated_at on content_drafts;
create trigger content_drafts_set_updated_at
before update on content_drafts
for each row execute function content_drafts_touch_updated_at();

-- Track batch lineage on the brand kit so the dashboard can show "30 drafts
-- generated on …" at a glance.
alter table brand_kits
  add column if not exists last_batch_generated_at timestamptz,
  add column if not exists last_batch_id uuid;
