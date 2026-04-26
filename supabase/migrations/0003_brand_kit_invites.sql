-- Phase 5: client onboarding invites.
-- Admin mints a signed invite tied to a slug; client uses the link to fill
-- onboarding without an account. Invite is single-use and time-bound.

create table if not exists brand_kit_invites (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  email text not null,
  jti text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_brand_kit_id uuid references brand_kits(id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists brand_kit_invites_slug_idx
  on brand_kit_invites (slug);
create index if not exists brand_kit_invites_active_idx
  on brand_kit_invites (expires_at)
  where used_at is null and revoked_at is null;
