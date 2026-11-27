import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * Popular searches, kept by WordPress (the ndm-headless plugin's ndm/v1/search routes): one count per
 * result people found, never what they typed and never who they were.
 */

const PATH = "ndm/v1/search";

/** Names of the most searched results, most searched first. Cached for a few minutes. */
export async function getPopularSearchTerms(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(WP_TAGS.all, WP_TAGS.search);

  const { data } = await wpFetch<{ terms?: unknown }>(`${PATH}/popular`, { query: { limit: 30 } });
  return Array.isArray(data.terms) ? data.terms.filter((t): t is string => typeof t === "string") : [];
}

/** Counts one search for this result. Needs the secret the two servers share (REVALIDATE_SECRET). */
export async function logSearchTerm(label: string): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new WordPressError("config", "REVALIDATE_SECRET is not set: searches cannot be counted.", { path: `${PATH}/log` });
  }
  await wpFetch(`${PATH}/log`, { body: { label }, headers: { "X-NDM-Search-Key": secret }, timeoutMs: 4000 });
}
