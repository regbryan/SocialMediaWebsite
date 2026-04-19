import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase-admin";

type Row = {
  slug: string;
  name: string;
  primary_platform: string;
  ig_handle: string | null;
  ig_follower_count: number | null;
  competitor_handles: string[] | null;
  onboarding_status: string;
  updated_at: string;
};

export const dynamic = "force-dynamic";

export default async function BrandKitsList() {
  const { data, error } = await supabaseAdmin()
    .from("brand_kits")
    .select(
      "slug, name, primary_platform, ig_handle, ig_follower_count, competitor_handles, onboarding_status, updated_at"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Failed to load brand kits: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Brand kits</h1>
        <p className="text-sm text-neutral-600">
          {rows.length} kit{rows.length === 1 ? "" : "s"}. Click a row to see
          comparison.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center ring-1 ring-neutral-200">
          <p className="text-neutral-600">No brand kits yet.</p>
          <Link
            href="/onboarding/basics"
            className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Start onboarding
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Handle</th>
                <th className="px-4 py-3 text-right">Followers</th>
                <th className="px-4 py-3 text-right">Competitors</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {rows.map((r) => (
                <tr key={r.slug} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/${r.slug}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-600">
                    {r.primary_platform}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {r.ig_handle ? `@${r.ig_handle}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {r.ig_follower_count != null
                      ? r.ig_follower_count.toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {r.competitor_handles?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs ring-1 " +
                        (r.onboarding_status === "complete"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200")
                      }
                    >
                      {r.onboarding_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
