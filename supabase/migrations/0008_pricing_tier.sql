-- Phase 10: pricing tier binding.
-- Captures which plan the client signed up for so the admin team knows
-- what's been sold and can later enforce volume / platform limits.
--
-- Tier values:
--   'starter' — 5 posts/week, 1 platform
--   'growth'  — 7 posts/week, 3 platforms
--   'agency'  — unlimited / custom
--   null     — unknown (admin-issued invites, legacy rows)
--
-- Stored on both invite and kit so we can trace: which plan was advertised
-- on the inbound CTA, and which plan made it onto the final kit.

alter table brand_kit_invites
  add column if not exists tier text
    check (tier in ('starter', 'growth', 'agency'));

alter table brand_kits
  add column if not exists tier text
    check (tier in ('starter', 'growth', 'agency'));

create index if not exists brand_kits_tier_idx on brand_kits (tier);
