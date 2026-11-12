import { PRICE_SPECIALS } from "@/config/pricing";
import type { PriceCategory, PriceOption } from "@/config/prices";
import { createPriceBook, formatPrice, type PriceNames } from "@/lib/price-book";
import type { WooPricingTree, WooPriceFields } from "@/types/pricing";

/**
 * The pricing page's view of the price list in WooCommerce: every "from" price, unit and offer line
 * worked out once, on the server, so the page's interactive parts only have to show them. Every price
 * here is a WooCommerce price; nothing is typed into this site.
 */

export interface PriceOptionView {
  label: string;
  price: number;
  /** Regular price before the offer; 0 when there is none. */
  was: number;
  tag?: string;
  /** " / unit" for the regular per-unit price of a per-unit category, else "". */
  unit: string;
  /** WooCommerce product ID. */
  productId: number;
  /** WooCommerce variation ID; 0 for a product without variations. */
  variationId: number;
}

export interface PriceItemView {
  /** WooCommerce product ID. */
  id: number;
  name: string;
  note: string;
  /** One offer line for the closed row, built only from the clinic's own labels. */
  offer: string;
  from: number;
  fromUnit: string;
  options: PriceOptionView[];
}

export interface PriceCategoryView {
  /** The WooCommerce category's slug: stable when the category is renamed, so links to it keep working. */
  id: string;
  /** WooCommerce product category ID. */
  termId: number;
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

export interface PricingView {
  categories: PriceCategoryView[];
  /** How many treatments the list holds. */
  total: number;
  specials: PriceSpecialView[];
}

/** What a product without variations calls its one price. */
const SINGLE_LABEL = "Price";

type Option = PriceOption & { productId: number; variationId: number };
type Item = { id: number; name: string; note: string; options: Option[] };
type Category = Omit<PriceCategory, "items"> & { termId: number; items: Item[] };

function bestOffer(options: PriceOption[]): string {
  const tags = options.map((o) => o.tag).filter((t): t is string => !!t);
  if (!tags.length) return "";
  const pct = Math.max(0, ...tags.map((t) => Number(/^(\d+)%\s*OFF$/i.exec(t)?.[1] ?? 0)));
  /* no-break space: "off" never wraps away from its number */
  return pct ? `Up to ${pct}% off` : tags[0];
}

/** One WooCommerce price as the price list's option: the price to pay, and the regular price while a sale runs. */
function option(fields: WooPriceFields, label: string, tag: string | undefined, productId: number, variationId: number): Option {
  const price = Number(fields.price);
  const regular = Number(fields.regularPrice);
  return { label, price, regular: fields.onSale && regular > price ? regular : 0, tag, productId, variationId };
}

/** The WooCommerce list in the shape the price helpers read, leaving out anything without a usable price. */
function toCategories(tree: WooPricingTree): Category[] {
  return tree.categories
    .map((c) => ({
      id: c.slug,
      termId: c.id,
      name: c.name,
      perUnit: c.perUnit,
      blurb: c.description,
      items: c.products
        .map((p) => {
          const tag = p.label?.enabled && p.label.text ? p.label.text : undefined;
          const options = p.variations.length
            ? p.variations.map((v) => option(v, v.label, v.promo?.enabled && v.promo.text ? v.promo.text : tag, p.id, v.id))
            : [option(p, SINGLE_LABEL, tag, p.id, 0)];
          return { id: p.id, name: p.name, note: p.note, options: options.filter((o) => Number.isFinite(o.price) && o.price >= 0) };
        })
        .filter((it) => it.options.length),
    }))
    .filter((c) => c.items.length);
}

/**
 * `names` maps the names the monthly specials use to their place on the list (the server passes the
 * site's own map; the preview, which shows the list only, passes none).
 */
export function buildPricingView(tree: WooPricingTree, names: PriceNames = {}): PricingView {
  const list = toCategories(tree);
  const book = createPriceBook(list, names);

  const categories = list.map((c): PriceCategoryView => {
    const perUnit = (label: string) => (c.perUnit && label === "Regular" ? " / unit" : "");
    const all = c.items.flatMap((it) => it.options);
    const low = book.lowestPrice(c.id);
    return {
      id: c.id,
      termId: c.termId,
      name: c.name,
      blurb: c.blurb,
      offer: bestOffer(all),
      from: low ? low.value : Math.min(...all.map((o) => o.price)),
      fromUnit: low ? low.unit : "",
      items: c.items.map((it) => {
        const itemLow = book.lowestPrice(c.id, it.name);
        const min = Math.min(...it.options.map((o) => o.price));
        return {
          id: it.id,
          name: it.name,
          note: it.note,
          offer: bestOffer(it.options),
          from: itemLow ? itemLow.value : min,
          fromUnit: itemLow ? itemLow.unit : perUnit(it.options.find((o) => o.price === min)?.label ?? ""),
          options: it.options.map((o) => ({ label: o.label, price: o.price, was: o.regular || 0, tag: o.tag, unit: perUnit(o.label), productId: o.productId, variationId: o.variationId })),
        };
      }),
    };
  });

  /* a special shows only while its treatment, or at least its category, is on the price list */
  const specials = PRICE_SPECIALS.items.flatMap((s): PriceSpecialView[] => {
    const info = book.priceInfo(s.name) ?? book.lowestPrice(s.category);
    if (!info) return [];
    return [{ name: s.name, price: formatPrice(info.value), unit: info.unit ? info.unit.replace(" / ", "/ ") : "", offer: info.offer ?? "", target: `pg-${s.category}` }];
  });

  return { categories, total: list.reduce((n, c) => n + c.items.length, 0), specials };
}
