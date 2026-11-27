import { catalogueHits } from "@/lib/search";
import { SEARCH_MAX_QUERY } from "@/lib/search-match";
import type { SearchAnswer } from "@/types/search";

/**
 * GET /api/search?q=: what the price list in WooCommerce holds for this search (categories and
 * treatments, as the Pricing page shows them). The search sheet already has the menu's own entries and
 * merges these in. Nothing is counted here: see /api/search/log.
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, SEARCH_MAX_QUERY);
  const answer: SearchAnswer = { hits: q.trim().length >= 2 ? await catalogueHits(q) : [] };
  return Response.json(answer, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
