import { SEARCH_ENTRIES } from "@/config/navigation";
import { resolveLabel } from "@/lib/routes";
import type { SearchHit } from "@/types/search";

/**
 * The matching rules of the site search, shared by the search sheet (which shows the menu's own
 * entries at once, while it waits for the server) and the server (which adds the price list in
 * WooCommerce). No data of its own beyond the menu.
 */

export const SEARCH_LIMIT = 8;
/** Rows kept free for the price list when the menu alone would fill the sheet. */
const CATALOGUE_ROWS = 3;
export const SEARCH_MAX_QUERY = 60;

/** A search as it is compared: trimmed, lower case, without ® and ™. */
export const searchKey = (text: string): string => text.replace(/[®™]/g, "").trim().toLowerCase();

const isPlaceholder = (hit: SearchHit): boolean => hit.href.startsWith("#/");

/** The menu's treatments and concerns that match, in menu order. */
export function menuHits(query: string): SearchHit[] {
  const v = query.trim().toLowerCase();
  if (!v) return [];
  return SEARCH_ENTRIES.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(v)).map((t) => ({ name: t.name, category: t.category, href: resolveLabel(t.name).href }));
}

/**
 * Menu entries first, then the price list. An entry found in both shows once: the price list's when the
 * menu's page does not exist yet (so the row leads somewhere), else the menu's.
 */
export function mergeHits(menu: SearchHit[], catalogue: SearchHit[]): SearchHit[] {
  const inCatalogue = new Set(catalogue.map((h) => searchKey(h.name)));
  const inMenu = new Set(menu.filter((h) => !isPlaceholder(h)).map((h) => searchKey(h.name)));
  const first = menu.filter((h) => !(isPlaceholder(h) && inCatalogue.has(searchKey(h.name))));
  const second = catalogue.filter((h) => !inMenu.has(searchKey(h.name)));
  const kept = first.slice(0, SEARCH_LIMIT - Math.min(CATALOGUE_ROWS, second.length));
  return [...kept, ...second].slice(0, SEARCH_LIMIT);
}
