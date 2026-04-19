import type { NextRequest } from "next/server";
import { scrapeSite } from "../../../../lib/scrape-site";

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const scrape = await scrapeSite(url);
    return Response.json({ ok: true, scrape });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    console.error("[onboarding/scrape] failed", { url, message });
    return Response.json({ error: message }, { status: 502 });
  }
}
