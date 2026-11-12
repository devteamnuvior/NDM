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
}

const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, " ");
export const nameKey = (name: string, label: string): string => `${norm(name)}|${norm(label)}`;

export interface CartCatalog {
  byId: Map<number, CatalogEntry>;
  /** For lines saved before carts carried WooCommerce IDs: treatment name and option. */
  byName: Map<string, CatalogEntry>;
}

/** Reads the (cached) price list. Throws a WordPressError when WooCommerce cannot be reached. */
export async function getCartCatalog(): Promise<CartCatalog> {
  const view = buildPricingView(await getPricingTree());
  const byId = new Map<number, CatalogEntry>();
  const byName = new Map<string, CatalogEntry>();
  for (const c of view.categories) {
    for (const it of c.items) {
      for (const o of it.options) {
        const entry: CatalogEntry = { productId: o.productId, variationId: o.variationId, cat: c.name, name: it.name, label: o.label, price: o.price, was: o.was, unit: o.unit };
        const id = o.variationId || o.productId;
        if (!byId.has(id)) byId.set(id, entry); /* a product in two categories: the first one names it */
        if (!byName.has(nameKey(it.name, o.label))) byName.set(nameKey(it.name, o.label), entry);
      }
    }
  }
  return { byId, byName };
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
