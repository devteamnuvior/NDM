import type { PriceCategory, PriceOption } from "@/config/prices";
import { createPriceBook, fromValue, type PriceNames, type PriceSource } from "@/lib/price-book";
import type { WooPricingTree, WooPriceFields, WooProduct } from "@/types/pricing";

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
  /** While a sale runs: the price with the checkout code, when the code applies to this option. */
  code?: number;
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
  /** Where the "from" price is read from; null when it is not worked out from the list. */
  fromSource: PriceSource | null;
  /** The offer as the sale badge shows it, in one or two parts ("BUY 1", "GET 1 FREE"). */
  badge: string[];
  /** Whether the checkout code applies to any of its options. */
  coded: boolean;
  options: PriceOptionView[];
}

/**
 * A special line under a category's options (WooCommerce product flagged `extra`, user 2026-11-27: the Aptos
 * model call assessment): its name, its short description as the note, its label as the small tag, and its
 * price(s). It is left out of every "from" price, offer, monthly special and search.
 */
export interface PriceExtraView {
  id: number;
  name: string;
  note: string;
  /** The product's promotional label, shown as a small tag ("Model call"); "" for none. */
  tag: string;
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
  /** Where the "from" price is read from; null when it is not worked out from the list. */
  fromSource: PriceSource | null;
  badge: string[];
  coded: boolean;
  items: PriceItemView[];
  /** Special lines shown under the category's options; empty for most categories. */
  extras: PriceExtraView[];
}

export interface PriceSpecialView {
  /** WooCommerce product ID of the treatment the card stands for. */
  id: number;
  name: string;
  /** "$245", ready to show. */
  price: string;
  /** " / unit", " / syringe", " / zone", " / session", or "". */
  unit: string;
  /** The offer for the red tag; empty leaves the tag's place blank. */
  offer: string;
  /** id of the category's heading button in the price list. */
  target: string;
  /** The price list's own pill for the same treatment or category ("30% OFF", "BUY 1" | "GET 1 FREE") and whether the
   *  checkout code sits beside it ("+ EXTRA 30%"), so the card wears the list's pill (user, 2026-11-25). */
  badge: string[];
  coded: boolean;
  /** The regular price on the same count, struck through beside the price; 0 without a sale. */
  was: number;
}

export interface PricingView {
  categories: PriceCategoryView[];
  /** How many treatments the list holds. */
  total: number;
}

/** What a product without variations calls its one price. */
const SINGLE_LABEL = "Price";

type Option = PriceOption & { productId: number; variationId: number };
type Item = { id: number; name: string; note: string; options: Option[] };
type Category = Omit<PriceCategory, "items"> & { termId: number; items: Item[] };

export function bestOffer(options: PriceOption[]): string {
  const tags = options.map((o) => o.tag).filter((t): t is string => !!t);
  if (!tags.length) return "";
  const pct = Math.max(0, ...tags.map((t) => Number(/^(\d+)%\s*OFF$/i.exec(t)?.[1] ?? 0)));
  /* no-break space: "off" never wraps away from its number */
  return pct ? `Up to ${pct}% off` : tags[0];
}

/** A clinic tag in the sale pill's words: "SALE 30% OFF" -> "30% OFF", "Save $1000 Off" -> "SAVE $1,000". */
export function tagWords(tag: string): string {
  return tag
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/^SALE\s+/, "")
    .replace(/^SAVE \$(\d+)(?: OFF)?$/, (_, n: string) => `SAVE $${Number(n).toLocaleString("en-CA")}`);
}

/** The offer of a list of options as the sale badge shows it: the biggest percentage, else the first tag, split after "BUY 1". */
export function saleBadge(options: PriceOption[]): string[] {
  const tags = options.map((o) => (o.tag ? tagWords(o.tag) : "")).filter(Boolean);
  if (!tags.length) return [];
  const pct = (t: string) => Number(/^(\d+)%\s*OFF$/i.exec(t)?.[1] ?? 0);
  const tag = [...tags].sort((a, b) => pct(b) - pct(a))[0];
  const buy = /^(BUY \d+)\s+(GET .+)$/.exec(tag);
  return buy ? [buy[1], buy[2]] : [tag];
}

/**
 * Whether the checkout code belongs beside that badge ("30% OFF" | "+ EXTRA 30%"): only when the option the badge
 * is read from takes the code. A fixed line such as "70% OFF" does not, so its badge stands alone even if other
 * options of the same treatment take the code. Without any tag, any option that takes the code counts.
 */
