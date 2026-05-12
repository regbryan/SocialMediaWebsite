import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
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

  // /dashboard/*  — accept EITHER admin password cookie OR Supabase client session.
  // Admin (the 2 internal users) takes the existing password path.
  // Clients arrive via magic link, which sets Supabase session cookies on /auth/callback.
  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const adminOk = adminToken
    ? await verifySession(adminToken).catch(() => false)
    : false;
  if (adminOk) return NextResponse.next();

  // Try a Supabase session. Use a passthrough response so any refreshed
  // session cookies are forwarded to the browser.
  const supabaseRes = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseRes.cookies.set(name, value, options);
          });
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return supabaseRes;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
