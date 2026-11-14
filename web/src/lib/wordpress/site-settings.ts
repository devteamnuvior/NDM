import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPSiteSettings } from "@/types/site-settings";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * Site Settings (the header and footer settings of WordPress's "Site Settings" screen), through the
 * ndm-headless plugin's route. Cached; WordPress clears it the moment the settings are saved.
 */

/** The saved settings, or null when they were never saved. */
export async function getSiteSettingsRaw(): Promise<WPSiteSettings | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.siteSettings);

  try {
    return (await wpFetch<WPSiteSettings>("ndm/v1/site-settings")).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
