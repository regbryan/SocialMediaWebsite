-- Phase 6: hybrid onboarding (self-serve entry + admin approval queue).
-- Admin-issued invites still auto-provision. Self-serve submissions land in
-- a "pending" review queue; admin approves before client gets dashboard access.

-- Track invite origin so the submit handler can branch behavior.
alter table brand_kit_invites
  add column if not exists source text not null default 'admin'
    check (source in ('admin', 'self-serve'));

-- Approval state on the brand kit itself (separate from onboarding completion).
-- null = legacy / admin-issued (no review needed)
-- 'pending'  = self-serve submission awaiting admin approval
-- 'approved' = admin approved; client access provisioned
-- 'rejected' = admin rejected
alter table brand_kits
  add column if not exists review_status text
    check (review_status in ('pending', 'approved', 'rejected')),
  add column if not exists reviewed_at timestamptz,
  add column if not exists rejection_reason text;

-- Contact channel preferences. Captured now so SMS notifications can land
-- without a future migration. Surface in the wizard later.
alter table brand_kits
  add column if not exists contact_phone text,
  add column if not exists preferred_channel text not null default 'email'
    check (preferred_channel in ('email', 'sms'));

-- Fast lookup for the admin's "Pending review" panel.
create index if not exists brand_kits_pending_review_idx
  on brand_kits (created_at desc)
  where review_status = 'pending';
