"use server";

import { headers } from "next/headers";
import { endAccountSession, getAccountSession, isAccountConfigured, startAccountSession } from "@/lib/account/session";
import { CLINICS } from "@/config/site";
import {
  WordPressError,
  accountRegister,
  accountSignIn,
  changeAccountPassword,
  requestAccountReset,
  resetAccountPassword,
  saveAccountNotify,
  saveAccountProfile,
  type AccountNotify,
} from "@/lib/wordpress";

/**
 * "My account": sign-in, a new account, the customer's details, notification choices and password.
 * Every one is checked here and again by WordPress, which holds the accounts (WooCommerce customers).
 * A password travels from the form to WordPress and is kept nowhere on this server.
 */

export type AccountResult = { ok: true; message?: string } | { ok: false; message: string; signedOut?: boolean };

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const UNREACHABLE = "Your account could not be reached right now. Please try again in a moment.";
const SIGNED_OUT: AccountResult = { ok: false, signedOut: true, message: "Your sign-in has ended. Please sign in again." };

const text = (value: unknown, max: number): string | null => (typeof value === "string" && value.trim().length <= max ? value.trim() : null);
const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPassword = (value: unknown): value is string => typeof value === "string" && value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX;

/* a small brake on guessing from one address (kept in memory, per server process); a real limiter belongs in front of the site */
const WINDOW_MS = 10 * 60_000;
const recent = new Map<string, number[]>();
async function tooMany(what: string, max: number): Promise<boolean> {
  const address = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${what}:${address}`;
  const now = Date.now();
  const times = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  times.push(now);
  recent.set(key, times);
  if (recent.size > 5000) recent.clear();
  return times.length > max;
}
const BUSY: AccountResult = { ok: false, message: "Too many tries in a short time. Please wait a few minutes." };

/** Turns a WordPress failure into words for the visitor; anything else is a bug and is thrown on. */
async function failed(error: unknown, what: string): Promise<AccountResult> {
  if (!(error instanceof WordPressError)) throw error;
  if (error.kind === "http" && error.code === "ndm_account_signed_out") {
    await endAccountSession();
    return SIGNED_OUT;
  }
  /* WordPress's own words for what the visitor can put right: a wrong password, a taken address, a field */
  if (error.kind === "http" && error.code && /^ndm_(account_(denied|exists|link)|pricing_invalid)$/.test(error.code)) return { ok: false, message: error.message };
  console.error(`[account] ${what} failed:`, error.kind, error.status ?? "", error.code ?? "");
  return { ok: false, message: UNREACHABLE };
}

export async function signInAction(form: { email: string; password: string }): Promise<AccountResult> {
  if (!isAccountConfigured()) return { ok: false, message: UNREACHABLE };
  const email = text(form?.email, 120);
  if (!email || !isEmail(email) || typeof form.password !== "string" || !form.password || form.password.length > PASSWORD_MAX) return { ok: false, message: "Please enter your email address and password." };
  if (await tooMany("sign-in", 10)) return BUSY;
  try {
    const who = await accountSignIn(email, form.password);
    await startAccountSession(who.id, who.stamp);
    return { ok: true };
  } catch (error) {
    return failed(error, "sign-in");
  }
}

export async function registerAction(form: { first: string; last: string; email: string; password: string; agree: boolean; company: string }): Promise<AccountResult> {
  if (!isAccountConfigured()) return { ok: false, message: UNREACHABLE };
  if (typeof form !== "object" || form === null || form.company) return { ok: false, message: UNREACHABLE }; /* a field people never see was filled in */
  const first = text(form.first, 60);
  const last = text(form.last, 60);
  const email = text(form.email, 120);
  if (!first || !last) return { ok: false, message: "Please enter your first and last name." };
  if (!email || !isEmail(email)) return { ok: false, message: "Please enter a valid email address." };
  if (!isPassword(form.password)) return { ok: false, message: `Please choose a password of at least ${PASSWORD_MIN} characters.` };
  if (form.agree !== true) return { ok: false, message: "Please accept the Terms and the Privacy Policy to create an account." };
  if (await tooMany("register", 5)) return BUSY;
  try {
    const who = await accountRegister({ first, last, email, password: form.password });
    await startAccountSession(who.id, who.stamp);
    return { ok: true };
  } catch (error) {
    return failed(error, "register");
  }
}

export async function signOutAction(): Promise<AccountResult> {
  await endAccountSession();
  return { ok: true };
}

export async function saveProfileAction(form: { first: string; last: string; email: string; phone: string; clinic: string }): Promise<AccountResult> {
  const session = await getAccountSession();
  if (!session) return SIGNED_OUT;
  const first = text(form?.first, 60);
  const last = text(form?.last, 60);
  const email = text(form?.email, 120);
  const phone = text(form?.phone, 30);
  if (!first || !last) return { ok: false, message: "Please enter your first and last name." };
  if (!email || !isEmail(email)) return { ok: false, message: "Please enter a valid email address." };
  if (phone === null || (phone && !/^[0-9+().\-\s]{7,30}$/.test(phone))) return { ok: false, message: "Please enter a valid phone number." };
  const clinic = form.clinic === "" ? "" : CLINICS.find((c) => c.name === form.clinic)?.name;
  if (clinic === undefined) return { ok: false, message: "Please choose a clinic." };
  try {
    await saveAccountProfile(session, { first, last, email, phone, clinic });
    return { ok: true, message: "Your details are saved." };
  } catch (error) {
    return failed(error, "profile");
  }
}

export async function saveNotifyAction(notify: AccountNotify): Promise<AccountResult> {
  const session = await getAccountSession();
  if (!session) return SIGNED_OUT;
  if (typeof notify !== "object" || notify === null || [notify.offers, notify.news, notify.events].some((v) => typeof v !== "boolean")) return { ok: false, message: "That choice could not be read." };
  try {
    await saveAccountNotify(session, { offers: notify.offers, news: notify.news, events: notify.events });
    return { ok: true };
  } catch (error) {
    return failed(error, "notifications");
  }
}

export async function changePasswordAction(form: { current: string; password: string; again: string }): Promise<AccountResult> {
  const session = await getAccountSession();
  if (!session) return SIGNED_OUT;
  if (typeof form?.current !== "string" || !form.current || form.current.length > PASSWORD_MAX) return { ok: false, message: "Please enter your current password." };
  if (!isPassword(form.password)) return { ok: false, message: `Please choose a new password of at least ${PASSWORD_MIN} characters.` };
  if (form.password !== form.again) return { ok: false, message: "The two new passwords are not the same." };
  if (await tooMany("password", 8)) return BUSY;
  try {
    /* the new password makes a new stamp: this browser stays signed in, every other one is signed out */
    const { stamp } = await changeAccountPassword(session, form.current, form.password);
    await startAccountSession(session.id, stamp);
    return { ok: true, message: "Your password is changed. Other devices are signed out." };
  } catch (error) {
    return failed(error, "password");
  }
}

/** Always the same answer, so the form cannot be used to find out who has an account. */
export async function requestResetAction(form: { email: string }): Promise<AccountResult> {
  if (!isAccountConfigured()) return { ok: false, message: UNREACHABLE };
  const email = text(form?.email, 120);
  if (!email || !isEmail(email)) return { ok: false, message: "Please enter a valid email address." };
  if (await tooMany("reset", 5)) return BUSY;
  try {
    await requestAccountReset(email);
    return { ok: true, message: "If an account uses this email address, a link to choose a new password is on its way." };
  } catch (error) {
    return failed(error, "reset request");
  }
}

export async function resetPasswordAction(form: { login: string; key: string; password: string; again: string }): Promise<AccountResult> {
  if (!isAccountConfigured()) return { ok: false, message: UNREACHABLE };
  const login = text(form?.login, 120);
  const key = text(form?.key, 200);
  if (!login || !key) return { ok: false, message: "This link has expired or was already used. Please ask for a new one." };
  if (!isPassword(form.password)) return { ok: false, message: `Please choose a password of at least ${PASSWORD_MIN} characters.` };
  if (form.password !== form.again) return { ok: false, message: "The two passwords are not the same." };
  if (await tooMany("reset", 5)) return BUSY;
  try {
    await resetAccountPassword(login, key, form.password);
    return { ok: true, message: "Your new password is saved. You can sign in with it now." };
  } catch (error) {
    return failed(error, "reset");
  }
}
