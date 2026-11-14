import type { PageId } from "@/config/routes";
import { SITE_SETTINGS } from "@/config/site-settings";
import type { NavSectionId, SearchEntry } from "@/types/navigation";

/** Which top-level section each page belongs to (the header marks it). */
export const PAGE_SECTION: Partial<Record<PageId, NavSectionId>> = {
  home: "home",
  pricing: "pricing",
  promotion: "promotion",
  about: "about",
  blog: "about",
  article: "about",
  botox: "procedures",
  aptos: "procedures",
  wrinkles: "concerns",
};

/**
 * Everything the search overlay can find: the built-in menu's treatments and concerns (Site Settings'
 * Menu tab changes the menu, not this list).
 */
export const SEARCH_ENTRIES: SearchEntry[] = [
  ...SITE_SETTINGS.menu.procedures.categories.flatMap((c) => c.groups.flatMap((g) => g.items.map((it) => ({ name: it.label, category: g.title || c.label })))),
  ...SITE_SETTINGS.menu.concerns.groups.flatMap((g) => g.items.map((it) => ({ name: it.label, category: "Concern" }))),
];

export const POPULAR_SEARCHES: string[] = [
  "Laser Hair Removal",
  "Dermal Fillers",
  "Microneedling",
  "VISIA® Skin Analysis",
  "CoolSculpting®",
  "Acne Scar",
];

/** Pages that open on a dark hero: their header starts in the dark tone, so it never flashes light first. */
export const DARK_START_PAGES: PageId[] = ["home", "pricing", "aptos", "botox", "wrinkles", "about"];

/** Pages where the first-visit offer pop-up never shows. */
export const NO_OFFER_PAGES: PageId[] = ["privacy", "terms", "refunds"];
