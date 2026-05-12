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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PreviewUploader from "./PreviewUploader";
import PreviewCard from "./PreviewCard";
import ApproveKitButton from "./ApproveKitButton";
import GeneratePreviewsButton from "./GeneratePreviewsButton";

type Kit = {
  id: string;
  slug: string;
  name: string;
  review_status: string | null;
  previews_generated_at: string | null;
  kit_approved_at: string | null;
};

type Preview = {
  id: string;
  url: string;
  slot_label: string | null;
  status: string | null;
  feedback: string | null;
  reviewed_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function PreviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await resolveDashboardUser();
  if (!canViewKit(user, slug)) notFound();
  const sb = supabaseAdmin();

  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select(
      "id, slug, name, review_status, previews_generated_at, kit_approved_at"
    )
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) notFound();
  const k = kit as Kit;

  const { data: previewRows } = await sb
    .from("brand_kit_assets")
    .select("id, url, slot_label, status, feedback, reviewed_at")
    .eq("brand_kit_id", k.id)
    .eq("kind", "preview")
    .order("slot_label", { ascending: true });
  const previews = (previewRows ?? []) as Preview[];

  const approvedCount = previews.filter((p) => p.status === "approved").length;
  const changesCount = previews.filter(
    (p) => p.status === "changes_requested"
  ).length;
  const pendingCount = previews.filter(
    (p) => !p.status || p.status === "pending"
  ).length;

  const allApproved = previews.length > 0 && approvedCount === previews.length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Previews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {previews.length === 0
              ? "No previews uploaded yet. Add the first round below."
              : `${approvedCount} approved · ${changesCount} need changes · ${pendingCount} pending`}
          </p>
        </div>
        {k.kit_approved_at && (
          <Badge variant="default">Brand kit approved</Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate previews</CardTitle>
          <CardDescription>
            Auto-generate 4 design variations from this brand kit, or paste your own URLs below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GeneratePreviewsButton
            slug={k.slug}
            hasExisting={previews.length > 0}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Or upload preview URLs</CardTitle>
          <CardDescription>
            Paste 3–6 image URLs. Replaces the current preview set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewUploader slug={k.slug} />
        </CardContent>
      </Card>

      {previews.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {previews.map((p) => (
              <PreviewCard key={p.id} preview={p} />
            ))}
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Approve the brand kit
                </p>
                <p className="text-xs text-muted-foreground">
                  Locks the design direction so the team can start producing
                  monthly content.
                </p>
              </div>
              <ApproveKitButton
                slug={k.slug}
                allApproved={allApproved}
                kitApproved={Boolean(k.kit_approved_at)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

