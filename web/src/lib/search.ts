import "server-only";
import { POPULAR_SEARCHES, SEARCH_ENTRIES } from "@/config/navigation";
import { pagePath } from "@/lib/routes";
import { menuHits, mergeHits, searchKey } from "@/lib/search-match";
import { getPopularSearchTerms, getPricingTree, isWordPressConfigured, settle } from "@/lib/wordpress";
import type { SearchHit } from "@/types/search";

/**
 * The site search on the server: the menu's entries plus the price list in WooCommerce (its
 * categories and treatments, exactly what the Pricing page shows). When WordPress cannot be reached
 * the search still answers, with the menu's entries only.
 */

const POPULAR_COUNT = 6;

/** Every category and treatment of the price list as a search result that opens it on the Pricing page. */
async function catalogue(): Promise<SearchHit[]> {
  if (!isWordPressConfigured()) return [];
  const tree = await settle(getPricingTree);
  if (!tree.ok) return [];
  return tree.data.categories.flatMap((c) => {
    /* the id of the category's heading in the price list (see PriceGroup) */
    const href = `${pagePath("pricing")}#pg-${c.slug}-h`;
    return [{ name: c.name, category: "Prices", href }, ...c.products.map((p) => ({ name: p.name, category: c.name, href }))];
  });
}

/** What the price list holds for this search: matching categories first, then matching treatments. */
export async function catalogueHits(query: string): Promise<SearchHit[]> {
  const v = searchKey(query);
  if (!v) return [];
  const all = (await catalogue()).filter((h) => searchKey(h.name).includes(v));
  return [...all.filter((h) => h.category === "Prices"), ...all.filter((h) => h.category !== "Prices")];
}

/** The rows the search sheet shows for this search. */
export async function searchSite(query: string): Promise<SearchHit[]> {
  return mergeHits(menuHits(query), await catalogueHits(query));
}

/**
 * The Popular chips: the results searched most (from WordPress), as long as they still exist on the
 * site, filled up with the clinic's own starting list while there are not enough yet.
 */
export async function popularSearches(): Promise<string[]> {
  const fallback = POPULAR_SEARCHES.slice(0, POPULAR_COUNT);
  if (!isWordPressConfigured()) return fallback;
  const counted = await settle(getPopularSearchTerms);
  if (!counted.ok || !counted.data.length) return fallback;

  const known = new Set([...SEARCH_ENTRIES.map((e) => searchKey(e.name)), ...(await catalogue()).map((h) => searchKey(h.name))]);
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const term of [...counted.data.filter((t) => known.has(searchKey(t))), ...fallback]) {
    const key = searchKey(term);
    if (seen.has(key)) continue;
    seen.add(key);
    terms.push(term);
    if (terms.length === POPULAR_COUNT) break;
  }
  return terms;
}
