import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../lib/require-admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const { error } = await supabaseAdmin()
    .from("brand_kit_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("used_at", null);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
