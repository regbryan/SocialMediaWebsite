-- Phase 1b: enrich brand_kits schema based on audit of existing brand folders.
-- See ONBOARDING_SCHEMA_AUDIT.md for rationale per column.

alter table brand_kits
  add column if not exists primary_platform text not null default 'instagram'
    check (primary_platform in ('instagram', 'linkedin', 'facebook', 'tiktok')),
  add column if not exists positioning text,
  add column if not exists mission text,
  add column if not exists hq_location text,
  add column if not exists service_area text[] default '{}',
  add column if not exists founded_year int,
  add column if not exists founder_names text[] default '{}',
  add column if not exists audiences jsonb default '[]'::jsonb,
  add column if not exists content_pillars jsonb default '[]'::jsonb,
  add column if not exists hashtags jsonb default '{}'::jsonb,
  add column if not exists compliance_footer text,
  add column if not exists photography_direction text,
  add column if not exists confidence jsonb default '{}'::jsonb;

-- IG columns must be nullable since LinkedIn-only brands (e.g. Doug Mitchell) won't have them.
alter table brand_kits
  alter column ig_handle drop not null,
  alter column ig_follower_count drop not null;

-- Relax brand_kit_assets.kind to include the real variety in client folders.
alter table brand_kit_assets
  drop constraint if exists brand_kit_assets_kind_check;
alter table brand_kit_assets
  add constraint brand_kit_assets_kind_check
  check (kind in (
    'logo','ig_post','hero_image','cutout','photo_library','brand_doc','other'
  ));

-- Tone jsonb shape is not constrained by DDL; app contract:
-- {
--   keywords: string[],
--   dos: string[],
--   donts: string[],
--   vocab_use: string[],
--   vocab_avoid: string[],
--   glossary: { [term]: definition },
--   context_matrix: { [context]: opener_pattern }
-- }
