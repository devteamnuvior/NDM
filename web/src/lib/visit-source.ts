/**
 * Where this visit came from (Black Friday brief, 2026-11-25, Tasks 05 and 07): the utm values of the link that
 * opened the site (utm_source=mailchimp, sms, meta...), kept for the rest of the visit in sessionStorage, so a
 * booking or a sale event made pages later still names its channel. A later link with utm values replaces them.
 * Only these five short values are kept, never anything about the visitor. Browser only.
 */

const KEY = "ndm-visit-source";
const SEARCH_KEY = "ndm-visit-search";
const FIELDS = ["source", "medium", "campaign", "content", "term"] as const;

export type VisitSource = Partial<Record<(typeof FIELDS)[number], string>>;

/** Reads the address's utm values, if it has any, and keeps them for the visit. Call once per page load. */
export function rememberVisitSource(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const found: VisitSource = {};
    for (const f of FIELDS) {
      const v = (q.get(`utm_${f}`) ?? "").trim().slice(0, 100);
      if (v && /^[\w\-.~+ ]+$/.test(v)) found[f] = v;
    }
    if (Object.keys(found).length) window.sessionStorage.setItem(KEY, JSON.stringify(found));
    /* the first page of the visit: whether a search engine sent it (later pages are referred by this site) */
    if (window.sessionStorage.getItem(SEARCH_KEY) === null) {
      let search = false;
      try {
        search = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia)\./i.test(new URL(document.referrer).hostname);
      } catch {
        /* no referrer */
      }
      window.sessionStorage.setItem(SEARCH_KEY, search ? "1" : "0");
    }
  } catch {
    /* storage blocked: the visit simply has no source */
  }
}

/** The utm values kept for this visit; empty when it had none. */
export function visitSource(): VisitSource {
  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}");
    if (!saved || typeof saved !== "object") return {};
    const out: VisitSource = {};
    for (const f of FIELDS) {
      const v = (saved as Record<string, unknown>)[f];
      if (typeof v === "string" && v) out[f] = v;
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * The channel in the brief's words: Mailchimp, SMS and Meta ads by utm_source, else "search" when a search
 * engine sent the visit, else "direct" (other sites count as direct too).
 */
export function visitChannel(): string {
  const s = (visitSource().source ?? "").toLowerCase();
  if (s === "mailchimp") return "mailchimp";
  if (s === "sms") return "sms";
  if (s === "meta" || s === "facebook" || s === "instagram") return "meta";
  if (s) return s;
  try {
    if (window.sessionStorage.getItem(SEARCH_KEY) === "1") return "search";
  } catch {
    /* storage blocked */
  }
  return "direct";
}
