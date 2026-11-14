import "server-only";
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getWordPressConfig } from "@/lib/wordpress/config";
import { wpFetch } from "@/lib/wordpress/client";

/**
 * The sign-in of the price list's management screen.
 *
 * An administrator signs in on WordPress itself (its "authorize application" screen) and WordPress
 * hands this server a revocable application password for that person. It is kept, encrypted, in an
 * httpOnly cookie: the browser can neither read it nor use it anywhere else. Every management request
 * is sent to WordPress with it, and WordPress decides each time whether that person may do it. This
 * server holds no user list and no rights of its own.
 */

export const SESSION_COOKIE = "ndm_pricing_admin";
export const STATE_COOKIE = "ndm_pricing_state";
/** Shown on the administrator's WordPress profile, where the access can be revoked. */
export const APP_NAME = "NewDermaMed pricing manager";
export const APP_ID = "5d0c2b1e-7a44-4f0b-9d55-6f1e2a8c3b70";
export const MANAGE_PATH = "/manage/pricing";
/** The offers' management screen: the same sign-in, the same session. */
export const PROMOTIONS_PATH = "/manage/promotions";

const SESSION_HOURS = 8;

export interface PricingSession {
  /** WordPress user login. */
  login: string;
  /** Display name, for the screen only. */
  name: string;
  /** Ready-made Authorization header for WordPress. Never leaves the server. */
  authorization: string;
  /** Sent back by the screen with every change, so another site cannot make this browser do it. */
  csrf: string;
  /** Milliseconds since 1970. */
  expires: number;
}

function key(): Buffer {
  const secret = process.env.PRICING_ADMIN_SECRET?.trim();
  if (!secret || secret.length < 32) throw new Error("PRICING_ADMIN_SECRET is missing or shorter than 32 characters.");
  return Buffer.from(hkdfSync("sha256", secret, "ndm-pricing-admin", "session-cookie", 32));
}

/** True when the management screen can work at all on this server. */
export function isPricingAdminConfigured(): boolean {
  const secret = process.env.PRICING_ADMIN_SECRET?.trim();
  return Boolean(secret && secret.length >= 32 && process.env.WORDPRESS_API_URL?.trim());
}

function seal(session: PricingSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

function unseal(value: string): PricingSession | null {
  try {
    const raw = Buffer.from(value, "base64url");
    if (raw.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const session = JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8")) as PricingSession;
    if (typeof session.authorization !== "string" || typeof session.csrf !== "string" || typeof session.expires !== "number") return null;
    return session.expires > Date.now() ? session : null;
  } catch {
    return null; /* tampered with, made with another secret, or not ours */
  }
}

export const safeEqual = (a: string, b: string): boolean => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  /* lax: the cookie must survive the trip back from WordPress's sign-in screen; changes are POSTs,
     which lax never sends from another site, and each one also carries the session's own token */
  sameSite: "lax" as const,
  path: "/manage",
  maxAge,
});

/** The signed-in administrator of this request, or null. */
export async function getPricingSession(): Promise<PricingSession | null> {
  if (!isPricingAdminConfigured()) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  await connection(); /* a session is judged against the clock of this very request, never ahead of time */
  return unseal(value);
}

/** The session of a change request: signed in, and carrying the session's own token. */
export async function requirePricingSession(csrf: unknown): Promise<PricingSession | null> {
  const session = await getPricingSession();
  return session && typeof csrf === "string" && safeEqual(csrf, session.csrf) ? session : null;
}

export async function startPricingSession(login: string, password: string, name: string): Promise<void> {
  const session: PricingSession = {
    login,
    name,
    authorization: basicAuth(login, password),
    csrf: randomBytes(32).toString("base64url"),
    expires: Date.now() + SESSION_HOURS * 3600_000,
  };
  (await cookies()).set(SESSION_COOKIE, seal(session), cookieOptions(SESSION_HOURS * 3600));
}

export async function endPricingSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", cookieOptions(0));
}

export const basicAuth = (login: string, password: string): string => `Basic ${Buffer.from(`${login}:${password.replace(/\s+/g, "")}`).toString("base64")}`;

/** Deletes the application password behind an Authorization header in WordPress (sign-out, refused accounts). */
export async function revokeApplicationPassword(authorization: string): Promise<void> {
  try {
    const { data } = await wpFetch<{ uuid: string }>("wp/v2/users/me/application-passwords/introspect", { authorization, query: { _fields: ["uuid"] } });
    if (/^[0-9a-f-]{36}$/i.test(data.uuid)) await wpFetch(`wp/v2/users/me/application-passwords/${data.uuid}`, { authorization, method: "DELETE" });
  } catch {
    /* already revoked or WordPress unreachable: the cookie is dropped either way */
  }
}

/** A short-lived cookie tying WordPress's answer to the browser that asked for it. */
export async function newSignInState(): Promise<string> {
  const state = randomBytes(24).toString("base64url");
  (await cookies()).set(STATE_COOKIE, state, cookieOptions(600));
  return state;
}

export async function takeSignInState(): Promise<string | null> {
  const jar = await cookies();
  const state = jar.get(STATE_COOKIE)?.value ?? null;
  jar.set(STATE_COOKIE, "", cookieOptions(0));
  return state;
}

/** WordPress as a browser reaches it: WORDPRESS_PUBLIC_URL, else the host of the REST API. */
export function wordpressOrigin(): string {
  const explicit = process.env.WORDPRESS_PUBLIC_URL?.trim();
  return new URL(explicit || getWordPressConfig().apiUrl).origin;
}

/**
 * WordPress's own address, folder included, without a trailing slash: "https://example.com/react" when
 * it is installed in a folder (its admin is then /react/wp-admin). From WORDPRESS_PUBLIC_URL, else the
 * REST API address without its "/wp-json" ending.
 */
export function wordpressBase(): string {
  const explicit = process.env.WORDPRESS_PUBLIC_URL?.trim();
  const url = new URL(explicit || getWordPressConfig().apiUrl.replace(/\/wp-json\/?$/, ""));
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

/** This site's own address: SITE_URL, or in development the address of the request. Null when unknown. */
export function siteOrigin(request: Request): string | null {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      return null;
    }
  }
  return process.env.NODE_ENV === "production" ? null : new URL(request.url).origin;
}
