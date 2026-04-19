import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase-admin";
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
      <Card className="border-destructive/40 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Failed to load brand kits</CardTitle>
          <CardDescription className="text-destructive/80">{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rows = (data ?? []) as Row[];
  const totalFollowers = rows.reduce((acc, r) => acc + (r.ig_follower_count ?? 0), 0);
  const complete = rows.filter((r) => r.onboarding_status === "complete").length;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Brand kits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} kit{rows.length === 1 ? "" : "s"} across all accounts. Click a row to open comparison.
          </p>
        </div>
        <Link href="/onboarding/basics" className={buttonVariants()}>
          + New kit
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total kits" value={rows.length.toLocaleString()} />
        <Stat label="Completed" value={`${complete} / ${rows.length || 0}`} />
        <Stat label="Combined reach" value={totalFollowers.toLocaleString()} />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">No brand kits yet.</p>
            <Link href="/onboarding/basics" className={buttonVariants()}>
              Start onboarding
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
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
                      {r.onboarding_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
