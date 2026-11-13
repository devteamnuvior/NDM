import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPBlogList, WPBlogPost } from "@/types/blog";
import { wpFetch } from "./client";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The blog (WordPress's posts with their "Article page" fields), through the ndm-headless plugin's
 * routes. Cached; WordPress clears it the moment a post, its photo or a category changes.
 */

/** Every published post as a card, newest first. */
export async function getBlogList(): Promise<WPBlogList> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.blog);

  return (await wpFetch<WPBlogList>("ndm/v1/blog")).data;
}

/** The published post at this address with its text, or null when there is none (or it has no text). */
export async function getBlogPost(slug: string): Promise<WPBlogPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.blog);

  try {
    return (await wpFetch<WPBlogPost>(`ndm/v1/blog/${slug}`)).data;
  } catch (error) {
    if (error instanceof WordPressError && error.notFound) return null;
    throw error;
  }
}
