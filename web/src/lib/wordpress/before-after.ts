import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPBeforeAfter } from "@/types/before-after";
import { wpFetch } from "./client";
import { WP_TAGS } from "./tags";

/**
 * The Before & After page and its cases (the post type "Before & After" with its taxonomy "Category"),
 * through the ndm-headless plugin's route. Cached; WordPress clears it the moment a case, a category
 * or the page changes.
 */
export async function getBeforeAfter(): Promise<WPBeforeAfter> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.beforeAfter, WP_TAGS.type("pages"));

  return (await wpFetch<WPBeforeAfter>("ndm/v1/before-after")).data;
}
