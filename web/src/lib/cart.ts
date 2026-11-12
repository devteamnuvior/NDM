import { CART_STORAGE_KEY } from "@/config/site";

/**
 * The cart. It lives in this browser only (localStorage, under the same key the original pages use), so
 * a cart filled on a page that is not migrated yet shows up here and the other way round. The clinic's
 * store takes over at checkout. This module is the single place that reads and writes it; components
 * use the `useCart` hook.
 */

export interface CartLine {
  /** Unique per treatment option. */
  key: string;
  /** Price-list category name. */
  cat: string;
  name: string;
  /** The chosen option ("Package of 3"). */
  label: string;
  price: number;
  /** " / unit" for products priced per unit, else "". */
  unit?: string;
  /** Regular price before the offer, when there is one. */
  was?: number;
  qty: number;
}

/** Most of one option a cart can hold. */
export const CART_MAX = 20;

const EMPTY: CartLine[] = [];
let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(v) ? (v as CartLine[]) : EMPTY;
  } catch {
    return EMPTY; /* storage blocked: the cart lasts for this visit */
  }
}

function emit(): void {
  listeners.forEach((l) => l());
}

export function subscribeCart(onChange: () => void): () => void {
  listeners.add(onChange);
  /* another tab, or one of the original pages, changed the cart */
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== CART_STORAGE_KEY) return;
    lines = read();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCartLines(): CartLine[] {
  if (!loaded) {
    loaded = true;
    lines = read();
  }
  return lines;
}

export const getServerCartLines = (): CartLine[] => EMPTY;

/** Sets how many of a line the cart holds; zero removes it. */
export function setCartQty(line: Omit<CartLine, "qty">, qty: number): void {
  const current = getCartLines();
  const i = current.findIndex((l) => l.key === line.key);
  if (qty <= 0) lines = current.filter((l) => l.key !== line.key);
  else if (i < 0) lines = [...current, { ...line, qty }];
  else lines = current.map((l, k) => (k === i ? { ...l, qty } : l));
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* storage blocked: the cart lasts for this visit */
  }
  emit();
}

/** "$1050", "$262.50": cents only when there are any, no thousands separator. */
export const money = (n: number): string => `$${n.toLocaleString("en-CA", { useGrouping: false, minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
