/**
 * My account: the section bar. The account itself is a WooCommerce customer (see
 * `lib/wordpress/account.ts`); no health information is ever shown here (PHIPA).
 *
 * Left out for now on the user's request (2026-11-14): appointments and Premium membership. Also left
 * out until there is something real to show: the wishlist (nothing on the site saves to one) and the
 * health and consent forms (their status lives at the clinic, not in WooCommerce). The prototype's
 * `src/account-ui.jsx` keeps the design of all four.
 */

export type AccountTabId = "dashboard" | "plans" | "orders" | "payment" | "details";

export const ACCOUNT_TABS: { id: AccountTabId; label: string; soon?: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "plans", label: "My plans & saved treatments" },
  { id: "orders", label: "Orders & receipts" },
  { id: "payment", label: "Payment methods", soon: "Soon" },
  { id: "details", label: "Account details" },
];
