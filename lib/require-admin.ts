import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "./admin-auth";

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  return verifySession(token).catch(() => false);
}

export async function requireAdmin(): Promise<Response | null> {
  return (await isAdmin())
    ? null
    : Response.json({ error: "Unauthorized" }, { status: 401 });
}
