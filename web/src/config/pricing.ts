/** Pricing page content. Prices themselves live in config/prices.ts. */

export const PRICE_FAQS: [question: string, answer: string][] = [
  ["How do I check the price of a treatment?", "Open a category in the price list, then any treatment with the + button. Each one shows its sessions, packages and current offers."],
  ["Are the prices the same at all locations?", "Yes. The listed prices and promotions apply across all our clinic locations unless otherwise noted."],
  ["Do promotions apply to pricing?", "Yes. Current offers are already reflected in the prices shown, with the regular price struck through next to any reduced price."],
  ["Are consultations included in the pricing?", "Yes, consultations are free. This lets your provider assess your needs and tailor the treatment plan before confirming your final price."],
  ["Is financing available for treatments?", "Yes. We offer flexible payment plans through Affirm for Canadian citizens and residents aged 19 and over, with a minimum $500 purchase."],
];

/**
 * The treatments and categories of the price list whose offer pills keep the fire (user, 2026-11-26), so they stand out;
 * every other pill of the list has a plain red half with the small flame icon. Matched by name, without regard to case,
 * dashes or spacing (`isFiery`).
 */
export const PRICE_FIRE = [
  "Bio-Stimulator – Radiesse",
  "Bio-Stimulator – Sculptra",
  "Lip Enhancement",
  "Microneedling with PRP - Face",
  "PRP Hair Restoration",
  "Standard Contour Areas",
  "Chemical Peel",
  "Laser Hair Removal",
  "PRP Scalp",
];
const fireKey = (s: string) => s.toLowerCase().replace(/[\u2010-\u2015-]/g, "-").replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").trim();
const FIRE_KEYS = new Set(PRICE_FIRE.map(fireKey));
/** Whether one of these names (a treatment, its category) is on the fire list. */
export const isFiery = (...names: (string | null | undefined)[]) => names.some((n) => !!n && FIRE_KEYS.has(fireKey(n)));

/** Words of the Exclusive monthly specials above the price list. Which treatments its cards show is kept in WooCommerce and managed at /manage/pricing; their prices are read from WooCommerce. */
export const PRICE_SPECIALS = {
  sub: "Save on cosmetic treatment, apply for financing now",
  note: "for selected packages",
};
