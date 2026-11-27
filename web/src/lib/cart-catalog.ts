import "server-only";
import { buildPricingView } from "@/lib/pricing-view";
import { getPricingTree } from "@/lib/wordpress";

/**
 * Everything a cart can hold, as WooCommerce has it now: one entry per price option on the public
 * price list. The cart is checked against it, so a line always shows WooCommerce's current name and
 * price, and something that left the price list leaves the cart.
 */

export interface CatalogEntry {
  /** WooCommerce product ID. */
  productId: number;
  /** WooCommerce variation ID; 0 for a product without variations. */
  variationId: number;
  cat: string;
  name: string;
  label: string;
  price: number;
  /** Regular price before the offer; 0 when there is none. */
  was: number;
  /** " / unit" for a per-unit price, else "". */
  unit: string;
  /** While a sale runs: the price with the checkout code, when the code applies; else 0. */
  code: number;
}

/**
 * How a cart line names two kinds of treatment (the price list keeps its own titles): a CoolSculpting line
 * says which CoolSculpting it is ("CoolSculpting Regular, 2 zones"), and Botox sits under its own name
 * rather than under the category it shares with another product.
 */
function cartNames(category: string, name: string): { cat: string; name: string } {
  if (/^botox(\s+cosmetic)?$/i.test(name.trim())) return { cat: "Botox", name: "Botox" };
  if (/^regular treatment zone$/i.test(name.trim())) return { cat: category, name: "CoolSculpting Regular" };
  const cool = /^coolsculpting\s+(.+)$/i.exec(name.trim());
  return cool ? { cat: category, name: `CoolSculpting ${cool[1]}` } : { cat: category, name };
}

const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, " ");
export const nameKey = (name: string, label: string): string => `${norm(name)}|${norm(label)}`;

export interface CartCatalog {
  /** The sale WooCommerce holds: its checkout code, and whether it runs now. Null when there is none. */
  sale: { code: string; live: boolean } | null;
  /** The tax WooCommerce adds to the listed prices: its rate in percent and its name. Null when it adds none. */
  tax: { rate: number; label: string } | null;
  byId: Map<number, CatalogEntry>;
  /** For lines saved before carts carried WooCommerce IDs: treatment name and option. */
  byName: Map<string, CatalogEntry>;
}

/** Reads the (cached) price list. Throws a WordPressError when WooCommerce cannot be reached. */
export async function getCartCatalog(): Promise<CartCatalog> {
  const tree = await getPricingTree();
  const view = buildPricingView(tree);
  const sale = tree.campaign ? { code: tree.campaign.code, live: tree.campaign.phase !== null } : null;
  const tax = tree.tax?.enabled && tree.tax.rate > 0 ? { rate: tree.tax.rate, label: tree.tax.label || "Tax" } : null;
  const byId = new Map<number, CatalogEntry>();
  const byName = new Map<string, CatalogEntry>();
  for (const c of view.categories) {
    /* the special lines (Aptos model call assessment) go in the cart like any option */
    for (const it of [...c.items, ...c.extras]) {
      for (const o of it.options) {
        const entry: CatalogEntry = { productId: o.productId, variationId: o.variationId, ...cartNames(c.name, it.name), label: o.label, price: o.price, was: o.was, unit: o.unit, code: o.code ?? 0 };
        const id = o.variationId || o.productId;
        if (!byId.has(id)) byId.set(id, entry); /* a product in two categories: the first one names it */
        if (!byName.has(nameKey(it.name, o.label))) byName.set(nameKey(it.name, o.label), entry);
        /* a line saved under the cart's own name for it */
        if (!byName.has(nameKey(entry.name, o.label))) byName.set(nameKey(entry.name, o.label), entry);
      }
    }
  }
  return { sale, tax, byId, byName };
}

/** The entry a cart line stands for: by its WooCommerce ID, else (older lines) by its name and option. */
export function findEntry(catalog: CartCatalog, line: { productId?: unknown; variationId?: unknown; name?: unknown; label?: unknown }): CatalogEntry | null {
  const productId = Number.isInteger(line.productId) ? (line.productId as number) : 0;
  const variationId = Number.isInteger(line.variationId) ? (line.variationId as number) : 0;
  if (productId > 0) {
    const hit = catalog.byId.get(variationId || productId);
    return hit && hit.productId === productId && hit.variationId === variationId ? hit : null;
  }
  if (typeof line.name === "string" && typeof line.label === "string") return catalog.byName.get(nameKey(line.name, line.label)) ?? null;
  return null;
}
