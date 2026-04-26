import "server-only";

export const INVITE_COOKIE = "sp_invite";
export const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export type InvitePayload = {
  slug: string;
  name: string;
  email: string;
  jti: string;
  exp: number; // unix seconds
};

function b64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const str = String.fromCharCode(...arr);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const str = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(str, (c) => c.charCodeAt(0));
}

async function key() {
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_COOKIE_SECRET must be set (≥16 chars)");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`invite:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signInvite(p: InvitePayload): Promise<string> {
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(p)));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await key(),
    new TextEncoder().encode(body)
  );
  return `${body}.${b64urlEncode(sig)}`;
}

export async function verifyInvite(
  token: string | undefined | null
): Promise<InvitePayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  let expected: ArrayBuffer;
  try {
    expected = await crypto.subtle.sign(
      "HMAC",
      await key(),
      new TextEncoder().encode(body)
    );
  } catch {
    return null;
  }
  const given = b64urlDecode(sig);
  if (!timingSafeEqual(new Uint8Array(expected), given)) return null;

  let payload: InvitePayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  } catch {
    return null;
  }

  if (
    typeof payload.slug !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.jti !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}
