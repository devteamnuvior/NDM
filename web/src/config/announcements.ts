import { ACTIONS } from "@/config/routes";
import { pagePath } from "@/lib/routes";

/** One rotating message in the announcement bar. `phones` is the built-in clinic phone numbers message. */
export type Announcement =
  | { id: string; kind: "message"; text: string; cta?: string; href: string; external?: boolean }
  | { id: string; kind: "phones" };

/** Wide screens (1024px and up): the sentence, then its link. */
export const ANNOUNCEMENTS_DESKTOP: Announcement[] = [
  { id: "offers", kind: "message", text: "New-patient offers this month, ", cta: "see current offers →", href: pagePath("promotion") },
  { id: "visia", kind: "message", text: "Complimentary VISIA® skin analysis with your consultation, ", cta: "book yours →", href: ACTIONS.book },
  { id: "plans", kind: "message", text: "Flexible payment plans. Start today, pay later, ", cta: "learn more →", href: ACTIONS.financing },
];

/** Phones and tablets: shorter messages, the whole line is the link. */
export const ANNOUNCEMENTS_MOBILE: Announcement[] = [
  { id: "offers", kind: "message", text: "New-patient offers this month ", cta: "→", href: pagePath("promotion") },
  { id: "visia", kind: "message", text: "Free VISIA® skin analysis, ", cta: "book →", href: ACTIONS.book },
  { id: "phones", kind: "phones" },
  { id: "plans", kind: "message", text: "Payment plans: start today, pay later →", href: ACTIONS.financing },
  { id: "shop", kind: "message", text: "Shop skincare online", href: ACTIONS.shop, external: true },
];

/** Time each message stays on screen. */
export const ANNOUNCEMENT_INTERVAL_MS = 4800;
