import { useSyncExternalStore } from "react";
import { getCartLines, getCartRemoved, getServerCartLines, getServerCartRemoved, setCartQty, subscribeCart, type CartLine } from "@/lib/cart";

export interface Cart {
  lines: CartLine[];
  setQty: (line: Omit<CartLine, "qty">, qty: number) => void;
  qtyOf: (key: string) => number;
  /** Number of items. */
  count: number;
  total: number;
  /** How much the offers in the cart save. */
  saved: number;
  /** Lines the last check took out because they are no longer on the price list ("Treatment, option"). */
  removed: string[];
}

/** The cart, shared by every component that shows or changes it. Empty on the server and on first render. */
export function useCart(): Cart {
  const lines = useSyncExternalStore(subscribeCart, getCartLines, getServerCartLines);
  const removed = useSyncExternalStore(subscribeCart, getCartRemoved, getServerCartRemoved);
  return {
    lines,
    removed,
    setQty: setCartQty,
    qtyOf: (key) => lines.find((l) => l.key === key)?.qty ?? 0,
    count: lines.reduce((n, l) => n + l.qty, 0),
    total: lines.reduce((n, l) => n + l.qty * l.price, 0),
    saved: lines.reduce((n, l) => n + (l.was ? l.qty * (l.was - l.price) : 0), 0),
  };
}
