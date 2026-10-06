import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* One password (ADMIN_PASSWORD env var). The cookie holds an HMAC of
   it, so changing the password signs everyone out. */
const COOKIE = "lw-admin";

const sha = (s: string) => createHash("sha256").update(s).digest();
const sameSecret = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));
const token = (pw: string) => createHmac("sha256", pw).update("little-world-admin").digest("hex");

export const passwordConfigured = () => !!process.env.ADMIN_PASSWORD;

export async function isAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const got = (await cookies()).get(COOKIE)?.value ?? "";
  return sameSecret(got, token(pw));
}

export async function signIn(password: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !sameSecret(password, pw)) return false;
  (await cookies()).set(COOKIE, token(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
