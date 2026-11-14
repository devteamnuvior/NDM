import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPAptosPage } from "@/types/aptos";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The Aptos Thread Lift page: a standard WordPress page (template "Aptos Thread Lift page"), through the
 * ndm-headless plugin's route. Cached; WordPress clears it the moment the page changes.
 */

/** The published Aptos page, or null when there is none (no such page, or not published). */
export async function getAptosPage(): Promise<WPAptosPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.aptos);

  try {
    return (await wpFetch<WPAptosPage>("ndm/v1/aptos-page")).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
