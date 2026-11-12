import "server-only";

/**
 * Cache tags of WordPress content. A cached read is labelled with them, so a later "content changed"
 * signal from WordPress can refresh exactly what changed (`revalidateTag`), without a rebuild.
 */
export const WP_TAGS = {
  /** Everything read from WordPress. */
  all: "wp",
  /** Every entry of one content type: "wp:posts". */
  type: (type: string) => `wp:${type}`,
  /** The price list read from WooCommerce (the Pricing page). */
  pricing: "pricing",
  /** One entry: "wp:posts:what-causes-rosacea-redness". */
  entry: (type: string, slug: string) => `wp:${type}:${slug}`,
} as const;
