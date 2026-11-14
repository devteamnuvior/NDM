/** Pricing page content. Prices themselves live in config/prices.ts. */

export const PRICE_FAQS: [question: string, answer: string][] = [
  ["How do I check the price of a treatment?", "Open a category in the price list, then any treatment with the + button. Each one shows its sessions, packages and current offers."],
  ["Are the prices the same at all locations?", "Yes. The listed prices and promotions apply across all our clinic locations unless otherwise noted."],
  ["Do promotions apply to pricing?", "Yes. Current offers are already reflected in the prices shown, with the regular price struck through next to any reduced price."],
  ["Are consultations included in the pricing?", "Yes, consultations are free. This lets your provider assess your needs and tailor the treatment plan before confirming your final price."],
  ["Is financing available for treatments?", "Yes. We offer flexible payment plans through Affirm for Canadian citizens and residents aged 19 and over, with a minimum $500 purchase."],
];

/**
 * Exclusive monthly specials shown above the price list: the twelve treatments the designer picked. Their prices are read from WooCommerce; `category` is the price-list category the Buy button opens.
 */
export const PRICE_SPECIALS = {
  sub: "Save on cosmetic treatment, apply for financing now",
  note: "for selected packages",
  items: [
    { name: "Botox", category: "botox-dysport" },
    { name: "Lip Augmentation", category: "dermal-fillers" },
    { name: "Laser Hair Removal", category: "laser-hair-removal" },
    { name: "Lip Filler", category: "dermal-fillers" },
    { name: "Microneedling", category: "microneedling" },
    { name: "Chemical Peel", category: "chemical-peel" },
    { name: "CoolSculpting", category: "coolsculpting-tight-sculpting" },
    { name: "Sculptra", category: "skin-booster-and-bio-stimulators" },
    { name: "Laser Skin Resurfacing", category: "laser-skin-resurfacing" },
    { name: "Photo Rejuvenation", category: "photo-rejuvenation" },
    { name: "PRP Hair Restoration", category: "hair-loss" },
    { name: "PRP Face", category: "microneedling" },
  ],
};
