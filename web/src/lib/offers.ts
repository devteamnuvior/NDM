import "server-only";
import type { Offer } from "@/components/specials/offers";
import { createPriceBook } from "@/lib/price-book";
import { toCategories } from "@/lib/pricing-view";
import { pagePath } from "@/lib/routes";
import { getPricingTree, getPromotions } from "@/lib/wordpress";
import type { WooPricingTree } from "@/types/pricing";
import type { PromoScope } from "@/types/promotions";

/** What a card shows of a price: the lowest price (no dollar sign), its unit and the offer line. */
export interface OfferPrice {
  price: string;
  unit: string;
  deal: string;
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
  const show = (low: ReturnType<typeof whole.lowestPrice>): OfferPrice | null => (low ? { price: low.value % 1 ? low.value.toFixed(2) : String(low.value), unit: low.per, deal: low.offer } : null);
  const choices = new Map<number, OfferPriceChoice>();
  for (const category of categories) {
    const all = show(whole.lowestPrice(category.id));
    for (const item of category.items) {
      if (choices.has(item.id)) continue;
      /* a price list of this one treatment, so nothing with a similar name is counted in */
      const own = show(createPriceBook([{ ...category, items: [item] }]).lowestPrice(category.id));
      choices.set(item.id, { slug: category.id, tag: category.name, product: own, category: all });
    }
  }
  return choices;
}

export const offerPrice = (choice: OfferPriceChoice | undefined, scope: PromoScope): OfferPrice | null => (choice ? (scope === "product" ? choice.product : choice.category) : null);

/**
 * The current offers (the offers wheel, the Promotion page's cards, the Black Friday page's tickets),
 * read from WooCommerce: which treatments are on offer, their card text and photo are settings kept on
 * the products; the price, unit and offer line of each card are worked out from the price list there,
 * the same way the Pricing page does. Nothing is typed into this site.
 *
 * Both reads are cached and cleared together when something changes in WooCommerce. Throws a
 * WordPressError when WooCommerce cannot be reached: callers decide what to show instead.
 */
export async function getOffers(): Promise<Offer[]> {
  const [promotions, tree] = await Promise.all([getPromotions(), getPricingTree()]);
  const choices = offerPriceChoices(tree);

  return promotions.flatMap((p): Offer[] => {
    const choice = choices.get(p.productId);
    const shown = offerPrice(choice, p.scope);
    if (!choice || !shown) return [];
    return [
      {
        id: p.productId,
        name: p.name || p.productName,
        photo: p.image ? { src: p.image.src, srcSet: p.image.srcSet } : null,
        position: p.focus,
        tag: choice.tag,
        area: p.area,
        icon: p.icon,
        text: p.text,
        ...shown,
        href: `${pagePath("pricing")}#pg-${choice.slug}-h`,
      },
    ];
  });
}