export function badgeCoded(options: PriceOption[]): boolean {
  const tagged = options.filter((o) => o.tag && tagWords(o.tag));
  if (!tagged.length) return options.some((o) => !!o.code);
  const pct = (o: PriceOption) => Number(/^(\d+)%\s*OFF$/i.exec(tagWords(o.tag ?? ""))?.[1] ?? 0);
  return !![...tagged].sort((a, b) => pct(b) - pct(a))[0].code;
}

/** One WooCommerce price as the price list's option: the price to pay, and the regular price while a sale runs. */
function option(fields: WooPriceFields & { campaign?: { code: boolean; codePrice: string } }, label: string, tag: string | undefined, productId: number, variationId: number, by?: { code: string; percent: number } | null): Option {
  const price = Number(fields.price);
  const regular = Number(fields.regularPrice);
  /* a line the checkout code applies to also says which code and how much, so any page can write the code's line */
  const sale = fields.campaign ? { sale: true, ...(fields.campaign.code ? { code: Number(fields.campaign.codePrice), ...(by ? { codeName: by.code, codePercent: by.percent } : {}) } : {}) } : {};
  return { label, price, regular: fields.onSale && regular > price ? regular : 0, tag, productId, variationId, ...sale };
}

/** A WooCommerce product as the price list's options: its variations, or its own price as one option. */
function productOptions(p: WooProduct, by: { code: string; percent: number } | null): Option[] {
  const tag = p.label?.enabled && p.label.text ? p.label.text : undefined;
  const options = p.variations.length
    ? p.variations.map((v) => option(v, v.label, v.promo?.enabled && v.promo.text ? v.promo.text : tag, p.id, v.id, by))
    : [option(p, SINGLE_LABEL, tag, p.id, 0, by)];
  return options.filter((o) => Number.isFinite(o.price) && o.price >= 0);
}

/**
 * The WooCommerce list in the shape the price helpers read, leaving out anything without a usable price and the
 * special lines (`extra` products), which no "from" price, offer or search counts.
 */
export function toCategories(tree: WooPricingTree): Category[] {
  const by = tree.campaign ? { code: tree.campaign.code, percent: tree.campaign.percent } : null;
  return tree.categories
    .map((c) => ({
      id: c.slug,
      termId: c.id,
      name: c.name,
      perUnit: c.perUnit,
      blurb: c.description,
      items: c.products
        .filter((p) => !p.extra)
        .map((p) => ({ id: p.id, name: p.name, note: p.note, options: productOptions(p, by) }))
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
  const by = tree.campaign ? { code: tree.campaign.code, percent: tree.campaign.percent } : null;
  /* the special lines of each category, by its slug, in the category's order */
  const extras = new Map<string, PriceExtraView[]>(
    tree.categories.map((c) => [
      c.slug,
      c.products
        .filter((p) => p.extra)
        .map((p) => ({
          id: p.id,
          name: p.name,
          note: p.note,
          tag: p.label?.enabled && p.label.text ? p.label.text : "",
          options: productOptions(p, by).map((o) => ({ label: o.label, price: o.price, was: o.regular || 0, unit: "", productId: o.productId, variationId: o.variationId })),
        }))
        .filter((x) => x.options.length),
    ]),
  );

  const categories = list.map((c): PriceCategoryView => {
    const perUnit = (label: string) => (c.perUnit && label === "Regular" ? " / unit" : "");
    const all = c.items.flatMap((it) => it.options);
    const low = book.lowestPrice(c.id, undefined, true);
    return {
      id: c.id,
      termId: c.termId,
      name: c.name,
      blurb: c.blurb,
      offer: bestOffer(all),
      from: low ? low.value : fromValue(Math.min(...all.map((o) => o.price)), c.perUnit),
      fromUnit: low ? low.unit : "",
      fromSource: low?.source ?? null,
      badge: saleBadge(all),
      coded: badgeCoded(all),
      items: c.items.map((it) => {
        const itemLow = book.lowestPrice(c.id, it.name, true);
        const min = Math.min(...it.options.map((o) => o.price));
        return {
          id: it.id,
          name: it.name,
          note: it.note,
          offer: bestOffer(it.options),
          from: itemLow ? itemLow.value : fromValue(min, c.perUnit),
          fromUnit: itemLow ? itemLow.unit : perUnit(it.options.find((o) => o.price === min)?.label ?? ""),
          fromSource: itemLow?.source ?? null,
          badge: saleBadge(it.options),
          coded: badgeCoded(it.options),
          options: it.options.map((o) => ({ label: o.label, price: o.price, was: o.regular || 0, tag: o.tag, unit: perUnit(o.label), productId: o.productId, variationId: o.variationId, ...(o.code ? { code: o.code } : {}) })),
        };
      }),
      extras: extras.get(c.id) ?? [],
    };
  });

  return { categories, total: list.reduce((n, c) => n + c.items.length, 0) };
}
