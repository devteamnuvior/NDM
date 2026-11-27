/**
 * What WooCommerce says now, for tests that check a price on a page: the tests never write a price down,
 * so they hold whether a sale campaign is running or not (a campaign changes prices, struck-through prices
 * and labels for its window; see cms/README.md, "Sale campaign").
 */

const WP = (process.env.WORDPRESS_API_URL ?? "http://localhost:8080/wp-json").replace(/\/+$/, "");

export interface ListedOption {
  productId: number;
  variationId: number;
  label: string;
  price: number;
  /** Struck-through price; 0 when the option is not on sale. */
  regular: number;
  /** The label on the option ("30% OFF"), or "". */
  tag: string;
}

interface Tree {
  campaign?: { code: string; phase: string | null } | null;
  categories: {
    slug: string;
    name: string;
    products: { id: number; name: string; variations: { id: number; label: string; price: string; regularPrice: string; onSale: boolean; promo: { text: string; enabled: boolean } | null }[] }[];
  }[];
}

let tree: Promise<Tree> | undefined;
const read = (): Promise<Tree> => (tree ??= fetch(`${WP}/ndm/v1/pricing`).then((r) => r.json() as Promise<Tree>));

/** "$1050", "$262.50": as the site writes a price (cents only when there are any, no thousands separator). */
export const money = (n: number): string => `$${n.toLocaleString("en-CA", { useGrouping: false, minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** The options of a treatment on the public price list, in its order. */
export async function optionsOf(product: string): Promise<ListedOption[]> {
  for (const c of (await read()).categories) {
    const p = c.products.find((x) => x.name === product);
    if (!p) continue;
    return p.variations.map((v) => {
      const price = Number(v.price);
      const regular = Number(v.regularPrice);
      return { productId: p.id, variationId: v.id, label: v.label, price, regular: v.onSale && regular > price ? regular : 0, tag: v.promo?.enabled ? v.promo.text : "" };
    });
  }
  throw new Error(`The price list has no treatment named "${product}".`);
}

/** One option of a treatment. */
export async function optionOf(product: string, label: string): Promise<ListedOption> {
  const found = (await optionsOf(product)).find((o) => o.label.toLowerCase() === label.toLowerCase());
  if (!found) throw new Error(`"${product}" has no option "${label}" on the price list.`);
  return found;
}

/** The running sale's phase ("vip", "black-friday" ...), or null when no sale runs or WordPress cannot be reached. */
export const salePhase = async (): Promise<string | null> => (await read().catch(() => null))?.campaign?.phase ?? null;

/** Whether a sale campaign is running (its prices are on the list). */
export const saleRuns = async (): Promise<boolean> => !!(await read()).campaign?.phase;
