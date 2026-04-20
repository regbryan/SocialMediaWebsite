import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  signSession,
  verifyPassword,
} from "../../../../lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    password?: string;
  } | null;

  if (!body?.password || !verifyPassword(body.password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await signSession();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return Response.json({ ok: true });
}
