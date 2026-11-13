import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPProcedure, WPProcedureSummary } from "@/types/procedure";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The procedure pages (the post type "Procedures"), through the ndm-headless plugin's routes. Cached;
 * WordPress clears it the moment a procedure changes.
 */

/** Every published procedure: its name and its address on the site. */
export async function getProcedureList(): Promise<WPProcedureSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.procedures);

  return (await wpFetch<WPProcedureSummary[]>("ndm/v1/procedures")).data;
}

/** The published procedure at this address, or null when there is none. */
export async function getProcedure(slug: string): Promise<WPProcedure | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.procedures);

  try {
    return (await wpFetch<WPProcedure>(`ndm/v1/procedures/${slug}`)).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
