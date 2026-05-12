import "server-only";
import type { IgPost } from "./scrape-ig";

/**
 * Engagement rate = avg(likes + comments) per post / follower count.
 *
 * Returned as a fraction (0.043 = 4.3%). Null when we can't compute —
 * missing follower count, zero posts, or all post stats null.
 *
 * Industry benchmark: 1–3% is healthy on IG, 5%+ is exceptional.
 */
export function engagementRate(
  posts: IgPost[] | null | undefined,
  followerCount: number | null | undefined
): number | null {
  if (!posts || !posts.length) return null;
  if (!followerCount || followerCount <= 0) return null;

  const totals = posts.reduce<{ sum: number; count: number }>(
    (acc, p) => {
      const likes = p.like_count ?? null;
      const comments = p.comment_count ?? null;
      if (likes === null && comments === null) return acc;
      acc.sum += (likes ?? 0) + (comments ?? 0);
      acc.count += 1;
      return acc;
    },
    { sum: 0, count: 0 }
  );
  if (totals.count === 0) return null;

  const avgInteractions = totals.sum / totals.count;
  return avgInteractions / followerCount;
}

export function formatEngagementRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Color-grade an engagement rate so the dashboard can highlight strong
 * competitors at a glance. Thresholds match IG community averages.
 */
export function engagementTone(
  rate: number | null
): "strong" | "healthy" | "weak" | "unknown" {
  if (rate === null) return "unknown";
  if (rate >= 0.05) return "strong";
  if (rate >= 0.01) return "healthy";
  return "weak";
}

export function relativeTimeFrom(iso: string | null | undefined): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "never";
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}
