import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import {
  canViewKit,
  resolveDashboardUser,
} from "../../../../lib/dashboard-auth";
import { batchAllowanceLabel, maxBatchDays, type Tier } from "../../../../lib/tier-limits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GenerateBatchButton from "./GenerateBatchButton";
import ContentDraftCard from "./ContentDraftCard";

type Kit = {
  id: string;
  slug: string;
  name: string;
  tier: Tier;
  kit_approved_at: string | null;
  last_batch_generated_at: string | null;
};

type Draft = {
  id: string;
  slot_date: string;
  platform: string;
  pillar: string | null;
  caption: string | null;
  image_url: string | null;
  variant_image_url: string | null;
  variant_caption: string | null;
  status: string;
  feedback: string | null;
  reviewed_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function ContentPage({
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
    .select("id, slug, name, tier, kit_approved_at, last_batch_generated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) notFound();
  const k = kit as Kit;

  const { data: draftRows } = await sb
    .from("content_drafts")
    .select(
      "id, slot_date, platform, pillar, caption, image_url, variant_image_url, variant_caption, status, feedback, reviewed_at"
    )
    .eq("brand_kit_id", k.id)
    .order("slot_date", { ascending: true });
  const drafts = (draftRows ?? []) as Draft[];

  const approvedCount = drafts.filter((d) => d.status === "approved").length;
  const changesCount = drafts.filter((d) => d.status === "changes_requested").length;
  const pendingCount = drafts.length - approvedCount - changesCount;

  const kitApproved = Boolean(k.kit_approved_at);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Content</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {drafts.length === 0
              ? kitApproved
                ? "No drafts yet. Generate the first 30-day batch below."
                : "Approve the brand kit before generating content."
              : `${drafts.length} drafts · ${approvedCount} approved · ${changesCount} need changes · ${pendingCount} pending`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {k.last_batch_generated_at && (
            <span className="text-xs text-muted-foreground">
              Last batch:{" "}
              {new Date(k.last_batch_generated_at).toLocaleDateString()}
            </span>
          )}
          <GenerateBatchButton
            slug={k.slug}
            disabled={!kitApproved}
            hasExisting={drafts.length > 0}
            tierMax={maxBatchDays(k.tier)}
            tierLabel={batchAllowanceLabel(k.tier)}
          />
        </div>
      </div>

      {!kitApproved && (
        <Card className="border-[rgba(139,92,255,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Brand kit not approved</CardTitle>
            <CardDescription>
              Send the client to the previews page to sign off. Content
              generation is gated on kit approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={`/dashboard/${k.slug}/previews`}
              className="text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: "#b18bff" }}
            >
              Open preview review →
            </Link>
          </CardContent>
        </Card>
      )}

      {drafts.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{pendingCount} pending</Badge>
            <Badge variant="default">{approvedCount} approved</Badge>
            {changesCount > 0 && (
              <Badge variant="destructive">{changesCount} need changes</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drafts.map((d) => (
              <ContentDraftCard key={d.id} draft={d} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
