import "server-only";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { CART_PAIRS } from "@/config/checkout";
import { cartKey, type CartLine } from "@/lib/cart";
import { getCartCatalog, nameKey } from "@/lib/cart-catalog";

/**
 * The suggestions on the cart and checkout pages, with WooCommerce's current prices. Empty when a
 * suggestion is not on the price list, or when WooCommerce cannot be reached (then the page asks again
 * on the next visit instead of keeping the empty list).
 */
export async function getCartPairs(): Promise<Omit<CartLine, "qty">[]> {
  try {
    const catalog = await getCartCatalog();
    return CART_PAIRS.flatMap(([name, label]) => {
      const e = catalog.byName.get(nameKey(name, label));
      return e ? [{ key: cartKey(e.productId, e.variationId), cat: e.cat, name: e.name, label: e.label, price: e.price, was: e.was || undefined, unit: e.unit, productId: e.productId, variationId: e.variationId }] : [];
    });
  } catch (error) {
    unstable_rethrow(error);
    await connection();
    return [];
  }
}
