import { PRICE_SPECIALS } from "@/config/pricing";
import { PRICE_CATEGORIES, type PriceOption } from "@/config/prices";
import { formatPrice, lowestPrice, priceInfo } from "@/lib/prices";

/**
 * The pricing page's view of the price list: every "from" price, unit and offer line worked out once, on
 * the server, so the page's interactive parts only have to show them.
 */

export interface PriceOptionView {
  label: string;
  price: number;
  /** Regular price before the offer; 0 when there is none. */
  was: number;
  tag?: string;
  /** " / unit" for the regular per-unit price of a per-unit category, else "". */
  unit: string;
}

export interface PriceItemView {
  name: string;
  note: string;
  /** One offer line for the closed row, built only from the clinic's own tags. */
  offer: string;
  from: number;
  fromUnit: string;
  options: PriceOptionView[];
}

export interface PriceCategoryView {
  id: string;
  name: string;
  blurb: string;
  offer: string;
  from: number;
  fromUnit: string;
  items: PriceItemView[];
}

export interface PriceSpecialView {
  name: string;
  /** "$245", ready to show. */
  price: string;
  /** "/ unit", or "". */
  unit: string;
  /** The offer for the red tag; empty shows the plain "Special" tag. */
  offer: string;
  /** id of the category's heading button in the price list. */
  target: string;
}

function bestOffer(options: PriceOption[]): string {
  const tags = options.map((o) => o.tag).filter((t): t is string => !!t);
  if (!tags.length) return "";
  const pct = Math.max(0, ...tags.map((t) => Number(/^(\d+)%\s*OFF$/i.exec(t)?.[1] ?? 0)));
  /* no-break space: "off" never wraps away from its number */
  return pct ? `Up to ${pct}% off` : tags[0];
}

export const PRICE_VIEW: PriceCategoryView[] = PRICE_CATEGORIES.map((c) => {
  const perUnit = (label: string) => (c.perUnit && label === "Regular" ? " / unit" : "");
  const all = c.items.flatMap((it) => it.options);
  const low = lowestPrice(c.id);
  return {
    id: c.id,
    name: c.name,
    blurb: c.blurb,
    offer: bestOffer(all),
    from: low ? low.value : Math.min(...all.map((o) => o.price)),
    fromUnit: low ? low.unit : "",
    items: c.items.map((it) => {
      const itemLow = lowestPrice(c.id, it.name);
      const min = Math.min(...it.options.map((o) => o.price));
      return {
        name: it.name,
        note: it.note,
        offer: bestOffer(it.options),
        from: itemLow ? itemLow.value : min,
        fromUnit: itemLow ? itemLow.unit : perUnit(it.options.find((o) => o.price === min)?.label ?? ""),
        options: it.options.map((o) => ({ label: o.label, price: o.price, was: o.regular || 0, tag: o.tag, unit: perUnit(o.label) })),
      };
    }),
  };
});

export const PRICE_TOTAL = PRICE_CATEGORIES.reduce((n, c) => n + c.items.length, 0);

export const PRICE_SPECIALS_VIEW: PriceSpecialView[] = PRICE_SPECIALS.items.map((s) => {
  const info = priceInfo(s.name) ?? lowestPrice(s.category);
  return {
    name: s.name,
    price: info ? formatPrice(info.value) : s.price,
    unit: info && info.unit ? info.unit.replace(" / ", "/ ") : "",
    offer: info?.offer ?? "",
    target: `pg-${s.category}`,
  };
});
