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
      <div
        className="sticky top-[57px] z-30 -mx-4 border-b backdrop-blur sm:-mx-6"
        style={{
          borderColor: "#1a1a2e",
          backgroundColor: "rgba(7,7,14,0.92)",
        }}
      >
        <div className="px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground"
              title="All brand kits"
            >
              ←
            </Link>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {kit.name as string}
            </h1>
            <span className="hidden text-[11px] uppercase tracking-wider text-muted-foreground sm:inline">
              {kit.slug as string}
            </span>
          </div>
          <KitNav slug={slug} />
        </div>
      </div>
      {children}
    </div>
  );
}
