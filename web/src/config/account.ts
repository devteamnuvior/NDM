/**
 * My account: the section bar and the sample account the page shows. Ported from the prototype's
 * src/account-ui.jsx. Sample data only (a made-up member, "Alex M."): nothing is loaded from or sent to a
 * server, and no health information is ever shown here (PHIPA). An order holds no amount: its total is the
 * WooCommerce price of the treatment and option it names, read on the server.
 */

export type AccountTabId = "dashboard" | "plans" | "orders" | "payment" | "membership" | "wishlist" | "forms" | "details";

export const ACCOUNT_TABS: { id: AccountTabId; label: string; soon?: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "plans", label: "My plans & saved treatments" },
  { id: "orders", label: "Orders & receipts" },
  { id: "payment", label: "Payment methods", soon: "Soon" },
  { id: "membership", label: "Premium membership" },
  { id: "wishlist", label: "Wishlist" },
  { id: "forms", label: "Health & consent forms" },
  { id: "details", label: "Account details" },
];

export interface AccountOrder {
  no: string;
  date: string;
  items: string;
  status: string;
  clinic: string;
  /** The entry of the price list the order's total is read from; none for an order from the skincare shop. */
  priced?: { item: string; option: string };
}

export const ACCOUNT_ORDERS: AccountOrder[] = [
  { no: "NDM-20418", date: "Nov 3, 2026", items: "Microneedling-Face, package of 3", status: "Booked", clinic: "Uptown", priced: { item: "Microneedling-Face", option: "Package of 3" } },
  { no: "NDM-20377", date: "Oct 12, 2026", items: "Age Element Facial, single session", status: "Completed", clinic: "Downtown", priced: { item: "Age Element Facial", option: "Single session" } },
  { no: "NDM-20290", date: "Sep 21, 2026", items: "Activ Retinol 0.5, 30 ml (shop)", status: "Delivered", clinic: "Online" },
];

/** An order as the page shows it: `total` is WooCommerce's price, null when there is none to show. */
export type AccountOrderRow = AccountOrder & { total: number | null };
