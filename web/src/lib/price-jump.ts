import { byId } from "@/lib/dom";
import { scrollToY } from "@/lib/smooth-scroll";

/** Ids of the price list's category headings look like "pg-<category slug>-h" (see PriceGroup). */
export const PRICE_GROUP_HASH = /^#pg-[a-z0-9-]+-h$/;

/**
 * Opens one category of the price list on the page being shown and scrolls to it. False when that
 * category is not on this page (another page is open, or the category is gone).
 */
export function jumpToPriceGroup(headId: string, immediate = false): boolean {
  const el = byId(headId);
  if (!el) return false;
  if (el.getAttribute("aria-expanded") !== "true") el.click();
  scrollToY(el.getBoundingClientRect().top + window.scrollY - 150, immediate);
  return true;
}
