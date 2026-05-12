import "server-only";

/**
 * Source data we pull off `brand_kits` to feed the image prompt.
 * Any field may be null — we degrade gracefully.
 */
export type BrandPromptInput = {
  name: string;
  tagline: string | null;
  positioning: string | null;
  description: string | null;
  primary_platform: string | null;
  hq_location: string | null;
  colors: Record<string, string> | null;
  tone: {
    keywords?: string[];
    dos?: string[];
    donts?: string[];
  } | null;
  photography_direction: string | null;
  content_pillars: Array<{ name?: string; description?: string }> | null;
  hashtags?: {
    always_on?: string[];
    local?: string[];
    service?: string[];
    community?: string[];
  } | null;
};

type Style = { label: string; descriptor: string };

/**
 * Four visual directions the generator iterates across so the client sees
 * meaningfully different proposals instead of four near-duplicates.
 */
const STYLES: Style[] = [
  {
    label: "Style A — Editorial type",
    descriptor:
      "Bold editorial typography as the hero element. Solid brand-primary color background, large white sans-serif headline, single small supporting line. No imagery, type-only.",
  },
  {
    label: "Style B — Photo with overlay panel",
    descriptor:
      "Lifestyle photograph relevant to the brand category, with a clean rectangular caption panel in the lower-third. Panel uses the brand primary color with white text. The photo should feel candid, not stock.",
  },
  {
    label: "Style C — Minimal color block",
    descriptor:
      "Minimalist composition with a single large brand-color block taking 60% of the canvas, headline text in the negative space. Geometric and confident. No photo.",
  },
  {
    label: "Style D — Photo-led with bottom bar",
    descriptor:
      "Full-bleed photograph with a thin horizontal bottom bar containing the brand wordmark or short caption in brand-color text on a white strip. Photo dominates 85% of the frame.",
  },
];

function clean(s: string | null | undefined, max = 240): string {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim().slice(0, max);
}

function colorList(colors: Record<string, string> | null | undefined): string {
  if (!colors) return "";
  const parts: string[] = [];
  if (colors.primary) parts.push(`primary ${colors.primary}`);
  if (colors.secondary) parts.push(`secondary ${colors.secondary}`);
  if (colors.accent) parts.push(`accent ${colors.accent}`);
  return parts.join(", ");
}

function toneSummary(
  tone: BrandPromptInput["tone"] | null | undefined
): string {
  if (!tone) return "";
  const kw = (tone.keywords ?? []).slice(0, 5).join(", ");
  return kw;
}

function pillar(
  pillars: BrandPromptInput["content_pillars"] | null | undefined,
  i: number
): string {
  const list = pillars ?? [];
  if (!list.length) return "";
  const p = list[i % list.length];
  if (!p?.name) return "";
  return p.description ? `${p.name} — ${p.description}` : p.name;
}

/**
 * Build a complete prompt for one of the four canonical preview styles.
 * `index` is 0..3.
 */
export function buildPreviewPrompt(
  brand: BrandPromptInput,
  index: number
): { label: string; prompt: string } {
  const style = STYLES[index % STYLES.length];

  const lines: string[] = [];
  lines.push(
    `Generate one social media post design at 4:5 aspect ratio (vertical, Instagram feed format).`
  );
  lines.push("");
  lines.push(`BRAND: ${clean(brand.name)}`);
  if (brand.tagline) lines.push(`Tagline: ${clean(brand.tagline)}`);
  if (brand.positioning) lines.push(`Positioning: ${clean(brand.positioning, 320)}`);
  if (brand.description && !brand.positioning) {
    lines.push(`Description: ${clean(brand.description, 320)}`);
  }
  if (brand.hq_location) lines.push(`Located in: ${clean(brand.hq_location, 80)}`);

  const colors = colorList(brand.colors);
  if (colors) lines.push(`Brand colors: ${colors}`);

  const tone = toneSummary(brand.tone);
  if (tone) lines.push(`Brand voice: ${tone}`);

  if (brand.photography_direction) {
    lines.push(`Visual direction: ${clean(brand.photography_direction, 280)}`);
  }

  const topicPillar = pillar(brand.content_pillars, index);
  if (topicPillar) {
    lines.push(`Topic for this post: ${clean(topicPillar, 200)}`);
  }

  lines.push("");
  lines.push(`STYLE: ${style.descriptor}`);
  lines.push("");
  lines.push(
    `REQUIREMENTS: 4:5 portrait composition. Real, production-quality design — not a mockup or sketch. No watermarks. No text errors. No fake brand logos other than this brand's wordmark if used. Caption text should be on-brand and specific; avoid generic phrases like "transform your business" or "your success starts here".`
  );

  return { label: style.label, prompt: lines.join("\n") };
}

/**
 * Build all four canonical preview prompts in order.
 */
export function buildPreviewPromptSet(
  brand: BrandPromptInput
): Array<{ label: string; prompt: string }> {
  return STYLES.map((_, i) => buildPreviewPrompt(brand, i));
}
