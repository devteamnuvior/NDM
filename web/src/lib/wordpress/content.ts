import "server-only";
import type { WPCollection, WPListQuery } from "@/types/wordpress";
import { wpFetch, type WPQueryValue } from "./client";

/**
 * The two reads every WordPress content type needs: one page of a collection, and one entry by its slug.
 * A content module (posts.ts, pages.ts, later one per new content type) names its REST path and the
 * fields it wants, and adds caching on top.
 */

const MAX_PER_PAGE = 100;

export interface CollectionRequest extends WPListQuery {
  /** Fields to ask for (`_fields`), so the answer carries nothing the site does not use. */
  fields: readonly string[];
  /** Filters of one content type, for example `{ categories: [3] }`. */
  filters?: Record<string, WPQueryValue>;
}

export async function fetchCollection<T>(path: string, request: CollectionRequest): Promise<WPCollection<T>> {
  const page = Math.max(1, Math.trunc(request.page ?? 1));
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Math.trunc(request.perPage ?? 10)));

  const { data, total, totalPages } = await wpFetch<T[]>(path, {
    query: {
      ...request.filters,
      page,
      per_page: perPage,
      search: request.search,
      slug: request.slug,
      include: request.include,
      exclude: request.exclude,
      order: request.order,
      orderby: request.orderby,
      _fields: request.fields,
    },
  });

  return { items: data, total: total ?? data.length, totalPages: totalPages ?? 1, page };
}

/** The published entry with this slug, or null when there is none. */
export async function fetchBySlug<T>(path: string, slug: string, fields: readonly string[]): Promise<T | null> {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  if (!clean) return null;
  const { data } = await wpFetch<T[]>(path, { query: { slug: clean, per_page: 1, _fields: fields } });
  return data[0] ?? null;
}
