import "server-only";
import type { BrandPromptInput } from "./preview-prompts";

export type DraftPromptInput = {
  slot_date: string; // YYYY-MM-DD
  platform: string; // 'instagram' | 'linkedin' | ...
  pillar: string | null;
  previousFeedback?: string | null;
  previousCaption?: string | null;
};

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

/**
 * Pull the curated hashtag set for this brand into a flat ordered list,
 * platform-capped. Always_on tags come first (they should appear on every
 * post), then local/service/community in that priority order. The
 * generator is instructed to use this list verbatim — no invention.
 */
function curatedHashtags(
  hashtags: BrandPromptInput["hashtags"],
  platform: string
): string[] {
  if (!hashtags) return [];
  const cap =
    platform === "linkedin"
      ? 0
      : platform === "tiktok" || platform === "facebook"
        ? 3
        : 8;
  if (cap === 0) return [];

  const buckets = [
    hashtags.always_on ?? [],
    hashtags.local ?? [],
    hashtags.service ?? [],
    hashtags.community ?? [],
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const bucket of buckets) {
    for (const raw of bucket) {
      const tag = raw.replace(/^#/, "").trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tag);
      if (out.length >= cap) return out;
    }
  }
  return out;
}

function platformBlock(platform: string): {
  aspect: string;
  captionRules: string;
} {
  switch (platform) {
    case "linkedin":
      return {
        aspect:
          "1:1 square composition (LinkedIn feed format). Professional, no hashtags in the image.",
        captionRules:
          "Caption: 180–260 words. Hook in the first line. Conversational paragraphs. No hashtags. End with a soft question or insight, not 'DM me'.",
      };
    case "tiktok":
      return {
        aspect:
          "9:16 vertical composition (TikTok/Reels format). High contrast, designed to stop the scroll.",
        captionRules:
          "Caption: 1–2 short sentences. Optional 3 hashtags max. Conversational.",
      };
    case "facebook":
      return {
        aspect: "1.91:1 landscape composition (Facebook feed format).",
        captionRules:
          "Caption: 60–120 words. Plain language. No more than 3 hashtags.",
      };
    case "instagram":
    default:
      return {
        aspect: "4:5 portrait composition (Instagram feed format).",
        captionRules:
          "Caption: 80–160 words. Hook in the first line. Body in 2–3 short paragraphs. End with a single specific call to action or question. Add 5–8 hashtags at the very end on a new line, mixing branded + community + topical.",
      };
  }
}

/**
 * Build a single content-draft prompt that asks Gemini to return BOTH
 * an image (matching the brand's voice + the draft's pillar) and a
 * caption. Gemini returns image bytes plus a text part in the same call.
 *
 * If `previousFeedback` is set, it's injected so the regenerated output
 * actually responds to the client's revision request.
 */
export function buildDraftPrompt(
  brand: BrandPromptInput,
  draft: DraftPromptInput
): string {
  const platform = (draft.platform || "instagram").toLowerCase();
  const { aspect, captionRules } = platformBlock(platform);

  const lines: string[] = [];
  lines.push(
    `Generate one social media post for ${clean(brand.name)} — produce BOTH an image and a caption.`
  );
  lines.push("");
  lines.push(`BRAND: ${clean(brand.name)}`);
  if (brand.tagline) lines.push(`Tagline: ${clean(brand.tagline)}`);
  if (brand.positioning)
    lines.push(`Positioning: ${clean(brand.positioning, 320)}`);
  if (brand.description && !brand.positioning) {
    lines.push(`Description: ${clean(brand.description, 320)}`);
  }
  if (brand.hq_location) lines.push(`Located in: ${clean(brand.hq_location, 80)}`);

  const colors = colorList(brand.colors);
  if (colors) lines.push(`Brand colors: ${colors}`);

  if (brand.tone) {
    const kw = (brand.tone.keywords ?? []).slice(0, 5).join(", ");
    const dos = (brand.tone.dos ?? []).slice(0, 3).join("; ");
    const donts = (brand.tone.donts ?? []).slice(0, 3).join("; ");
    if (kw) lines.push(`Brand voice: ${kw}`);
    if (dos) lines.push(`Do: ${clean(dos, 200)}`);
    if (donts) lines.push(`Don't: ${clean(donts, 200)}`);
  }

  if (brand.photography_direction) {
    lines.push(`Visual direction: ${clean(brand.photography_direction, 280)}`);
  }

  if (draft.pillar) {
    lines.push(`Content pillar for this post: ${clean(draft.pillar, 200)}`);
  }

  lines.push(`Scheduled for: ${draft.slot_date} on ${platform}`);

  lines.push("");
  lines.push(`IMAGE: ${aspect}`);
  lines.push(
    `Real, production-quality design — not a mockup or wireframe. No watermarks. No spelling errors. No fake logos other than this brand's wordmark if naturally fitting. Avoid AI-generated clichés (purple gradients, perfect bokeh, gleaming chrome).`
  );

  lines.push("");
  lines.push(`CAPTION ${captionRules}`);
  lines.push(
    `Plain-spoken, specific, in-character with the brand voice above. Avoid template phrases like "transform your business", "level up", "your journey starts here". Don't use em dashes.`
  );

  const tags = curatedHashtags(brand.hashtags, platform);
  if (tags.length > 0) {
    lines.push("");
    lines.push(
      `HASHTAGS — use exactly this curated set at the end of the caption, on a new line, prefixed with #. Do NOT invent new tags or substitute synonyms. Use all ${tags.length}, in the order given:`
    );
    lines.push(tags.map((t) => `#${t}`).join(" "));
  } else if (platform !== "linkedin") {
    lines.push("");
    lines.push(
      "HASHTAGS — the brand has no curated set; pick 3–5 specific, low-competition tags relevant to the topic. No broad spam tags like #love #instagood."
    );
  }

  if (draft.previousCaption || draft.previousFeedback) {
    lines.push("");
    lines.push("REVISION CONTEXT:");
    if (draft.previousCaption) {
      lines.push(`Previous caption: ${clean(draft.previousCaption, 400)}`);
    }
    if (draft.previousFeedback) {
      lines.push(
        `Client feedback on the previous version: "${clean(
          draft.previousFeedback,
          400
        )}". Apply this feedback directly — change what they asked you to change.`
      );
    }
  }

  return lines.join("\n");
}
