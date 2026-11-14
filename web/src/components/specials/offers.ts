import type { PromoArea, PromoIcon } from "@/types/promotions";

/** A photo served by WordPress (the product's own image in WooCommerce). */
export interface OfferPhoto {
  src: string;
  srcSet: string;
}

/** One current offer as the cards show it: the settings kept in WooCommerce, with its price resolved from the price list. */
export interface Offer {
  /** WooCommerce product ID. */
  id: number;
  name: string;
  /** Null when the product has no image yet. */
  photo: OfferPhoto | null;
  /** Focus point of the photo. */
  position: string;
  /** Category label on the card. */
  tag: string;
  area: PromoArea;
  icon: PromoIcon;
  text: string;
  /** Lowest price, without the dollar sign. */
  price: string;
  unit: string;
  deal: string;
  href: string;
}
