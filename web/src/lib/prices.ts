import { PRICE_CATEGORIES, PRICE_NAMES, type PriceCategory, type PriceOption } from "@/config/prices";

/**
 * Price helpers: one way to read the price list for the whole site, so a card on the home page always
 * shows the same number as the pricing page. Server-side by design: import it from Server Components and
 * pass the resulting text down, so the price list is not shipped to the browser.
 */

const BY_ID = new Map<string, PriceCategory>(PRICE_CATEGORIES.map((c) => [c.id, c]));

/** "$262.50", "$750": cents only when there are any, no thousands separator. */
export function formatPrice(n: number): string {
  const cents = Math.round(n * 100) % 100 !== 0;
  return `$${(Math.round(n * 100) / 100).toLocaleString("en-CA", { useGrouping: false, minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** How many units, syringes or sessions an option's label covers ("Package of 3" -> 3). */
function countIn(label: string): number {
  const m = /(\d+)\s*(units?|syringes?|sessions?|vials?|treatments?)\b/i.exec(label) ?? /package of (\d+)/i.exec(label);
  return m ? Number(m[1]) : 1;
}

function percentOff(tag: string | undefined): number {
  /* the price list ties "OFF" to its number with a no-break space, so any white space is accepted */
  const m = /^(\d+)%\s*OFF$/i.exec(tag ?? "");
  return m ? Number(m[1]) : 0;
}

const normalise = (s: string | undefined): string =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type Option = PriceOption & { item: string };

/** Every option of a category, or only those of the treatment named `item` when it matches one. */
function optionsOf(categoryId: string, item?: string): Option[] {
  const c = BY_ID.get(categoryId);
  if (!c) return [];
  const wanted = item ? c.items.filter((it) => normalise(it.name) === normalise(item) || normalise(it.name).includes(normalise(item))) : c.items;
  return (wanted.length ? wanted : c.items).flatMap((it) => it.options.map((o) => ({ ...o, item: it.name })));
}

export interface LowestPrice {
  /** Lowest price after the offer, counted per unit, per syringe or per session. */
  value: number;
  /** " / unit" for categories priced per unit, else "". */
  unit: string;
  per: "per unit" | "per syringe" | "per session" | "";
  /** Largest percentage offer in the category, 0 when there is none. */
  percent: number;
  /** The offer in sentence case, e.g. "Up to 30% off", "Buy 1 get 1 free". */
  offer: string;
}

export function lowestPrice(categoryId: string, item?: string): LowestPrice | null {
  const c = BY_ID.get(categoryId);
  const options = optionsOf(categoryId, item);
  if (!c || !options.length) return null;
  let best: { value: number; option: Option; count: number } | null = null;
  for (const o of options) {
    const count = /regular/i.test(o.label) ? 1 : countIn(o.label);
    const value = o.price / count;
    if (!best || value < best.value - 0.001) best = { value, option: o, count };
  }
  if (!best) return null;
  const percent = Math.max(0, ...options.map((o) => percentOff(o.tag)));
  const tags = options.map((o) => o.tag).filter((t): t is string => !!t);
  const offer = percent
    ? `Up to ${percent}%\u00a0off` /* no-break space: "off" never wraps away from its number */
    : tags[0]
      ? tags[0]
          .replace(/\bOFF\b/g, "off")
          .replace(/^BUY 1 GET 1/i, "Buy 1 get 1")
          .replace(/\bFREE\b/, "free")
          .replace(/^Save \$(\d+)\sOff$/i, "Save $$$1")
      : "";
  const per = c.perUnit ? "per unit" : /syringe/i.test(best.option.label) ? "per syringe" : best.count > 1 || /session/i.test(best.option.label) ? "per session" : "";
  return { value: Math.round(best.value * 100) / 100, unit: c.perUnit ? " / unit" : "", per, percent, offer };
}

/** [category id, treatment] for a name used anywhere on the site, or null when it is not on the price list. */
function locate(name: string): [categoryId: string, item?: string] | null {
  const key = normalise(name).replace(/\s*·\s*/g, " ");
  if (PRICE_NAMES[key]) return PRICE_NAMES[key];
  const asId = key.replace(/[^a-z0-9]+/g, "-");
  if (BY_ID.has(asId)) return [asId];
  const byName = PRICE_CATEGORIES.find((c) => normalise(c.name) === key);
  return byName ? [byName.id] : null;
}

/** "From $262.50" for a treatment name, or null when it is not on the price list. */
export function priceFor(name: string): string | null {
  const hit = locate(name);
  if (!hit) return null;
  const lowest = lowestPrice(hit[0], hit[1]);
  return lowest ? `From ${formatPrice(lowest.value)}${lowest.unit}` : null;
}

/**
 * Where a treatment sits on the price list, with its lowest price, unit and offer. Null when it is not on
 * the list. (Looks names up a little more strictly than `priceFor`, as the prototype's `priceInfo` does.)
 */
export function priceInfo(name: string): ({ id: string; item?: string } & LowestPrice) | null {
  const key = normalise(name);
  const byName = PRICE_CATEGORIES.find((c) => normalise(c.name) === key);
  const hit = PRICE_NAMES[key] ?? (byName ? ([byName.id] as [string, string?]) : null);
  if (!hit) return null;
  const lowest = lowestPrice(hit[0], hit[1]);
  return lowest ? { id: hit[0], item: hit[1], ...lowest } : null;
}

/** The price options of one treatment, for a treatment page's price table (empty when it is not on the list). */
export function priceRows(categoryId: string, item: string): PriceOption[] {
  const it = BY_ID.get(categoryId)?.items.find((x) => normalise(x.name).includes(normalise(item)));
  return it ? it.options : [];
}

/** The lowest price in one price table after its offers; per unit when the table is priced per unit. */
export function rowsFrom(rows: PriceOption[], perUnit = false): number {
  return Math.round(Math.min(...rows.map((r) => (perUnit && !/regular/i.test(r.label) ? r.price / countIn(r.label) : r.price))) * 100) / 100;
}

/** The largest percentage offer in a price table, 0 when there is none. */
export function rowsPercent(rows: PriceOption[]): number {
  return Math.max(0, ...rows.map((r) => percentOff(r.tag)));
}
