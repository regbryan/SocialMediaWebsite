-- A/B variant on content_drafts.
-- Admin can request a second image variation for a draft; the new image
-- lives in variant_image_url alongside the primary so the client can
-- compare side-by-side and pick. Promoting the variant swaps it into
-- image_url; discarding clears the variant fields.

alter table content_drafts
  add column if not exists variant_image_url text,
  add column if not exists variant_caption text,
  add column if not exists variant_generated_at timestamptz;
