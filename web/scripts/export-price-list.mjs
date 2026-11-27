/**
 * Prints the site's original price list (src/config/prices.ts) as JSON, for the one-time import into
 * WooCommerce:
 *
 *   node --experimental-strip-types scripts/export-price-list.mjs | (cd ../cms && docker compose run --rm -T cli wp ndm-pricing import)
 *
 * After the import WooCommerce is where prices are changed; this script is not part of the site.
 */
const { PRICE_CATEGORIES } = await import("../src/config/prices.ts");
process.stdout.write(JSON.stringify(PRICE_CATEGORIES));
