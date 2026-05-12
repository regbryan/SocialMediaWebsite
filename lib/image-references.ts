import "server-only";
import { supabaseAdmin } from "./supabase-admin";

export type ImageReference = {
  kind: string;
  label: string;
  mimeType: string;
  /** Base64-encoded bytes ready to drop into Gemini's `inlineData`. */
  data: string;
};

/**
 * Max images Gemini Flash Image will reliably accept alongside a text
 * prompt before output quality starts degrading. 3 is a safe ceiling.
 */
const MAX_REFS = 3;

/**
 * Prioritize references that meaningfully shape generation. Logo first
 * (brand identity), then a hero image (visual feel), then one photo from
 * the broader library.
 */
const PRIORITY: string[] = ["logo", "hero_image", "photo_library", "cutout"];

type AssetRow = {
  id: string;
  kind: string;
  url: string;
  meta: { label?: string; primary?: boolean } | null;
  created_at: string;
};

/**
 * Load up to 3 brand assets for a kit, fetch their bytes, and return them
 * in a shape ready to inline into a Gemini multimodal request.
 *
 * Returns an empty array on any failure — image generation should never
 * be blocked by missing references.
 */
export async function loadReferenceImages(
  brandKitId: string
): Promise<ImageReference[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("brand_kit_assets")
    .select("id, kind, url, meta, created_at")
    .eq("brand_kit_id", brandKitId)
    .in("kind", PRIORITY)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as AssetRow[];

  // Pick one of each priority kind, in order. Within a kind, an asset
  // explicitly marked `meta.primary = true` always wins so operators
  // can pin which logo/hero is used; otherwise fall back to most recent.
  // If a kind is missing, backfill with the next available row so we
  // always send up to MAX_REFS images when assets exist.
  const pickOfKind = (kind: string): AssetRow | undefined => {
    const ofKind = rows.filter((r) => r.kind === kind);
    return ofKind.find((r) => r.meta?.primary) ?? ofKind[0];
  };

  const picked: AssetRow[] = [];
  for (const kind of PRIORITY) {
    if (picked.length >= MAX_REFS) break;
    const next = pickOfKind(kind);
    if (next && !picked.includes(next)) picked.push(next);
  }
  for (const row of rows) {
    if (picked.length >= MAX_REFS) break;
    if (!picked.includes(row)) picked.push(row);
  }

  const refs = await Promise.all(picked.map(fetchReference));
  return refs.filter((r): r is ImageReference => r !== null);
}

async function fetchReference(row: AssetRow): Promise<ImageReference | null> {
  try {
    const res = await fetch(row.url, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type") || "image/png";
    const buf = await res.arrayBuffer();
    // Convert to base64 in a Node-safe way.
    const data = Buffer.from(buf).toString("base64");
    return {
      kind: row.kind,
      label: row.meta?.label || row.kind,
      mimeType,
      data,
    };
  } catch {
    return null;
  }
}

/**
 * Produce the instructional preamble that goes at the top of the prompt
 * when we include reference images. Tells Gemini what each attached
 * image represents so it knows what to do with each one.
 */
export function referencePromptPreamble(refs: ImageReference[]): string {
  if (refs.length === 0) return "";
  const lines: string[] = [
    `REFERENCE IMAGES ATTACHED (${refs.length}):`,
  ];
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    let role: string;
    switch (r.kind) {
      case "logo":
        role =
          "the brand's actual logo. Place a small version naturally if the composition calls for a wordmark. Do NOT redraw or distort.";
        break;
      case "hero_image":
        role =
          "reference for the brand's visual feel — match the lighting, palette, and subject treatment, but compose a NEW image (don't copy).";
        break;
      case "photo_library":
        role =
          "additional photographic reference — same style direction as the hero.";
        break;
      case "cutout":
        role =
          "subject cutout (transparent PNG). Composite this person/object into the design if it fits the topic.";
        break;
      default:
        role = "brand reference — use for inspiration only.";
    }
    lines.push(`  ${i + 1}. (${r.kind}${r.label ? ` · ${r.label}` : ""}) — ${role}`);
  }
  lines.push("");
  return lines.join("\n");
}
