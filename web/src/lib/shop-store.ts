import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SHOP_CART_URL, SHOP_ORIGIN, SHOP_URL } from "@/config/shop";
import { alsoLike, sameLine } from "@/lib/shop-related";
import type { ShopCard, ShopCatalog, ShopFacet, ShopFacetId, ShopImage, ShopProduct } from "@/types/shop";

/**
 * The online skincare shop (shop.newdermamedlaserclinic.com, a WooCommerce store of its own) read through
 * its public Store API, at request time and cached: names, brands, categories, sizes, prices, sale prices,
 * stock and photos all come from the shop. No price is typed on this site. Nothing here writes to the shop.
 */

const API = `${SHOP_ORIGIN}/wp-json/wc/store/v1/products`;
const PER_PAGE = 100;
const TIMEOUT_MS = 12_000;
/** The shop's "New Arrivals": products published in the last 30 days. */
const NEW_DAYS = 30;
/** A category the shop keeps for products without one; its own filter leaves it out too. */
const HIDDEN_CATEGORIES = new Set(["Uncategorized"]);

interface StoreTerm {
  name: string;
}
interface StoreAttribute {
  name: string;
  terms: StoreTerm[];
}
interface StoreProduct {
  id: number;
  slug: string;
  sku?: string;
  description?: string;
  name: string;
  permalink: string;
  short_description: string;
  prices: { price: string; regular_price: string; currency_minor_unit: number };
  images: { src: string; thumbnail: string; srcset: string }[];
  categories: StoreTerm[];
  brands?: StoreTerm[];
  attributes: StoreAttribute[];
  is_in_stock: boolean;
  is_purchasable: boolean;
  type: string;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#038": "&",
  "#039": "'",
  "#8217": "’",
  "#8216": "‘",
  "#8220": "“",
  "#8221": "”",
};
/** WordPress text as plain text: tags out, entities read, dashes as commas (the site never shows an em dash). */
function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#?\w+);/g, (m, k: string) => ENTITIES[k] ?? (/^#\d+$/.test(k) ? String.fromCharCode(Number(k.slice(1))) : m))
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

/** One page of the product list; a dropped connection is tried once more before giving up. */
async function storeGet(query: Record<string, string>, retry = true): Promise<{ list: StoreProduct[]; pages: number }> {
  try {
    return await storeGetOnce(query);
  } catch (error) {
    if (!retry) throw error;
    return storeGet(query, false);
  }
}

