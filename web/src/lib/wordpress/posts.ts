import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPCollection, WPListQuery, WPPost } from "@/types/wordpress";
import { fetchBySlug, fetchCollection } from "./content";
import { WP_TAGS } from "./tags";

const PATH = "wp/v2/posts";
const LIST_FIELDS = ["id", "slug", "status", "type", "date", "date_gmt", "modified", "modified_gmt", "link", "title", "excerpt", "featured_media", "categories", "tags", "sticky"] as const;
const ENTRY_FIELDS = [...LIST_FIELDS, "content"] as const;

export interface PostsQuery extends WPListQuery {
  categories?: number[];
  tags?: number[];
}

/** A post in a list: everything but its body. */
export type WPPostSummary = Omit<WPPost, "content">;

/** One page of published posts, newest first unless the query says otherwise. Cached, refreshed by tag. */
export async function getPosts(query: PostsQuery = {}): Promise<WPCollection<WPPostSummary>> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.type("posts"));

  const { categories, tags, ...list } = query;
  return fetchCollection<WPPostSummary>(PATH, { ...list, fields: LIST_FIELDS, filters: { categories, tags } });
}

/** The published post with this slug, or null. Cached, refreshed by tag. */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.type("posts"), WP_TAGS.entry("posts", slug));

  return fetchBySlug<WPPost>(PATH, slug, ENTRY_FIELDS);
}
