import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import {
  canViewKit,
  resolveDashboardUser,
} from "../../../../lib/dashboard-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AssetUploader from "./AssetUploader";
import AssetCard from "./AssetCard";

type Kit = { id: string; slug: string; name: string };

type Asset = {
  id: string;
  kind: string;
  url: string;
  meta: { label?: string; original_name?: string; size_bytes?: number } | null;
};

const KIND_GROUPS: Array<{ kind: string; label: string; description: string }> = [
  {
    kind: "logo",
    label: "Logos",
    description: "Primary, white-on-dark, mark-only — anything the AI may place into a post.",
  },
  {
    kind: "hero_image",
    label: "Hero imagery",
    description: "Brand-defining photos used as reference for the look and feel of generated content.",
  },
  {
    kind: "cutout",
    label: "Cutouts",
    description: "Transparent PNGs of people, products, or objects the AI can composite over backgrounds.",
  },
  {
    kind: "photo_library",
    label: "Photo library",
    description: "General reference photography (golden-hour, real customers, location shots).",
  },
  {
    kind: "other",
    label: "Other",
    description: "Anything else — color swatches, mood boards, screenshots of inspiration.",
  },
];

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await resolveDashboardUser();
  if (!canViewKit(user, slug)) notFound();
  const isAdmin = user.kind === "admin";

  const sb = supabaseAdmin();
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) notFound();
  const k = kit as Kit;

  const { data: assetRows } = await sb
    .from("brand_kit_assets")
    .select("id, kind, url, meta")
    .eq("brand_kit_id", k.id)
    .neq("kind", "preview")
    .neq("kind", "ig_post")
    .order("created_at", { ascending: false });
  const assets = (assetRows ?? []) as Asset[];

  const byKind: Record<string, Asset[]> = {};
  for (const a of assets) {
    (byKind[a.kind] ??= []).push(a);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Assets</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {assets.length === 0
            ? "No brand assets yet."
            : `${assets.length} files on file.`}
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload</CardTitle>
            <CardDescription>
              PNG, JPEG, WEBP, SVG, GIF up to 12 MB. The AI references these
              files when generating previews and content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssetUploader slug={k.slug} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {KIND_GROUPS.map((group) => {
          const items = byKind[group.kind] ?? [];
          return (
            <section key={group.kind} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">
                    {group.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {items.length} {items.length === 1 ? "file" : "files"}
                </span>
              </div>
              {items.length === 0 ? (
                <div
                  className="rounded-md border border-dashed px-4 py-6 text-center text-xs text-muted-foreground"
                  style={{ borderColor: "#1a1a2e" }}
                >
                  No {group.label.toLowerCase()} yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {items.map((a) => (
                    <AssetCard key={a.id} asset={a} canDelete={isAdmin} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
