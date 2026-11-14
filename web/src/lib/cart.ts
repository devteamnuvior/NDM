import { CART_STORAGE_KEY } from "@/config/site";
import { withBase } from "@/lib/base-path";

/**
 * The cart. It is kept in this browser (localStorage), and it only remembers what was chosen: every
 * line stands for a WooCommerce product or variation, and when the cart is loaded it asks the server
 * what WooCommerce says now (name, option, price). A line that is no longer on the price list is taken
 * out. Prices are never trusted from the browser: the order request sends IDs and quantities only.
 * This module is the single place that reads and writes the cart; components use the `useCart` hook.
 */

export interface CartLine {
  /** Unique per treatment option: `cartKey(productId, variationId)` once the line has been checked. */
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
  /** WooCommerce product ID of the treatment, when the line comes from the price list. */
  productId?: number;
  /** WooCommerce variation ID of the chosen option; 0 for a product without variations. */
  variationId?: number;
  qty: number;
}

/** Most of one option a cart can hold. */
export const CART_MAX = 20;

/** The key of a line that stands for a WooCommerce product (`variationId` 0) or variation. */
export const cartKey = (productId: number, variationId: number): string => `wc:${productId}:${variationId}`;

const EMPTY: CartLine[] = [];
const NONE: string[] = [];
let lines: CartLine[] = EMPTY;
let loaded = false;
/** What the last check took out of the cart ("Treatment, option"), for a notice. */
let removed: string[] = NONE;
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

function write(next: CartLine[]): void {
  lines = next;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* storage blocked: the cart lasts for this visit */
  }
  emit();
}

type Checked = Pick<CartLine, "cat" | "name" | "label" | "price" | "unit" | "was"> & { productId: number; variationId: number };

/**
 * Asks the server what WooCommerce says about the cart's lines and brings the cart in line with it:
 * current names and prices, WooCommerce IDs on every line, and nothing that left the price list.
 * When the server cannot be reached the cart is left alone (placing the order checks again).
 */
export async function checkCart(): Promise<void> {
  const asked = getCartLines();
  if (!asked.length) return;
  let answer: (Checked | null)[];
  try {
    const response = await fetch(withBase("/api/cart/check"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: asked.map(({ productId, variationId, name, label }) => ({ productId, variationId, name, label })) }),
    });
    if (!response.ok) return;
    answer = ((await response.json()) as { lines: (Checked | null)[] }).lines;
  } catch {
    return;
  }
  if (!Array.isArray(answer) || answer.length !== asked.length) return;

  const now = getCartLines(); /* the cart may have changed while the answer was on its way */
  const next: CartLine[] = [];
  const gone: string[] = [];
  asked.forEach((line, i) => {
    const current = now.find((l) => l.key === line.key);
    if (!current) return; /* removed meanwhile */
    const fresh = answer[i];
    if (!fresh) {
      gone.push(`${line.name}, ${line.label}`);
      return;
    }
    const key = cartKey(fresh.productId, fresh.variationId);
    const twin = next.find((l) => l.key === key);
    if (twin) twin.qty = Math.min(CART_MAX, twin.qty + current.qty);
    else next.push({ key, cat: fresh.cat, name: fresh.name, label: fresh.label, price: fresh.price, unit: fresh.unit, was: fresh.was || undefined, productId: fresh.productId, variationId: fresh.variationId, qty: current.qty });
  });
  for (const l of now) if (!asked.some((a) => a.key === l.key)) next.push(l); /* added meanwhile */

  if (gone.length) removed = gone;
  if (gone.length || JSON.stringify(next) !== JSON.stringify(now)) write(next);
}

export function getCartLines(): CartLine[] {
  if (!loaded) {
    loaded = true;
    lines = read();
    if (lines.length) void checkCart();
  }
  return lines;
}

export const getCartRemoved = (): string[] => removed;
export const getServerCartRemoved = (): string[] => NONE;

/** The notice about removed lines has been read. */
export function dismissCartRemoved(): void {
  if (removed === NONE) return;
  removed = NONE;
  emit();
}

/** Empties the cart (after an order request has been placed). */
export function clearCart(): void {
  getCartLines();
  write(EMPTY);
}

export const getServerCartLines = (): CartLine[] => EMPTY;

/** Sets how many of a line the cart holds; zero removes it. */
export function setCartQty(line: Omit<CartLine, "qty">, qty: number): void {
  const current = getCartLines();
  const i = current.findIndex((l) => l.key === line.key);
  if (qty <= 0) lines = current.filter((l) => l.key !== line.key);
  else if (i < 0) lines = [...current, { ...line, qty }];
  else lines = current.map((l, k) => (k === i ? { ...l, qty } : l));
  write(lines);
}

/** "$1050", "$262.50": cents only when there are any, no thousands separator. */
export const money = (n: number): string => `$${n.toLocaleString("en-CA", { useGrouping: false, minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
