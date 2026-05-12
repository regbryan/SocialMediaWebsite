import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "../../lib/supabase-admin";
import { resolveDashboardUser } from "../../lib/dashboard-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PendingActions from "./PendingActions";
import SendDigestButton from "./SendDigestButton";

type Row = {
  slug: string;
  name: string;
  primary_platform: string;
  ig_handle: string | null;
  ig_follower_count: number | null;
  competitor_handles: string[] | null;
  onboarding_status: string;
  review_status: string | null;
  tier: string | null;
  updated_at: string;
};

type PendingRow = {
  slug: string;
  name: string;
  primary_platform: string;
  ig_handle: string | null;
  hq_location: string | null;
  tier: string | null;
  updated_at: string;
};

const TIER_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  agency: "Agency",
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
      {TIER_LABEL[tier] ?? tier}
    </Badge>
  );
}

export const dynamic = "force-dynamic";

export default async function BrandKitsList() {
  const user = await resolveDashboardUser();

  // Clients land here from a magic link. They only have access to their own
  // kit — bounce them straight into it. If they have multiple (unusual),
  // we still send them to the most recent.
  if (user.kind === "client") {
    if (user.slugs.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No brand kit yet</CardTitle>
            <CardDescription>
              Your account has no brand kit attached. Reach out to your account
              manager.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    redirect(`/dashboard/${user.slugs[0]}`);
  }

  if (user.kind !== "admin") notFound();

  const sb = supabaseAdmin();

  const [{ data, error }, { data: pendingData, error: pendingErr }] = await Promise.all([
    sb
      .from("brand_kits")
      .select(
        "slug, name, primary_platform, ig_handle, ig_follower_count, competitor_handles, onboarding_status, review_status, tier, updated_at"
      )
      .order("updated_at", { ascending: false }),
    sb
      .from("brand_kits")
      .select(
        "slug, name, primary_platform, ig_handle, hq_location, tier, updated_at"
      )
      .eq("review_status", "pending")
      .order("updated_at", { ascending: false }),
  ]);

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Failed to load brand kits</CardTitle>
          <CardDescription className="text-destructive/80">{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rows = (data ?? []) as Row[];
  const pending = (pendingData ?? []) as PendingRow[];
  const totalFollowers = rows.reduce((acc, r) => acc + (r.ig_follower_count ?? 0), 0);
  const complete = rows.filter((r) => r.onboarding_status === "complete").length;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Brand kits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "kit" : "kits"} on file.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SendDigestButton />
          <Link href="/onboarding/basics" className={buttonVariants()}>
            + New kit
          </Link>
        </div>
      </div>

      {pendingErr && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="py-3 text-sm text-destructive">
            Pending review query failed: {pendingErr.message}
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <Card className="overflow-hidden border-[rgba(139,92,255,0.35)]">
          <CardHeader className="pb-3">
            <div className="flex items-baseline justify-between gap-4">
              <CardTitle className="text-base">
                Pending review · {pending.length}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                Self-serve submissions awaiting approval
              </span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell>
                    <Link
                      href={`/dashboard/${p.slug}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={p.tier} />
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {p.primary_platform}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.ig_handle ? `@${p.ig_handle}` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.hq_location ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <PendingActions slug={p.slug} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total kits" value={rows.length.toLocaleString()} />
        <Stat label="Onboarded" value={`${complete} of ${rows.length || 0}`} />
        <Stat label="Followers tracked" value={totalFollowers.toLocaleString()} />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">No kits yet. Start the first one.</p>
            <Link href="/onboarding/basics" className={buttonVariants()}>
              Start onboarding
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead className="text-right">Followers</TableHead>
                <TableHead className="text-right">Competitors</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.slug} className="group">
                  <TableCell>
                    <Link
                      href={`/dashboard/${r.slug}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={r.tier} />
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {r.primary_platform}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.ig_handle ? `@${r.ig_handle}` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.ig_follower_count != null
                      ? r.ig_follower_count.toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.competitor_handles?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.onboarding_status === "complete" ? "default" : "secondary"
                      }
                    >
                      {r.onboarding_status === "complete" ? "Complete" : "In progress"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
