/**
 * Shapes of the WordPress REST API answers this site reads. Only the fields the site uses are listed:
 * requests ask for them with `_fields`, so an answer never carries more than these types describe.
 */

/** A text field WordPress returns both raw (signed-in only) and as HTML. */
export interface WPRendered {
  rendered: string;
  /** Only present for signed-in requests with edit rights. */
  raw?: string;
  protected?: boolean;
}

export type WPStatus = "publish" | "future" | "draft" | "pending" | "private";

/** What every post-like entry (post, page, later any custom post type) has in common. */
export interface WPEntry {
  id: number;
  slug: string;
  status: WPStatus;
  /** Site-local time, ISO 8601 without a zone. */
  date: string;
  /** UTC, ISO 8601 without a zone. */
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  /** Address of the entry on the WordPress host (which redirects to this site). */
  link: string;
  title: WPRendered;
}

export interface WPPost extends WPEntry {
  type: "post";
  content: WPRendered;
  excerpt: WPRendered;
  /** Media id of the featured image, 0 when there is none. */
  featured_media: number;
  categories: number[];
  tags: number[];
  sticky: boolean;
}

export interface WPPage extends WPEntry {
  type: "page";
  content: WPRendered;
  excerpt: WPRendered;
  featured_media: number;
  /** Parent page id, 0 for a top-level page. */
  parent: number;
  menu_order: number;
}

/** A category or tag. */
export interface WPTerm {
  id: number;
  slug: string;
  name: string;
  description: string;
  taxonomy: string;
  count: number;
  parent?: number;
}

export interface WPMediaSize {
  source_url: string;
  width: number;
  height: number;
  mime_type: string;
}

export interface WPMedia {
  id: number;
  slug: string;
  source_url: string;
  alt_text: string;
  mime_type: string;
  media_details: {
    width?: number;
    height?: number;
    sizes?: Record<string, WPMediaSize>;
  };
}

/** The error body WordPress sends with a 4xx or 5xx answer. */
export interface WPRestError {
  code: string;
  message: string;
  data?: { status?: number; [key: string]: unknown };
}

/** Answer of the site's own `ndm/v1/health` endpoint. */
export interface WPHealth {
  status: "ok";
  environment: "local" | "development" | "staging" | "production";
  time: string;
}

/** Query options every WordPress collection accepts. */
export interface WPListQuery {
  /** 1-based. */
  page?: number;
  /** 1 to 100 (WordPress's own limit). */
  perPage?: number;
  search?: string;
  slug?: string | string[];
  include?: number[];
  exclude?: number[];
  order?: "asc" | "desc";
  orderby?: string;
}

/** One page of a collection, with the totals WordPress reports in its headers. */
export interface WPCollection<T> {
  items: T[];
  /** All matching entries across every page. */
  total: number;
  totalPages: number;
  page: number;
}
