import "server-only";

export type Tier = "starter" | "growth" | "agency" | null;

/**
 * Per-tier batch cap for content generation.
 *
 *   Starter — 5 posts/week, 1 platform   → 20 drafts/batch (≈ 4 weeks)
 *   Growth  — 7 posts/week, 3 platforms  → 28 drafts/batch (≈ 4 weeks)
 *   Agency  — Custom / unlimited         → 60 drafts/batch (hard cap)
 *   null    — Unassigned (admin-issued)  → 60 drafts/batch (same as Agency)
 *
 * Numbers tied to what the public Pricing page advertises. Update both
 * when pricing changes.
 */
export function maxBatchDays(tier: Tier): number {
  switch (tier) {
    case "starter":
      return 20;
    case "growth":
      return 28;
    case "agency":
      return 60;
    default:
      return 60;
  }
}

/**
 * Short human-readable phrase for "your plan allows N drafts per batch".
 * Used inline in UI hints.
 */
export function batchAllowanceLabel(tier: Tier): string {
  const max = maxBatchDays(tier);
  if (tier === "starter") return `Starter plan · up to ${max} drafts per batch`;
  if (tier === "growth") return `Growth plan · up to ${max} drafts per batch`;
  if (tier === "agency") return `Agency plan · up to ${max} drafts per batch`;
  return `Up to ${max} drafts per batch`;
}
