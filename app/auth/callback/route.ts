import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-server";

/**
 * Magic-link landing endpoint.
 *
 * Supabase generateLink({ type: 'magiclink' }) issues a URL of the shape
 * `${SUPABASE_URL}/auth/v1/verify?token=...&type=magiclink&redirect_to=
 *   ${DASHBOARD_URL}/auth/callback?next=...`
 *
 * Supabase exchanges the token and redirects here with either:
 *   - `?code=<pkce_code>`                — newer PKCE flow
 *   - `#access_token=...&refresh_token=...` — implicit / hash flow
 *
 * The PKCE branch we handle here. The hash branch requires a client-side
 * page to read the fragment; we render one if no `code` is present.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (code) {
    let sb;
    try {
      sb = await supabaseServer();
    } catch (err) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            err instanceof Error ? err.message : "Auth not configured"
          )}`,
          req.url
        )
      );
    }
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          req.url
        )
      );
    }
    return NextResponse.redirect(new URL(next, req.url));
  }

  // Hash flow — render a tiny client page that reads the fragment and posts
  // it back so we can set cookies. Lives at /auth/callback/finish.
  return NextResponse.redirect(
    new URL(`/auth/callback/finish?next=${encodeURIComponent(next)}`, req.url)
  );
}
