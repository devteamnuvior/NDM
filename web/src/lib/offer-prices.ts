import { createPriceBook } from "@/lib/price-book";
import { badgeCoded, saleBadge, toCategories, type PriceSpecialView } from "@/lib/pricing-view";
import type { WooPricingTree, WooSpecial } from "@/types/pricing";
import type { PromoScope } from "@/types/promotions";

/**
 * What a card that stands for a treatment shows of its price (the offers, the Pricing page's Monthly
 * specials), worked out from the WooCommerce price list. No server code: the management screen uses
 * the same rules for its draft.
 */

/** What a card shows of a price: the lowest price (no dollar sign), its unit and the offer line. */
export interface OfferPrice {
  price: string;
  unit: string;
  deal: string;
  /** The regular price on the same count (0 without a sale), and the price list's own pill for the same rows. */
  was: number;
  badge: string[];
  coded: boolean;
}

/** A treatment's place on the public price list, with what its card would show under each price setting. */
export interface OfferPriceChoice {
  /** Category slug and name. */
  slug: string;
  tag: string;
  product: OfferPrice | null;
  category: OfferPrice | null;
}

/**
 * For every treatment on the public price list: the price, unit and offer line of its card, once
 * counted over this treatment alone ("product") and once over its whole category ("category"), worked
 * out the same way the Pricing page does. A treatment in several categories counts in the first.
 */
export function offerPriceChoices(tree: WooPricingTree): Map<number, OfferPriceChoice> {
  const categories = toCategories(tree);
  const whole = createPriceBook(categories);
  type Opts = (typeof categories)[number]["items"][number]["options"];
  const show = (low: ReturnType<typeof whole.lowestPrice>, options: Opts): OfferPrice | null =>
    low ? { price: low.value % 1 ? low.value.toFixed(2) : String(low.value), unit: low.per, deal: low.offer, was: low.source.was, badge: saleBadge(options), coded: badgeCoded(options) } : null;
  const choices = new Map<number, OfferPriceChoice>();
  for (const category of categories) {
    const all = show(whole.lowestPrice(category.id), category.items.flatMap((it) => it.options));
    for (const item of category.items) {
      if (choices.has(item.id)) continue;
      /* a price list of this one treatment, so nothing with a similar name is counted in */
      const own = show(createPriceBook([{ ...category, items: [item] }]).lowestPrice(category.id), item.options);
      choices.set(item.id, { slug: category.id, tag: category.name, product: own, category: all });
    }
  }
  return choices;
}

/**
 * The card of an offer that names one option of its product ("2 zones"): that option's price, counted per
 * unit, per syringe, per zone or per session like every other, with that option's own offer line.
 * Null when the product or the option is not on the public price list.
 */
export function offerOptionPrice(tree: WooPricingTree, productId: number, option: string): OfferPrice | null {
  const same = (label: string) => label.trim().toLowerCase() === option.trim().toLowerCase();
  for (const category of toCategories(tree)) {
    const item = category.items.find((it) => it.id === productId);
    const one = item?.options.find((o) => same(o.label));
    if (!item || !one) continue;
    const low = createPriceBook([{ ...category, items: [{ ...item, options: [one] }] }]).lowestPrice(category.id);
    return low ? { price: low.value % 1 ? low.value.toFixed(2) : String(low.value), unit: low.per, deal: low.offer, was: low.source.was, badge: saleBadge([one]), coded: badgeCoded([one]) } : null;
  }
  return null;
}

export const offerPrice = (choice: OfferPriceChoice | undefined, scope: PromoScope): OfferPrice | null => (choice ? (scope === "product" ? choice.product : choice.category) : null);


/** What the Monthly specials need to know of an offer (Promotions) on the same treatment. */
export interface SpecialOffer {
  productId: number;
  scope: PromoScope;
  option?: string;
}

/**
 * The price a card of one of the lists (Monthly specials, the offers carousel) shows: its treatment's or its category's
 * "from" price exactly as the Pricing page's list shows it (user, 2026-11-25: every price on the site is read from the
 * Pricing page and agrees with it), as the card is set. An offer's own option or price setting no longer changes it.
 */
export function cardPrice(choice: OfferPriceChoice, card: Pick<WooSpecial, "productId" | "scope">): OfferPrice | null {
  return offerPrice(choice, card.scope);
}

/**
 * The Pricing page's Monthly specials cards, in the list's order. (The manager's draft uses it for the
 * offers carousel too: the figures follow the same rules.) A treatment that is also an offer
 * (the wheel, the Promotion page) shows the offer's own price, unit and offer line, so every page
 * agrees; any other shows its own lowest price or its category's, as its card is set. A treatment that
 * is not on the public price list has no price to show and gets no card.
 */
export function priceSpecials(tree: WooPricingTree, specials: readonly WooSpecial[], offers: readonly SpecialOffer[]): PriceSpecialView[] {
  const choices = offerPriceChoices(tree);
  void offers; /* kept for callers: an offer no longer changes a card's price (user, 2026-11-25) */
  return specials.flatMap((s): PriceSpecialView[] => {
    const choice = choices.get(s.productId);
    if (!choice) return [];
    const shown = cardPrice(choice, s);
    if (!shown) return [];
    return [{ id: s.productId, name: s.name || s.productName, price: "$" + shown.price, unit: shown.unit ? " / " + shown.unit.replace(/^per /, "") : "", offer: shown.deal, target: `pg-${choice.slug}`, badge: shown.badge, coded: shown.coded, was: shown.was }];
  });
}
