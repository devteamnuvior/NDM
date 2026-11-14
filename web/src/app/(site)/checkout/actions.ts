"use server";

import { headers } from "next/headers";
import { CHECKOUT_STEPS, HST, PROVINCES, TIMES_OF_DAY } from "@/config/checkout";
import { CLINICS } from "@/config/site";
import { CART_MAX, cartKey, type CartLine } from "@/lib/cart";
import { WordPressError, isWordPressConfigured, placeOrderRequest } from "@/lib/wordpress";

/**
 * Places an order request. The browser sends what was chosen (WooCommerce IDs and quantities) and the
 * visitor's details; it never sends a price. WooCommerce checks the lines against the price list,
 * puts its own prices on the order and keeps it on hold, unpaid: payment is taken at the clinic.
 */

export interface OrderRequestForm {
  lines: { productId: number; variationId: number; qty: number }[];
  first: string;
  last: string;
  email: string;
  phone: string;
  address: string;
  apt: string;
  city: string;
  province: string;
  postal: string;
  /** "Uptown" or "Downtown". */
  clinic: string;
  /** "2026-12-01", or "" for any day. */
  day: string;
  time: string;
  /** "Call me to find a time instead". */
  call: boolean;
  note: string;
  agree: boolean;
  /** Left empty by people; filled in by form-filling robots. */
  company: string;
}

/** What the confirmation page shows and keeps: no email, phone or address. */
export interface OrderReceipt {
  no: string;
  date: string;
  lines: CartLine[];
  sub: number;
  saved: number;
  tax: number;
  total: number;
  first: string;
  clinic: string;
  pay: string;
}

export type OrderResult = { ok: true; order: OrderReceipt } | { ok: false; reason: "invalid" | "unavailable" | "busy" | "unreachable"; message: string };

const round2 = (n: number): number => Math.round(n * 100) / 100;
const text = (value: unknown, max: number): string | null => (typeof value === "string" && value.trim().length <= max ? value.trim() : null);

/* a small brake on repeated requests from one address; a real limiter belongs in front of the site */
const WINDOW_MS = 10 * 60_000;
const MAX_IN_WINDOW = 6;
const recent = new Map<string, number[]>();
function tooMany(address: string): boolean {
  const now = Date.now();
  const times = (recent.get(address) ?? []).filter((t) => now - t < WINDOW_MS);
  times.push(now);
  recent.set(address, times);
  if (recent.size > 5000) recent.clear();
  return times.length > MAX_IN_WINDOW;
}

const invalid = (message: string): OrderResult => ({ ok: false, reason: "invalid", message });

export async function placeOrderAction(form: OrderRequestForm): Promise<OrderResult> {
  if (typeof form !== "object" || form === null) return invalid("The request could not be read. Please reload the page and try again.");
  if (form.company) return { ok: false, reason: "busy", message: "The request could not be sent. Please call the clinic." };

  const address = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(address)) return { ok: false, reason: "busy", message: "Too many requests in a short time. Please wait a few minutes, or call the clinic." };

  if (!Array.isArray(form.lines) || !form.lines.length || form.lines.length > 50) return invalid("Your cart is empty.");
  const lines = form.lines.map((l) => ({ productId: l?.productId, variationId: l?.variationId, qty: l?.qty }));
  if (lines.some((l) => !Number.isInteger(l.productId) || l.productId <= 0 || !Number.isInteger(l.variationId) || l.variationId < 0 || !Number.isInteger(l.qty) || l.qty < 1 || l.qty > CART_MAX)) {
    return { ok: false, reason: "unavailable", message: "Something in your cart could not be read. Please review your cart." };
  }

  const first = text(form.first, 60);
  const last = text(form.last, 60);
  const email = text(form.email, 120);
  const phone = text(form.phone, 30);
  const street = text(form.address, 120);
  const apt = text(form.apt, 60);
  const city = text(form.city, 60);
  const postal = text(form.postal, 10);
  const note = text(form.note, 500);
  if (!first || !last || !email || phone === null || !street || apt === null || !city || !postal || note === null) return invalid("Please check your details: something is missing or too long.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid("Please enter a valid email address.");
  if (!(PROVINCES as readonly string[]).includes(form.province)) return invalid("Please choose a province.");
  if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postal)) return invalid("Please enter a Canadian postal code such as M2N 5M5.");
  const clinic = CLINICS.find((c) => c.name === form.clinic);
  if (!clinic) return invalid("Please choose a clinic.");
  if (!(TIMES_OF_DAY as readonly string[]).includes(form.time)) return invalid("Please choose a time of day.");
  if (typeof form.day !== "string" || (form.day !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(form.day))) return invalid("Please choose a preferred day.");
  if (form.agree !== true) return invalid(`Please accept the terms to place your request (step ${CHECKOUT_STEPS.indexOf("Review")}).`);

  if (!isWordPressConfigured()) return { ok: false, reason: "unreachable", message: "Order requests are not available right now. Please call the clinic." };

  try {
    const placed = await placeOrderRequest({
      lines,
      customer: { first, last, email, phone, address: street, apt, city, province: form.province, postal },
      clinic: `NewDermaMed ${clinic.name}`,
      preferred: form.call === true ? "Call me to find a time" : `${form.day || "Any day"}, ${form.time.toLowerCase()}`,
      note,
    });
    /* until WooCommerce works out tax itself, HST is the site's estimate, as on the cart page */
    const tax = placed.taxEnabled ? placed.tax : round2(placed.sub * HST);
    return {
      ok: true,
      order: {
        no: placed.number,
        date: placed.date,
        lines: placed.lines.map((l) => ({ key: cartKey(l.productId, l.variationId), cat: l.cat, name: l.name, label: l.label, price: l.price, was: l.was || undefined, unit: "", productId: l.productId, variationId: l.variationId, qty: l.qty })),
        sub: placed.sub,
        saved: placed.saved,
        tax,
        total: placed.taxEnabled ? placed.total : round2(placed.sub + tax),
        first,
        clinic: clinic.name,
        pay: "Pay at your appointment",
      },
    };
  } catch (error) {
    if (!(error instanceof WordPressError)) throw error;
    if (error.kind === "http" && error.status === 409) return { ok: false, reason: "unavailable", message: "Something in your cart is no longer on the price list. Please review your cart." };
    if (error.kind === "http" && error.status === 400) return invalid(error.message);
    console.error("[checkout] the order request could not be placed:", error.kind, error.status ?? "", error.message);
    return { ok: false, reason: "unreachable", message: "Your request could not be sent right now. Nothing was placed; please try again in a moment, or call the clinic." };
  }
}
