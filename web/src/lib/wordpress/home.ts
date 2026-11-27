import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPHomePage } from "@/types/home";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The home page: the WordPress page chosen under Settings > Reading > "Your homepage displays", through
 * the ndm-headless plugin's route. Cached; WordPress clears it the moment the page, its words or the
 * Reading setting change.
 */

/**
 * The home page's words, or null when WordPress has none to give: no page chosen as the homepage, the
 * page missing or not published, or no words saved on it (the reason is logged).
 */
export async function getHomePage(): Promise<WPHomePage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.home);

  try {
    return (await wpFetch<WPHomePage>("ndm/v1/home-page")).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) {
      console.warn(`[home] WordPress has no home page to show (${error.code ?? "404"}): the built-in copy is used.`, error.message);
      return null;
    }
    throw error;
  }
}
