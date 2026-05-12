import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Per-request Supabase client tied to the user's session cookies.
 * Use this for any operation that should run AS the logged-in client
 * (RLS-aware reads, magic-link exchanges, etc.).
 *
 * For admin / service-role operations that must bypass RLS, keep using
 * supabaseAdmin() from lib/supabase-admin.ts.
 */
export async function supabaseServer(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase env missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for client auth"
    );
  }

  const jar = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            jar.set(name, value, options)
          );
        } catch {
          // setAll throws when called from a server component — that's fine,
          // middleware refreshes cookies for us.
        }
      },
    },
  });
}
