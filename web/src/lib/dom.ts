/**
 * The element with this id on the page being shown. After an in-site navigation the framework can keep the
 * pages you came from in the document, hidden, so two elements may carry the same id (two pages with a
 * "results" section): this returns the one that is rendered, and falls back to the first.
 */
export function byId(id: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  for (const el of all) if (el.getClientRects().length) return el;
  return all[0] ?? null;
}
