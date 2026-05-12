-- Phase 9: agency-owner notification digest.
-- When clients leave feedback on previews or content drafts, the cron
-- handler at /api/cron/feedback-digest collects everything unsent since
-- the last run and emails the owner once a day. We track `notified_at`
-- per row so the cron is idempotent and we never double-send.

alter table brand_kit_assets
  add column if not exists notified_at timestamptz;

alter table content_drafts
  add column if not exists notified_at timestamptz;

create index if not exists brand_kit_assets_unnotified_feedback_idx
  on brand_kit_assets (reviewed_at)
  where status = 'changes_requested' and notified_at is null;

create index if not exists content_drafts_unnotified_feedback_idx
  on content_drafts (reviewed_at)
  where status = 'changes_requested' and notified_at is null;
