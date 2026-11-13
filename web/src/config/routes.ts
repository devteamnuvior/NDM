/**
 * The one route table for the site.
 *
 * During the migration a page is either served by Next.js (`migrated: true`, clean URL) or still by the
 * original static prototype (its `.html` URL). Moving a page over is a one-line change here: set
 * `migrated: true` and give it its new path. Nothing else in the UI hard-codes a URL.
 */
export const PAGES = {
  home: { path: "/", migrated: true },
  pricing: { path: "/pricing", migrated: true },
  promotion: { path: "/promotion", migrated: true },
  about: { path: "/about", migrated: true },
  blog: { path: "/blog", migrated: true },
  article: { path: "/what-causes-rosacea-redness", migrated: true },
  botox: { path: "/botox", migrated: true },
  aptos: { path: "/aptos-thread-lift", migrated: true },
  wrinkles: { path: "/wrinkles-fine-lines", migrated: true },
  account: { path: "/account", migrated: true },
  cart: { path: "/cart", migrated: true },
  checkout: { path: "/checkout", migrated: true },
  orderConfirmed: { path: "/order-confirmed", migrated: true },
  beforeAfter: { path: "/before-after", migrated: true },
  blackFridaySale: { path: "/black-friday-sale", migrated: true },
  privacy: { path: "/privacy", migrated: true },
  terms: { path: "/terms", migrated: true },
  refunds: { path: "/refunds", migrated: true },
} as const satisfies Record<string, { path: string; migrated: boolean }>;

export type PageId = keyof typeof PAGES;

/** Menu label (as a slug) -> page. Labels without an entry are pages that do not exist yet. */
export const SLUG_TO_PAGE: Record<string, PageId> = {
  "policies-privacy-terms-refunds": "privacy",
  "privacy-policy": "privacy",
  privacy: "privacy",
  terms: "terms",
  "terms-of-service": "terms",
  refunds: "refunds",
  "refund-policy": "refunds",
  account: "account",
  "my-account": "account",
  "wrinkles-fine-lines": "wrinkles",
  "aptos-thread-lift": "aptos",
  "non-surgical-facelift-neck-jawline-eyebrow-nose-lift": "aptos",
  pricing: "pricing",
  promotion: "promotion",
  about: "about",
  "about-us": "about",
  "our-doctors-team": "about",
  "our-clinics": "about",
  "doctors-team": "about",
  "awards-recognition": "about",
  "contact-us": "about",
  blog: "blog",
  botox: "botox",
  "uptown-clinic": "about",
  "downtown-clinic": "about",
};

/** Placeholder targets the prototype uses for features that are not pages (or not built yet). */
export const ACTIONS = {
  book: "#/book",
  shop: "#/shop",
  financing: "#/financing",
} as const;