async function storeGetOnce(query: Record<string, string>): Promise<{ list: StoreProduct[]; pages: number }> {
  const url = `${API}?${new URLSearchParams(query)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NewDermaMed website (shop page)",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`The shop answered ${res.status}`);
  const list = (await res.json()) as StoreProduct[];
  if (!Array.isArray(list)) throw new Error("The shop answered with something that is not a product list");
  return { list, pages: Number(res.headers.get("x-wp-totalpages")) || 1 };
}

/** Every product, newest first (the shop's own order of publication). */
async function allProducts(query: Record<string, string> = {}): Promise<StoreProduct[]> {
  const base = {
    per_page: String(PER_PAGE),
    orderby: "date",
    order: "desc",
    ...query,
  };
  const first = await storeGet({ ...base, page: "1" });
  const rest = await Promise.all(Array.from({ length: Math.max(0, Math.min(first.pages, 10) - 1) }, (_, i) => storeGet({ ...base, page: String(i + 2) })));
  return [first, ...rest].flatMap((p) => p.list);
}

/** The square sizes WordPress made of a product photo, 300 to 1024px: the shop's photos are 2000px PNGs (transparent, shown on white). */
function toImage(img: StoreProduct["images"][number]): ShopImage {
  const sizes = img.srcset
    .split(",")
    .map((s) => s.trim().split(/\s+/))
    .filter(([u, w]) => u && /^\d+w$/.test(w ?? "") && parseInt(w, 10) <= 1024 && parseInt(w, 10) >= 300)
    .sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10));
  const mid = sizes.find(([, w]) => parseInt(w, 10) >= 600)?.[0];
  return { src: mid ?? img.thumbnail ?? img.src, srcSet: sizes.map(([u, w]) => `${u} ${w}`).join(", "), large: sizes.at(-1)?.[0] ?? img.src };
}

/** The store's description as plain paragraphs (one blank line between them). */
const paragraphs = (html: string) =>
  html
    .split(/<\/p>|<br\s*\/?>|\n{2,}/i)
    .map(plain)
    .filter(Boolean)
    .join("\n\n");

const terms = (p: StoreProduct, name: string) => p.attributes.find((a) => a.name === name)?.terms.map((t) => plain(t.name)) ?? [];
const cents = (value: string, unit: number) => Math.round((Number(value) || 0) * 10 ** (2 - unit));

function toProduct(p: StoreProduct, newest: number, fresh: Set<number>): ShopProduct {
  const unit = p.prices.currency_minor_unit ?? 2;
  const price = cents(p.prices.price, unit);
  const regular = Math.max(cents(p.prices.regular_price, unit), price);
  const gallery = p.images.map(toImage);
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku ?? "",
    name: plain(p.name),
    link: p.permalink,
    addToCart: `${SHOP_CART_URL}?add-to-cart=${p.id}`,
    brand: plain(p.brands?.[0]?.name ?? ""),
    categories: p.categories.map((c) => plain(c.name)).filter((c) => !HIDDEN_CATEGORIES.has(c)),
    /* the shop splits "4 x 5,5 ml" at its comma: put it back together */
    size: terms(p, "Size").join(","),
    text: plain(p.short_description),
    price,
    regular,
    onSale: regular > price,
    inStock: p.is_in_stock,
    isNew: fresh.has(p.id),
    newest,
    image: gallery[0] ?? null,
    image2: gallery[1] ?? null,
    gallery,
    description: paragraphs(p.description ?? ""),
    line: terms(p, "Product Line")[0] ?? "",
    concerns: terms(p, "Concerns"),
    skinTypes: terms(p, "Skin Type"),
    ingredients: terms(p, "Ingredient"),
    productTypes: terms(p, "Product Type"),
    areas: terms(p, "Application Area"),
  };
}

const FACETS: [id: ShopFacetId, label: string, pick: (p: ShopCard) => string[]][] = [
  ["brand", "Brand", (p) => (p.brand ? [p.brand] : [])],
  ["category", "Category", (p) => p.categories],
  ["concern", "Concern", (p) => p.concerns],
  ["skin", "Skin type", (p) => p.skinTypes],
  ["type", "Product type", (p) => p.productTypes],
  ["area", "Area", (p) => p.areas],
  ["ingredient", "Ingredient", (p) => p.ingredients],
];

/** Each filter's options, A to Z, with how many products carry each. */
export function shopFacets(products: ShopCard[]): ShopFacet[] {
  return FACETS.map(([id, label, pick]) => {
    const counts = new Map<string, number>();
    for (const p of products) for (const v of new Set(pick(p))) counts.set(v, (counts.get(v) ?? 0) + 1);
    return {
      id,
      label,
      options: [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value)),
    };
  }).filter((f) => f.options.length > 0);
}

/** The shop's products, cached for 15 minutes (the shop cannot tell this site when it changes). Throws when the shop cannot be read, so a failure is never kept. */
async function readCatalog(): Promise<ShopProduct[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 86_400 });
  cacheTag("shop");

  const since = new Date(Date.now() - NEW_DAYS * 86_400_000).toISOString().slice(0, 19);
  const [list, fresh] = await Promise.all([allProducts(), allProducts({ after: since }).catch(() => [])]);
  const freshIds = new Set(fresh.map((p) => p.id));
  const products = list.map((p, i) => toProduct(p, i, freshIds)).filter((p) => p.name && p.price > 0);
  if (!products.length) throw new Error("The shop answered with no products");
  return products;
}

/** A product without its long text and photos, for cards. */
export function toCard(p: ShopProduct): ShopCard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- left out on purpose
  const { description, gallery, ...card } = p;
  return card;
}

/** One product with every detail for its page, the rest of its product line ("Complete the routine") and products that share its concerns ("You may also like"); null when the store has no such product or cannot be read. */
export async function getShopProduct(slug: string): Promise<{ product: ShopProduct; line: ShopCard[]; related: ShopCard[]; all: ShopCard[] } | null> {
  try {
    const products = await readCatalog();
    const product = products.find((p) => p.slug === slug);
    if (!product) return null;
    const all = products.map(toCard);
    const line = sameLine(product, all);
    return { product, line, related: alsoLike(product, all, line), all };
  } catch (error) {
    console.error("[shop] a product could not be read:", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Every product slug, for the product pages built ahead (an empty list when the store cannot be read). */
export async function getShopSlugs(): Promise<string[]> {
  try {
    return (await readCatalog()).map((p) => p.slug);
  } catch {
    return [];
  }
}

/** The catalogue for /shop; `ok` is false when the shop could not be read (the page then points to the shop itself). */
export async function getShopCatalog(): Promise<ShopCatalog> {
  try {
    const products = (await readCatalog()).map(toCard);
    return {
      ok: true,
      products,
      facets: shopFacets(products),
      storeUrl: SHOP_URL,
      cartUrl: SHOP_CART_URL,
    };
  } catch (error) {
    console.error("[shop] the product list could not be read:", error instanceof Error ? `${error.message}${error.cause ? ` (${String((error.cause as Error).message ?? error.cause)})` : ""}` : error);
    return {
      ok: false,
      products: [],
      facets: [],
      storeUrl: SHOP_URL,
      cartUrl: SHOP_CART_URL,
    };
  }
}
