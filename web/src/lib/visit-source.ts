/**
 * Where the visitor came from (user, 2026-11-25: "did this buyer come from Meta Ads?"), kept in this browser so an
 * order placed pages or days later still names it. Read at every page load; a visit that brings a new source (a link
 * with utm values, a Google Ads click, a search engine or another site) replaces the earlier one, a direct visit does
 * not (as Google Analytics counts it). Kept for 30 days. Only the channel is kept: the utm values, a search engine's
 * or other site's host name, and the first page of that visit. Never anything about the visitor. Browser only.
 */

const KEY = "ndm-visit-source";
const DAYS = 30;
const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex)\./i;

export interface VisitSource {
  /** WooCommerce's order attribution types: "utm" (a tagged link), "organic" (search), "referral" (another site), "typein" (direct). */
  type: "utm" | "organic" | "referral" | "typein";
  /** utm_source, or the search engine ("google"), or the other site's host ("instagram.com"). */
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** The other site's or search engine's host. */
  referrer?: string;
  /** The first page of that visit, as a path ("/black-friday"). */
  entry?: string;
  /** When it was kept (ms). */
  at: number;
}

const clean = (v: string | null | undefined, max = 100): string | undefined => {
  const s = (v ?? "").trim().slice(0, max);
  return s && /^[\w\-.~+ ]+$/.test(s) ? s : undefined;
};
/* a page path: the same characters plus "/" */
const cleanPath = (v: string): string | undefined => {
  const s = v.trim().slice(0, 200);
  return s.startsWith("/") && /^[\w\-.~+/]+$/.test(s) ? s : undefined;
};

/** What this page load says about the source; null for a direct visit or a page reached from this site. */
function sourceOfThisLoad(): Omit<VisitSource, "at"> | null {
  const q = new URLSearchParams(window.location.search);
  const entry = cleanPath(window.location.pathname);
  const utm = { source: clean(q.get("utm_source")), medium: clean(q.get("utm_medium")), campaign: clean(q.get("utm_campaign")), content: clean(q.get("utm_content")), term: clean(q.get("utm_term")) };
  if (utm.source) return { type: "utm", ...utm, entry };
  /* Google Ads' own tagging, when a link carries no utm values */
  if (q.get("gclid") || q.get("gbraid") || q.get("wbraid")) return { type: "utm", source: "google", medium: "cpc", entry };
  let host = "";
  try {
    host = new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (!host || host === window.location.hostname.replace(/^www\./, "")) return null;
  const engine = SEARCH.exec(host)?.[2]?.toLowerCase();
  if (engine) return { type: "organic", source: engine, referrer: clean(host), entry };
  return { type: "referral", source: clean(host), referrer: clean(host), entry };
}

/** Reads this page load's source and keeps it when it brings one. Call once per page load. */
export function rememberVisitSource(): void {
  try {
    const found = sourceOfThisLoad();
    if (found) window.localStorage.setItem(KEY, JSON.stringify({ ...found, at: Date.now() }));
  } catch {
    /* storage blocked: the visit counts as direct */
  }
}

/** The kept source, or a direct visit when there is none (or it is older than 30 days). */
export function visitSource(): VisitSource {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as VisitSource | null;
    if (saved && typeof saved.at === "number" && Date.now() - saved.at < DAYS * 864e5 && ["utm", "organic", "referral", "typein"].includes(saved.type)) return saved;
  } catch {
    /* storage blocked or not ours */
  }
  return { type: "typein", at: Date.now() };
}

/** The channel in a few words, for events: "meta", "google", "direct"... */
export function visitChannel(): string {
  const s = visitSource();
  if (s.type === "typein") return "direct";
  const src = (s.source ?? "").toLowerCase();
  if (/^(meta|facebook|fb|instagram|ig)$/.test(src) || /(facebook|instagram)\.com$/.test(src)) return "meta";
  return src || s.type;
}
