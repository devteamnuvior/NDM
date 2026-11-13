import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPAptosPage, WPAptosSummary } from "@/types/aptos";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The pages of the Aptos design (the post type "Aptos Pages"), through the ndm-headless plugin's
 * routes. Cached; WordPress clears it the moment a page changes.
 */

/** Every published page of the Aptos design: its name and its address on the site. */
export async function getAptosList(): Promise<WPAptosSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.aptos);

  return (await wpFetch<WPAptosSummary[]>("ndm/v1/aptos-pages")).data;
}

/** The published page of the Aptos design at this address, or null when there is none. */
export async function getAptosPage(slug: string): Promise<WPAptosPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.aptos);

  try {
    return (await wpFetch<WPAptosPage>(`ndm/v1/aptos-pages/${slug}`)).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
