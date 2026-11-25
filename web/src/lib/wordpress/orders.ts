import "server-only";
import { wpFetch } from "./client";

/**
 * Order requests: a visitor's cart becomes a WooCommerce order, on hold and unpaid ("pay at the
 * clinic"), through the ndm-pricing plugin's `ndm/v1/orders` route. Only WooCommerce IDs and
 * quantities are sent: WooCommerce puts its own names and prices on the order. The call is made with
 * the site's own WordPress account (WORDPRESS_AUTH_USER), which can do nothing else.
 */

export interface OrderRequestInput {
  lines: { productId: number; variationId: number; qty: number }[];
  customer: { first: string; last: string; email: string; phone: string; address: string; apt: string; city: string; province: string; postal: string };
  /** "NewDermaMed Uptown". */
  clinic: string;
  /** "2026-12-01, morning", or "Call me to find a time". */
  preferred: string;
  note: string;
  /** The signed-in customer the order belongs to; left out for a visitor without an account. */
  customerId?: number;
  /** The checkout code of a running sale; WooCommerce applies its own coupon to the eligible lines. */
  code?: string;
  /** "card": paid online on WooCommerce's pay page; left out or "clinic": paid at the appointment. */
  pay?: "card" | "clinic";
  /** Where the buyer came from: saved as WooCommerce's order attribution (the Orders list's Origin column). */
  source?: OrderSource;
}

/** WooCommerce's order attribution: "utm" (a tagged link), "organic" (a search engine), "referral" (another site), "typein" (direct). */
export interface OrderSource {
  type: "utm" | "organic" | "referral" | "typein";
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** The search engine's or other site's host. */
  referrer?: string;
  /** The first page of that visit ("/black-friday"). */
  entry?: string;
}

export interface PlacedOrder {
  /** WooCommerce order number. */
  number: string;
  /** ISO 8601. */
  date: string;
  lines: { productId: number; variationId: number; cat: string; name: string; label: string; qty: number; price: number; was: number }[];
  sub: number;
  saved: number;
  /** The checkout code WooCommerce applied ("" without one) and what it took off the subtotal. */
  code?: string;
  discount?: number;
  /** Whether WooCommerce charges tax; `tax` and `total` are always WooCommerce's own figures. */
  taxEnabled: boolean;
  /** "HST (13%)", from the order's own tax line; "" when the order has no tax. */
  taxLabel?: string;
  tax: number;
  total: number;
  /** How the order is paid. Card orders also carry WooCommerce's order ID, key and pay page. */
  pay?: "card" | "clinic";
  id?: number;
  key?: string;
  payUrl?: string;
}

export async function placeOrderRequest(input: OrderRequestInput): Promise<PlacedOrder> {
  return (await wpFetch<PlacedOrder>("ndm/v1/orders", { auth: true, body: input, timeoutMs: 30_000 })).data;
}

/** Whether the checkout may offer card payment (the Bambora gateway is switched on in WooCommerce). */
export interface PaymentOptions {
  card: boolean;
  title: string;
}

/** Read fresh on every checkout: switching the gateway off in WooCommerce hides the choice at once. */
export async function getPaymentOptions(): Promise<PaymentOptions> {
  try {
    const { data } = await wpFetch<PaymentOptions>("ndm/v1/payments", { timeoutMs: 8_000 });
    return { card: data?.card === true, title: typeof data?.title === "string" ? data.title : "" };
  } catch {
    return { card: false, title: "" };
  }
}

/** A website order's payment, asked with the order's key: what the confirmation page shows. */
export interface OrderPayment {
  number: string;
  card: boolean;
  paid: boolean;
  status: string;
  total: number;
  /** WooCommerce's pay page while a card order is still unpaid, else "". */
  payUrl: string;
}

export async function getOrderPayment(id: number, key: string): Promise<OrderPayment> {
  return (await wpFetch<OrderPayment>(`ndm/v1/orders/${id}/payment?key=${encodeURIComponent(key)}`, { timeoutMs: 10_000 })).data;
}
