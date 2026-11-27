import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { WPCollection, WPListQuery, WPPage } from "@/types/wordpress";
import { fetchBySlug, fetchCollection } from "./content";
import { WP_TAGS } from "./tags";

const PATH = "wp/v2/pages";
const LIST_FIELDS = ["id", "slug", "status", "type", "date", "date_gmt", "modified", "modified_gmt", "link", "title", "excerpt", "featured_media", "parent", "menu_order"] as const;
const ENTRY_FIELDS = [...LIST_FIELDS, "content"] as const;

export interface PagesQuery extends WPListQuery {
  parent?: number;
}

/** A page in a list: everything but its body. */
export type WPPageSummary = Omit<WPPage, "content">;

/** One page of published WordPress pages. Cached, refreshed by tag. */
export async function getPages(query: PagesQuery = {}): Promise<WPCollection<WPPageSummary>> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.type("pages"));

  const { parent, ...list } = query;
  return fetchCollection<WPPageSummary>(PATH, { ...list, fields: LIST_FIELDS, filters: { parent } });
}

/** The published WordPress page with this slug, or null. Cached, refreshed by tag. */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.type("pages"), WP_TAGS.entry("pages", slug));

  return fetchBySlug<WPPage>(PATH, slug, ENTRY_FIELDS);
}
