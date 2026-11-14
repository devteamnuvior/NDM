/** Cart, checkout and order confirmation: fixed wording and lists. Prices are never kept here. */

/** Ontario HST, shown as an estimate until WooCommerce works out tax itself. */
export const HST = 0.13;

/** localStorage key of the last order request: order number, lines, totals, first name and clinic only. */
export const ORDER_STORAGE_KEY = "ndm-last-order";

export const CHECKOUT_STEPS = ["Cart", "Details", "Appointment", "Payment", "Review", "Confirmation"] as const;

export const PROVINCES = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"] as const;

export const TIMES_OF_DAY = ["Morning", "Afternoon", "Evening"] as const;

/** "Pairs well with your treatment": treatment and option, looked up on the WooCommerce price list. */
export const CART_PAIRS: [name: string, label: string][] = [
  ["Microneedling-Face", "Single session"],
  ["Skin Booster – HA (Hyaluronic Acid)", "1 syringe"],
  ["Age Element Facial", "Single session"],
  ["Purifying Light Peel", "Single session"],
];
