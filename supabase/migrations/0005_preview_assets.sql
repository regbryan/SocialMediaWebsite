-- Phase 7: preview-review loop.
-- After admin approves a self-serve submission, they generate (or upload)
-- preview designs. The client reviews each preview in their dashboard:
--   pending  → approved | changes_requested
-- When every preview is approved OR client clicks "Approve the kit",
-- brand_kits.kit_approved_at is stamped and the kit is ready for the
-- content-generation pipeline.

-- Add 'preview' to the asset kind enum.
alter table brand_kit_assets
  drop constraint if exists brand_kit_assets_kind_check;
alter table brand_kit_assets
  add constraint brand_kit_assets_kind_check
  check (kind in ('logo', 'ig_post', 'hero_image', 'cutout', 'photo_library', 'preview', 'other'));

-- Per-asset review state for previews (other kinds keep status null).
alter table brand_kit_assets
  add column if not exists status text
    check (status in ('pending', 'approved', 'changes_requested')),
  add column if not exists feedback text,
  add column if not exists slot_label text,
  add column if not exists reviewed_at timestamptz;

-- Kit-level milestones in the post-approval pipeline.
alter table brand_kits
  add column if not exists previews_generated_at timestamptz,
  add column if not exists kit_approved_at timestamptz;

-- Fast lookup of preview assets per kit, ordered by their slot.
create index if not exists brand_kit_assets_preview_idx
  on brand_kit_assets (brand_kit_id, slot_label)
  where kind = 'preview';
