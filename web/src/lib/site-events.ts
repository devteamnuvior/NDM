/**
 * Small page-wide signals between sections and the site header, so a section never has to reach into
 * the header's state. Browser only.
 */
export const OPEN_SEARCH_EVENT = "ndm:open-search";

/** Opens the site search overlay (owned by the header). */
export function openSearch(): void {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}
