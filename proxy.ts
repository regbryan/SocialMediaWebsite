import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "./lib/admin-auth";
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  verifyInvite,
} from "./lib/invite-token";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // /onboarding/*  — accept ?invite=<token>, persist as cookie, strip from URL.
  if (pathname.startsWith("/onboarding")) {
    const tokenParam = searchParams.get("invite");
    if (tokenParam) {
      const payload = await verifyInvite(tokenParam).catch(() => null);
      const url = request.nextUrl.clone();
      url.searchParams.delete("invite");
      // Always land on /onboarding/basics on a fresh invite click.
      url.pathname = "/onboarding/basics";
      const res = NextResponse.redirect(url);
      if (payload) {
        res.cookies.set(INVITE_COOKIE, tokenParam, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: INVITE_COOKIE_MAX_AGE,
        });
      }
      return res;
    }
    return NextResponse.next();
  }

  // /dashboard/*  — admin password gate (existing behavior).
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verifySession(token).catch(() => false);
  if (ok) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
