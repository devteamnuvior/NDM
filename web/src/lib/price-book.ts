import type { PriceCategory, PriceOption } from "@/config/prices";

/**
 * Price helpers over any price list: the "from" price, the unit and the offer line are worked out one
 * way everywhere. This file holds no prices, so it can run on the server and in the browser (the
 * management screen's preview); `lib/prices.ts` binds it to the site's built-in list.
 */

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

/**
 * The price helpers over one price list. The site's built-in list gets its own set below; the Pricing
 * page builds a set over the list it reads from WooCommerce, so both are worked out the same way.
 */
/** A name used somewhere on the site, and where it sits on the price list. */
export type PriceNames = Record<string, [categoryId: string, item?: string]>;

export function createPriceBook(categories: PriceCategory[], names: PriceNames = {}) {
  const BY_ID = new Map<string, PriceCategory>(categories.map((c) => [c.id, c]));

  /** Every option of a category, or only those of the treatment named `item` when it matches one. */
  function optionsOf(categoryId: string, item?: string): Option[] {
    const c = BY_ID.get(categoryId);
    if (!c) return [];
    const wanted = item ? c.items.filter((it) => normalise(it.name) === normalise(item) || normalise(it.name).includes(normalise(item))) : c.items;
    return (wanted.length ? wanted : c.items).flatMap((it) => it.options.map((o) => ({ ...o, item: it.name })));
  }

  function lowestPrice(categoryId: string, item?: string): LowestPrice | null {
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
    if (names[key]) return names[key];
    const asId = key.replace(/[^a-z0-9]+/g, "-");
    if (BY_ID.has(asId)) return [asId];
    const byName = categories.find((c) => normalise(c.name) === key);
    return byName ? [byName.id] : null;
  }

  /** The lowest price of a treatment by any name the site uses for it, with the category it sits in; null when it is not on the price list. */
  function priceLow(name: string): (LowestPrice & { categoryId: string }) | null {
    const hit = locate(name);
    const lowest = hit ? lowestPrice(hit[0], hit[1]) : null;
    return hit && lowest ? { ...lowest, categoryId: hit[0] } : null;
  }

  /** "From $262.50" for a treatment name, or null when it is not on the price list. */
  function priceFor(name: string): string | null {
    const hit = locate(name);
    if (!hit) return null;
    const lowest = lowestPrice(hit[0], hit[1]);
    return lowest ? `From ${formatPrice(lowest.value)}${lowest.unit}` : null;
  }

  /**
   * Where a treatment sits on the price list, with its lowest price, unit and offer. Null when it is not on
   * the list. (Looks names up a little more strictly than `priceFor`, as the prototype's `priceInfo` does.)
   */
  function priceInfo(name: string): ({ id: string; item?: string } & LowestPrice) | null {
    const key = normalise(name);
    const byName = categories.find((c) => normalise(c.name) === key);
    const hit = names[key] ?? (byName ? ([byName.id] as [string, string?]) : null);
    if (!hit) return null;
    const lowest = lowestPrice(hit[0], hit[1]);
    return lowest ? { id: hit[0], item: hit[1], ...lowest } : null;
  }

  /** The price options of one treatment, for a treatment page's price table (empty when it is not on the list). */
  function priceRows(categoryId: string, item: string): PriceOption[] {
    const it = BY_ID.get(categoryId)?.items.find((x) => normalise(x.name).includes(normalise(item)));
    return it ? it.options : [];
  }

  return { lowestPrice, priceFor, priceInfo, priceLow, priceRows };
}

export type PriceBook = ReturnType<typeof createPriceBook>;

/** The lowest price in one price table after its offers; per unit when the table is priced per unit. */
export function rowsFrom(rows: PriceOption[], perUnit = false): number {
  return Math.round(Math.min(...rows.map((r) => (perUnit && !/regular/i.test(r.label) ? r.price / countIn(r.label) : r.price))) * 100) / 100;
}

/** The largest percentage offer in a price table, 0 when there is none. */
export function rowsPercent(rows: PriceOption[]): number {
  return Math.max(0, ...rows.map((r) => percentOff(r.tag)));
}
