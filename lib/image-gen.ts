import "server-only";
import type { ImageReference } from "./image-references";

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.0-flash-image";

type GenResult =
  | { ok: true; bytes: Uint8Array; mimeType: string; textNote: string | null }
  | { ok: false; error: string };

/**
 * Generate one image from a text prompt via Google's Gemini image model.
 *
 * Direct REST call — no SDK dependency. Returns image bytes ready to
 * upload to storage. Never throws; surfaces failures as { ok: false }.
 *
 * `references` are optional brand-asset images inlined into the request
 * so Gemini's multimodal model can condition output on the actual brand
 * (real logo, real photography). Each reference becomes one extra `part`
 * in the request alongside the text prompt.
 */
export async function generateImage(
  prompt: string,
  references: ImageReference[] = []
): Promise<GenResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { ok: false, error: "GEMINI_API_KEY is not configured." };
  }

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [{ text: prompt }];
  for (const ref of references) {
    parts.push({
      inlineData: { mimeType: ref.mimeType, data: ref.data },
    });
  }

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
        // Vercel functions cap at ~60s on Hobby. One image generally returns
        // in 5–10s but we give ourselves headroom for slow upstreams.
        signal: AbortSignal.timeout(45_000),
      }
    );
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error talking to Gemini.",
    };
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) detail = body.error.message;
    } catch {
      // Ignore JSON parse errors; keep the status code.
    }
    return { ok: false, error: `Gemini: ${detail}` };
  }

  type Part = {
    text?: string;
    inlineData?: { mimeType?: string; data?: string };
    inline_data?: { mime_type?: string; data?: string };
  };
  const body = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Part[] } }>;
  };

  const responseParts = body.candidates?.[0]?.content?.parts ?? [];
  let imageData: string | undefined;
  let mimeType = "image/png";
  let textNote: string | null = null;
  for (const p of responseParts) {
    if (p.inlineData?.data) {
      imageData = p.inlineData.data;
      mimeType = p.inlineData.mimeType ?? mimeType;
    } else if (p.inline_data?.data) {
      imageData = p.inline_data.data;
      mimeType = p.inline_data.mime_type ?? mimeType;
    } else if (p.text) {
      textNote = (textNote ?? "") + p.text;
    }
  }

  if (!imageData) {
    return {
      ok: false,
      error: textNote
        ? `Gemini returned text only: ${textNote.slice(0, 200)}`
        : "Gemini returned no image data.",
    };
  }

  const bytes = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));
  return { ok: true, bytes, mimeType, textNote };
}
