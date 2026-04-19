import "server-only";

export type SiteScrape = {
  url: string;
  finalUrl: string;
  title: string | null;
  tagline: string | null;
  description: string | null;
  colors: { primary?: string; secondary?: string; accent?: string };
  logos: { primary_url?: string; favicon_url?: string; mark_url?: string };
  fonts: { heading?: string; body?: string };
  confidence: {
    tagline: "meta" | "heuristic" | "brandfetch" | "firecrawl" | "none";
    description: "meta" | "brandfetch" | "firecrawl" | "none";
    colors: "meta" | "brandfetch" | "none";
    logos: "meta" | "guessed" | "brandfetch" | "none";
    fonts: "brandfetch" | "none";
  };
  sources: string[];
};

const UA =
  "Mozilla/5.0 (compatible; SocialPulseOnboardingBot/1.0; +https://socialpulse.app/bot)";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickMeta(html: string, selectors: RegExp[]): string | null {
  for (const re of selectors) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1].trim());
  }
  return null;
}

function absoluteUrl(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function normalizeInput(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function scrapeSite(rawUrl: string): Promise<SiteScrape> {
  const url = normalizeInput(rawUrl);

  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  const finalUrl = res.url || url;
  const html = await res.text();

  const title = pickMeta(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  const description = pickMeta(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
  ]);

  const tagline = (() => {
    if (!title) return null;
    const parts = title.split(/\s+[|–—-]\s+/);
    if (parts.length > 1) return parts[parts.length - 1].trim();
    return null;
  })();

  const themeColor = pickMeta(html, [
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']msapplication-TileColor["'][^>]+content=["']([^"']+)["']/i,
  ]);

  const ogImage = pickMeta(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ]);

  const iconHref = (() => {
    const candidates = [
      /<link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["']/i,
    ];
    for (const re of candidates) {
      const m = html.match(re);
      if (m?.[1]) return m[1];
    }
    return null;
  })();

  const logos: SiteScrape["logos"] = {};
  if (ogImage) logos.primary_url = absoluteUrl(finalUrl, ogImage);
  if (iconHref) logos.favicon_url = absoluteUrl(finalUrl, iconHref);
  if (!logos.favicon_url) {
    const origin = new URL(finalUrl).origin;
    logos.favicon_url = `${origin}/favicon.ico`;
  }

  const colors: SiteScrape["colors"] = {};
  if (themeColor && /^#?[0-9a-f]{3,8}$/i.test(themeColor.replace("#", ""))) {
    colors.primary = themeColor.startsWith("#") ? themeColor : `#${themeColor}`;
  }

  const base: SiteScrape = {
    url,
    finalUrl,
    title,
    tagline,
    description,
    colors,
    logos,
    fonts: {},
    confidence: {
      tagline: tagline ? "heuristic" : "none",
      description: description ? "meta" : "none",
      colors: colors.primary ? "meta" : "none",
      logos: logos.primary_url ? "meta" : iconHref ? "meta" : "guessed",
      fonts: "none",
    },
    sources: ["html-meta"],
  };

  const domain = safeDomain(finalUrl);
  if (domain) {
    await enrichFromBrandfetch(base, domain);
    await enrichFromFirecrawl(base, finalUrl);
  }

  return base;
}

function safeDomain(u: string): string | null {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// Brandfetch Brand API: https://docs.brandfetch.com/reference/brand-api
// Auth: Bearer token in BRANDFETCH_API_KEY.
async function enrichFromBrandfetch(
  out: SiteScrape,
  domain: string
): Promise<void> {
  const key = process.env.BRANDFETCH_API_KEY;
  if (!key) return;
  try {
    const res = await fetch(
      `https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`,
      {
        headers: { authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8_000),
      }
    );
    if (!res.ok) return;
    const bf = (await res.json()) as {
      description?: string;
      longDescription?: string;
      colors?: { hex: string; type: string }[];
      logos?: {
        type: string;
        formats: { src: string; format: string }[];
      }[];
      fonts?: { name: string; type: string }[];
    };

    if (bf.longDescription && !out.description) {
      out.description = bf.longDescription;
      out.confidence.description = "brandfetch";
    } else if (bf.description && !out.description) {
      out.description = bf.description;
      out.confidence.description = "brandfetch";
    }

    const colorByType = (t: string) =>
      bf.colors?.find((c) => c.type === t)?.hex;
    const primary = colorByType("accent") || colorByType("brand");
    const dark = colorByType("dark");
    const light = colorByType("light");
    if (primary && !out.colors.primary) {
      out.colors.primary = primary;
      out.confidence.colors = "brandfetch";
    }
    if (dark && !out.colors.secondary) out.colors.secondary = dark;
    if (light && !out.colors.accent) out.colors.accent = light;

    const pickLogo = (type: string, fmt: string) =>
      bf.logos
        ?.find((l) => l.type === type)
        ?.formats.find((f) => f.format === fmt)?.src ??
      bf.logos?.find((l) => l.type === type)?.formats[0]?.src;

    const logoUrl = pickLogo("logo", "svg") || pickLogo("logo", "png");
    const markUrl = pickLogo("symbol", "svg") || pickLogo("icon", "svg");
    if (logoUrl && !out.logos.primary_url) {
      out.logos.primary_url = logoUrl;
      out.confidence.logos = "brandfetch";
    }
    if (markUrl && !out.logos.mark_url) out.logos.mark_url = markUrl;

    const heading = bf.fonts?.find((f) => f.type === "title")?.name;
    const body = bf.fonts?.find((f) => f.type === "body")?.name;
    if (heading) {
      out.fonts.heading = heading;
      out.confidence.fonts = "brandfetch";
    }
    if (body) out.fonts.body = body;

    out.sources.push("brandfetch");
  } catch (err) {
    console.warn("[scrape] brandfetch failed", err);
  }
}

// Firecrawl Scrape API: https://docs.firecrawl.dev/api-reference/endpoint/scrape
// Auth: Bearer token in FIRECRAWL_API_KEY. Use only when description is thin.
async function enrichFromFirecrawl(
  out: SiteScrape,
  url: string
): Promise<void> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return;
  if (out.description && out.description.length > 120) return;

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return;
    const fc = (await res.json()) as {
      success?: boolean;
      data?: { markdown?: string; metadata?: { description?: string } };
    };
    if (!fc.success || !fc.data) return;

    const md = fc.data.markdown ?? "";
    const firstPara = md
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .find((p) => p.length > 60 && !p.startsWith("#") && !p.startsWith("!"));

    const candidate = firstPara || fc.data.metadata?.description;
    if (candidate && (!out.description || out.description.length < 60)) {
      out.description = candidate.slice(0, 600);
      out.confidence.description = "firecrawl";
    }

    out.sources.push("firecrawl");
  } catch (err) {
    console.warn("[scrape] firecrawl failed", err);
  }
}
