import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPAboutPage } from "@/types/about";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The About page (the one post of the post type "About Page"), through the ndm-headless plugin's
 * route. Cached; WordPress clears it the moment the page changes.
 */

/** The published About page, or null when it is not published. */
export async function getAboutPage(): Promise<WPAboutPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.about);

  try {
    return (await wpFetch<WPAboutPage>("ndm/v1/about-page")).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
