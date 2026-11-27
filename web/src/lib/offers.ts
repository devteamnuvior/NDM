import "server-only";
import type { Offer } from "@/components/specials/offers";
import type { WheelOffer } from "@/components/specials/specials-wheel";
import { cardPrice, offerPrice, offerPriceChoices } from "@/lib/offer-prices";
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
    /* the Pricing page's own figure for this treatment or its category (user, 2026-11-25), never an option of its own */
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

/**
 * The offers carousel (home, Promotion and sale pages): its own list of treatments, kept in WooCommerce
 * and managed in the price manager, apart from the Promotion page's offer cards. A card shows the
 * product's own photo and category; a treatment that is also an offer shows the offer's price, unit and
 * tag, any other its own lowest price or its category's. A treatment that is not on the public price
 * list gets no card. Throws a WordPressError when WooCommerce cannot be reached.
 */
export async function getCarousel(): Promise<WheelOffer[]> {
  const [promotions, tree] = await Promise.all([getPromotions(), getPricingTree()]);
  /* a plugin older than the list: the offers themselves, which is what the list starts as */
  const list = tree.carousel ?? promotions.map((p) => ({ productId: p.productId, name: p.name, scope: p.scope, productName: p.productName }));
  const choices = offerPriceChoices(tree);
  const offerOf = new Map(promotions.map((p) => [p.productId, p]));
  const images = new Map(tree.categories.flatMap((c) => c.products.flatMap((p) => (p.image ? [[p.id, p.image] as const] : []))));

  return list.flatMap((s): WheelOffer[] => {
    const choice = choices.get(s.productId);
    if (!choice) return [];
    const offer = offerOf.get(s.productId);
    const shown = cardPrice(choice, s);
    if (!shown) return [];
    const image = offer?.image ?? images.get(s.productId) ?? null;
    return [
      {
        id: s.productId,
        name: s.name || s.productName,
        photo: image ? { src: image.src, srcSet: image.srcSet } : null,
        position: offer?.focus ?? "50% 50%",
        tag: choice.tag,
        ...shown,
        href: `${pagePath("pricing")}#pg-${choice.slug}-h`,
      },
    ];
  });
}
