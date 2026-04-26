import { cookies } from "next/headers";
import { INVITE_COOKIE, verifyInvite } from "../../../../lib/invite-token";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(INVITE_COOKIE)?.value;
  const payload = await verifyInvite(token);
  if (!payload) {
    return Response.json({ ok: false }, { status: 401 });
  }
  return Response.json({
    ok: true,
    slug: payload.slug,
    name: payload.name,
    email: payload.email,
    exp: payload.exp,
  });
}
