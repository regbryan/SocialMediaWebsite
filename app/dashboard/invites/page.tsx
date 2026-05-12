import { supabaseAdmin } from "../../../lib/supabase-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InviteForm from "./InviteForm";
import RevokeButton from "./RevokeButton";

type InviteRow = {
  id: string;
  slug: string;
  name: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  used_brand_kit_id: string | null;
  revoked_at: string | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

function statusOf(r: InviteRow): { label: string; tone: "default" | "secondary" | "outline" | "destructive" } {
  if (r.revoked_at) return { label: "Revoked", tone: "destructive" };
  if (r.used_at) return { label: "Used", tone: "default" };
  if (new Date(r.expires_at).getTime() < Date.now())
    return { label: "Expired", tone: "outline" };
  return { label: "Active", tone: "secondary" };
}

export default async function InvitesPage() {
  const { data, error } = await supabaseAdmin()
    .from("brand_kit_invites")
    .select(
      "id, slug, name, email, expires_at, used_at, used_brand_kit_id, revoked_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">
            Failed to load invites
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rows = (data ?? []) as InviteRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Invites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time links for clients to start onboarding. They expire when used.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New invite</CardTitle>
          <CardDescription>
            The client&apos;s email becomes their dashboard login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No invites sent yet.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const s = statusOf(r);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.email}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.tone}>{s.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {s.label === "Active" ? (
                        <RevokeButton id={r.id} />
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
