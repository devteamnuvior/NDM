import { PRICE_CATEGORIES, PRICE_NAMES } from "@/config/prices";
import { createPriceBook } from "@/lib/price-book";

/**
 * Price helpers: one way to read the price list for the whole site, so a card on the home page always
 * shows the same number as the pricing page. Server-side by design: import it from Server Components and
 * pass the resulting text down, so the price list is not shipped to the browser.
 */
export { createPriceBook, formatPrice, rowsFrom, rowsPercent, type LowestPrice, type PriceBook } from "@/lib/price-book";

/** The helpers over the site's built-in price list (every page except Pricing, which reads WooCommerce). */
export const { lowestPrice, priceFor, priceInfo, priceRows } = createPriceBook(PRICE_CATEGORIES, PRICE_NAMES);
