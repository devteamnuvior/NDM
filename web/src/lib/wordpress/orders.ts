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
  /** Whether WooCommerce works out tax itself; when it does not, `tax` is 0 and the site shows its estimate. */
  taxEnabled: boolean;
  tax: number;
  total: number;
}

export async function placeOrderRequest(input: OrderRequestInput): Promise<PlacedOrder> {
  return (await wpFetch<PlacedOrder>("ndm/v1/orders", { auth: true, body: input, timeoutMs: 30_000 })).data;
}
