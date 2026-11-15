import "server-only";
import type { Offer } from "@/components/specials/offers";
import { offerOptionPrice, offerPrice, offerPriceChoices } from "@/lib/offer-prices";
import { pagePath } from "@/lib/routes";
import { getPricingTree, getPromotions } from "@/lib/wordpress";

export { offerOptionPrice, offerPrice, offerPriceChoices, type OfferPrice, type OfferPriceChoice } from "@/lib/offer-prices";

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
    /* an offer may name the one option its price is read from; an option that has left the list falls back to the lowest */
    const shown = (p.option ? offerOptionPrice(tree, p.productId, p.option) : null) ?? offerPrice(choice, p.scope);
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
