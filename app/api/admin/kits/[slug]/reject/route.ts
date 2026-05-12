import type { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../../../lib/require-admin";

/**
 * Admin action: reject a self-serve brand kit submission.
 * Stamps review_status='rejected' with optional reason. Does NOT
 * provision client access or touch auth.
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    reason?: string;
  } | null;
  const reason = body?.reason?.trim() || null;

  const sb = supabaseAdmin();
  const { data: kit, error: kitErr } = await sb
    .from("brand_kits")
    .select("id, review_status")
    .eq("slug", slug)
    .maybeSingle();
  if (kitErr || !kit) {
    return Response.json({ error: "Brand kit not found" }, { status: 404 });
  }

  const { error: updateErr } = await sb
    .from("brand_kits")
    .update({
      review_status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", kit.id);
  if (updateErr) {
    return Response.json(
      { error: "Failed to reject", detail: updateErr.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, slug });
}
