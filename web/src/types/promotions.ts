/**
 * The current offers as WooCommerce serves them through the ndm-pricing plugin (`ndm/v1/promotions`,
 * see cms/wp-content/plugins/ndm-pricing/includes/promotions.php). An offer is a WooCommerce product
 * with a few display settings; it holds no price: prices come from the price list.
 */

export const PROMO_AREAS = ["Face", "Body"] as const;
export const PROMO_ICONS = ["pen", "lips", "syringe", "hand", "drop", "face"] as const;
export const PROMO_SCOPES = ["product", "category"] as const;
/** The most offers the page shows (the plugin refuses more). */
export const PROMO_MAX = 30;

export type PromoArea = (typeof PROMO_AREAS)[number];
export type PromoIcon = (typeof PROMO_ICONS)[number];
/** "product": this treatment's lowest price and offer. "category": the lowest of its whole category. */
export type PromoScope = (typeof PROMO_SCOPES)[number];

/** The product's own image in WooCommerce. */
export interface WooPromoImage {
  /** Media library ID. */
  id: number;
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

export interface WooPromotion {
  /** WooCommerce product ID. */
  productId: number;
  productName: string;
  /** Its first category on the public price list; null (management view only) when it is not listed. */
  category: { slug: string; name: string } | null;
  image: WooPromoImage | null;
  order: number;
  /** Card title; empty shows the product's name. */
  name: string;
  text: string;
  area: PromoArea;
  icon: PromoIcon;
  /** Focus point of the photo, "50% 40%". */
  focus: string;
  scope: PromoScope;
}

export interface WooAdminPromotion extends WooPromotion {
  /** Whether the page can show it: its treatment is on the public price list. */
  listed: boolean;
}

/** One entry of the list the management screen saves, in its new order. */
export interface PromotionInput {
  productId: number;
  name: string;
  text: string;
  area: PromoArea;
  icon: PromoIcon;
  focus: string;
  scope: PromoScope;
  /** A newly uploaded photo: it becomes the product's image. Left out keeps the current one. */
  imageId?: number;
}
