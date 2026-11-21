import { connection } from "next/server";
import { popularSearches } from "@/lib/search";
import type { PopularAnswer } from "@/types/search";

/**
 * GET /api/search/popular: the Popular chips of the search sheet, from the searches WordPress has
 * counted (the list itself is cached for a few minutes in lib/wordpress/search.ts).
 */
export async function GET() {
  await connection();
  const answer: PopularAnswer = { terms: await popularSearches() };
  return Response.json(answer, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
