import "server-only";
import { PRICE_NAMES } from "@/config/price-names";
import { createPriceBook, formatPrice, type LowestPrice, type PriceBook } from "@/lib/price-book";
import { toCategories } from "@/lib/pricing-view";
import { getPricingTree, settle } from "@/lib/wordpress";

/**
 * The one source of every price the site shows: the products of WooCommerce (the price list managed at
 * /manage/pricing). No price is ever typed into this site or into a WordPress text field. When
 * WooCommerce cannot be reached, or a treatment has no product, there is no price to show: callers
 * leave the price out, they never fall back to a written one.
 */
export interface SitePrices {
  /** The price list as WooCommerce holds it (category id = the WooCommerce category's slug). */
  categories: ReturnType<typeof toCategories>;
  book: PriceBook;
}

/** The price list from WooCommerce with its helpers; null when WooCommerce cannot be reached. */
export async function getSitePrices(): Promise<SitePrices | null> {
  const read = await settle(getPricingTree);
  if (!read.ok) {
    console.error("[prices] the price list could not be read from WooCommerce:", read.error.message);
    return null;
  }
  const categories = toCategories(read.data);
  return { categories, book: createPriceBook(categories, PRICE_NAMES) };
}

/** "From $262.50" (" / unit" for products priced per unit); empty when there is no price. */
export const fromText = (low: LowestPrice | null | undefined): string => (low ? `From ${formatPrice(low.value)}${low.unit}` : "");

/** The same with the unit spelled out where the price is per session or per syringe: "From $140 per session". */
export const fromTextLong = (low: LowestPrice | null | undefined): string => (low ? `From ${formatPrice(low.value)}${low.unit || (low.per ? ` ${low.per}` : "")}` : "");

/**
 * The lowest price of what an editor picked in WordPress ("category:<slug>" or "product:<id>"), with
 * the category it sits in. Null when nothing was picked or it is no longer on the price list.
 */
export function lowestOfSource(prices: SitePrices, source: string): (LowestPrice & { categoryId: string }) | null {
  const [kind, value] = source.split(":");
  if (kind === "category") {
    const low = prices.book.lowestPrice(value);
    return low ? { ...low, categoryId: value } : null;
  }
  if (kind === "product") {
    for (const category of prices.categories) {
      const item = category.items.find((it) => it.id === Number(value));
      if (!item) continue;
      const low = createPriceBook([{ ...category, items: [item] }]).lowestPrice(category.id);
      return low ? { ...low, categoryId: category.id } : null;
    }
  }
  return null;
}

/**
 * Writes prices into a sentence of the page's copy: `{{name}}` is replaced by `values[name]`. A
 * sentence whose price is not known is left out, so the copy never shows a price that is not
 * WooCommerce's. Returns "" when nothing is left.
 */
export function fillPrices(text: string, values: Record<string, string | undefined>): string {
  if (!text.includes("{{")) return text;
  return text
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) => {
      let known = true;
      const out = sentence.replace(/\{\{([\w-]+)\}\}/g, (_all, key: string) => {
        const value = values[key];
        if (!value) known = false;
        return value ?? "";
      });
      return known ? [out] : [];
    })
    .join(" ");
}

/** `fillPrices` over every text of a page's content; a paragraph left empty is dropped from its list. */
export function fillPricesDeep<T>(content: T, values: Record<string, string | undefined>): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return fillPrices(v, values);
    if (Array.isArray(v)) {
      const marked = v.map((x) => typeof x === "string" && x.includes("{{"));
      return v.map(walk).filter((x, i) => !(marked[i] && x === "" && v.length > 2));
    }
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(content) as T;
}
