import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPVipSalePage } from "@/types/vip-sale";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The VIP Sale page (the standard WordPress page with the template "VIP Sale page"), through the
 * ndm-headless plugin's route. Cached; WordPress clears it the moment the page changes.
 */

/** The published VIP Sale page, or null when WordPress has no such page or it is not published. */
export async function getVipSalePage(): Promise<WPVipSalePage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.vipSale);

  try {
    return (await wpFetch<WPVipSalePage>("ndm/v1/vip-sale-page")).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
