import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * The sign-in of "My account". A customer signs in with the email address and password of their
 * WooCommerce account; WordPress checks them (ndm/v1/account/sign-in) and this server keeps only the
 * customer's ID and a stamp in an encrypted, httpOnly cookie. The stamp changes with the password, so
 * WordPress refuses every older sign-in after a password change. The password itself is never kept.
 */

export const ACCOUNT_COOKIE = "ndm_account";
const SESSION_DAYS = 14;

export interface AccountSession {
  /** WooCommerce customer ID. */
  id: number;
  /** Proof of this sign-in, checked by WordPress on every request. */
  stamp: string;
  /** Milliseconds since 1970. */
  expires: number;
}

/** ACCOUNT_SECRET, or the secret this server already has for its other encrypted cookie. */
const secret = (): string | null => {
  const value = (process.env.ACCOUNT_SECRET || process.env.PRICING_ADMIN_SECRET || "").trim();
  return value.length >= 32 ? value : null;
};

/** True when accounts can work at all on this server. */
export function isAccountConfigured(): boolean {
  return Boolean(secret() && process.env.WORDPRESS_API_URL?.trim() && process.env.WORDPRESS_AUTH_USER?.trim());
}

function key(): Buffer {
  const value = secret();
  if (!value) throw new Error("ACCOUNT_SECRET is missing or shorter than 32 characters.");
  return Buffer.from(hkdfSync("sha256", value, "ndm-account", "session-cookie", 32));
}

function seal(session: AccountSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

function unseal(value: string): AccountSession | null {
  try {
    const raw = Buffer.from(value, "base64url");
    if (raw.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const session = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8")) as AccountSession;
    if (!Number.isInteger(session.id) || session.id <= 0 || typeof session.stamp !== "string" || typeof session.expires !== "number") return null;
    return session.expires > Date.now() ? session : null;
  } catch {
    return null; /* tampered with, made with another secret, or not ours */
  }
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  /* lax: a link from an email opens the site signed in, and no other site can make this browser send a change */
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

/** The signed-in customer of this request, or null. */
export async function getAccountSession(): Promise<AccountSession | null> {
  if (!isAccountConfigured()) return null;
  const value = (await cookies()).get(ACCOUNT_COOKIE)?.value;
  if (!value) return null;
  await connection(); /* judged against the clock of this very request */
  return unseal(value);
}

export async function startAccountSession(id: number, stamp: string): Promise<void> {
  (await cookies()).set(ACCOUNT_COOKIE, seal({ id, stamp, expires: Date.now() + SESSION_DAYS * 86_400_000 }), cookieOptions(SESSION_DAYS * 86_400));
}

export async function endAccountSession(): Promise<void> {
  (await cookies()).set(ACCOUNT_COOKIE, "", cookieOptions(0));
}
