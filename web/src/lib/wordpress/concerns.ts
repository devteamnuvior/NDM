import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPConcern, WPConcernSummary } from "@/types/concern";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The concern pages (the post type "Concerns"), through the ndm-headless plugin's routes. Cached;
 * WordPress clears it the moment a concern changes.
 */

/** Every published concern: its name and its address on the site. */
export async function getConcernList(): Promise<WPConcernSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.concerns);

  return (await wpFetch<WPConcernSummary[]>("ndm/v1/concerns")).data;
}

/** The published concern at this address, or null when there is none. */
export async function getConcern(slug: string): Promise<WPConcern | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.concerns);

  try {
    return (await wpFetch<WPConcern>(`ndm/v1/concerns/${slug}`)).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
