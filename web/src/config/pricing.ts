/** Pricing page content. Prices themselves live in config/prices.ts. */

export const PRICE_FAQS: [question: string, answer: string][] = [
  ["How do I check the price of a treatment?", "Open a category in the price list, then any treatment with the + button. Each one shows its sessions, packages and current offers."],
  ["Are the prices the same at all locations?", "Yes. The listed prices and promotions apply across all our clinic locations unless otherwise noted."],
  ["Do promotions apply to pricing?", "Yes. Current offers are already reflected in the prices shown, with the regular price struck through next to any reduced price."],
  ["Are consultations included in the pricing?", "Yes, consultations are free. This lets your provider assess your needs and tailor the treatment plan before confirming your final price."],
  ["Is financing available for treatments?", "Yes. We offer flexible payment plans through Affirm for Canadian citizens and residents aged 19 and over, with a minimum $500 purchase."],
];

/**
 * Exclusive monthly specials shown above the price list. `price` is only used when the treatment is not on
 * the price list; `category` is the price-list category the Buy button opens.
 */
export const PRICE_SPECIALS = {
  sub: "Save on cosmetic treatment, apply for financing now",
  note: "for selected packages",
  items: [
    { name: "Microneedling", price: "$249", category: "microneedling" },
    { name: "Radiesse for Hand", price: "$599", category: "skin-booster-and-bio-stimulators" },
    { name: "PRP Hair Rejuvenation", price: "$399", category: "hair-loss" },
    { name: "Non-Surgical BBL", price: "$3999", category: "non-surgical-butt-lift" },
    { name: "Lip Filler", price: "$299", category: "dermal-fillers" },
    { name: "Sculptra Face Lift", price: "$699", category: "skin-booster-and-bio-stimulators" },
    { name: "Sculptra", price: "$699", category: "skin-booster-and-bio-stimulators" },
    { name: "Radiesse", price: "$599", category: "skin-booster-and-bio-stimulators" },
  ],
};
