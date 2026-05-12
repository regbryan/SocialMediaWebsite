"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Fragment-flow finish page. Supabase sometimes returns
 *   #access_token=…&refresh_token=…
 * which only the browser can read. We set the session client-side, which
 * propagates to cookies via @supabase/ssr's storage adapter, then redirect
 * to the original `next` target.
 */
export default function CallbackFinishPage() {
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anon) {
        setStatus("Auth not configured.");
        return;
      }

      const sp = new URLSearchParams(window.location.search);
      const next = sp.get("next") || "/dashboard";

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      const errorDescription = hash.get("error_description") || sp.get("error");

      if (errorDescription) {
        setStatus(errorDescription);
        return;
      }
      if (!access_token || !refresh_token) {
        setStatus("Missing auth tokens.");
        return;
      }

      const supabase = createBrowserClient(url, anon);
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) {
        setStatus(error.message);
        return;
      }

      // Replace history so the tokens never appear in the back-stack.
      window.location.replace(next);
    };
    run();
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">{status}</p>
      </main>
    </div>
  );
}
