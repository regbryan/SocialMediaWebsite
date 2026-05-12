import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import {
  canViewKit,
  resolveDashboardUser,
} from "../../../lib/dashboard-auth";
import KitNav from "./KitNav";

/**
 * Per-kit layout: a sticky header with the kit name and sub-nav so every
 * page inside `/dashboard/<slug>/...` shares the same navigation chrome.
 *
 * Auth check happens here so child pages don't each re-verify access.
 * Child pages still fetch their own slice of kit data; this layout only
 * needs the name + slug for the header.
 */
export default async function KitLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await resolveDashboardUser();
  if (!canViewKit(user, slug)) notFound();

  const sb = supabaseAdmin();
  const { data: kit } = await sb
    .from("brand_kits")
    .select("name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!kit) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← All brand kits
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {kit.name as string}
          </h1>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {kit.slug as string}
          </span>
        </div>
        <div
          className="border-b pb-1"
          style={{ borderColor: "#1a1a2e" }}
        >
          <KitNav slug={slug} />
        </div>
      </div>
      {children}
    </div>
  );
}
