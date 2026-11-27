import type { PromoArea, PromoIcon, PromoScope, WooPromoImage } from "@/types/promotions";

/**
 * The price list as WooCommerce serves it through the ndm-pricing plugin (`ndm/v1/pricing`, see
 * cms/wp-content/plugins/ndm-pricing). Every id is WooCommerce's own: a product category, a product,
 * a variation. Prices are WooCommerce's decimal strings; an empty string means "not set".
 */

/** A promotional label ("Save $1000 Off"). Display text only, never a price. */
export interface WooPromoLabel {
  text: string;
  enabled: boolean;
}

/** The price fields a simple product and a variation share. */
export interface WooPriceFields {
  /** The price to pay now: the sale price while a sale runs, else the regular price. */
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  sku: string;
  stockStatus: string;
}

export interface WooVariation extends WooPriceFields {
  /** WooCommerce variation ID. */
  id: number;
  /** The variation's attribute values, for example "60 units". */
  label: string;
  attributes: { name: string; value: string }[];
  /** Null on the public list when there is no label or it is switched off. */
  promo: WooPromoLabel | null;
  order: number;
  /** Set while a sale campaign runs and this line is in it: whether the checkout code applies, and the price with it. */
  campaign?: { code: boolean; codePrice: string };
}

/** A sale campaign over the price list (see cms/wp-content/plugins/ndm-pricing/includes/campaign.php). Dates are ISO 8601. */
export interface WooCampaign {
  id: string;
  /** The checkout code, "PLUS30". */
  code: string;
  /** What the code takes off an eligible line's website price, in percent. */
  percent: number;
  start: string;
  end: string;
  /** The phase running now; null outside the campaign's window. */
  phase: string | null;
  /** The window has closed. */
  over: boolean;
  phases: { id: string; label: string; from: string; to: string }[];
}

export interface WooProduct extends WooPriceFields {
  /** WooCommerce product ID. */
  id: number;
  /** "variable", "simple", ... */
  type: string;
  name: string;
  /** The product's short description. */
  note: string;
  label: WooPromoLabel | null;
  /** The product's own photo in WooCommerce, when it has one (public list). */
  image?: WooPromoImage | null;
  /** Empty for a simple product, whose own price fields apply. */
  variations: WooVariation[];
  /** A special line shown under its category's options (the Aptos model call assessment), never a treatment of its
   *  own and never counted in a "from" price, offer or monthly special (plugin meta `_ndm_pricing_extra`). */
  extra?: boolean;
}

export interface WooCategory<P = WooProduct> {
  /** WooCommerce product category ID. */
  id: number;
  slug: string;
  name: string;
  description: string;
  /** Priced per unit. */
  perUnit: boolean;
  products: P[];
}

/** The most cards the Pricing page's Monthly specials, or the offers carousel, can hold (the plugin refuses more). */
export const SPECIALS_MAX = 24;

/** One card of the Pricing page's Monthly specials, or of the offers carousel (see cms/wp-content/plugins/ndm-pricing/includes/specials.php). It holds no price. */
export interface WooSpecial {
  /** WooCommerce product ID. */
  productId: number;
  /** Card title; empty shows the product's name. */
  name: string;
  /** Which price the card shows: this treatment's lowest, or the lowest of its whole category. */
  scope: PromoScope;
  /** The product's name in WooCommerce. */
  productName: string;
}

export interface WooPricingTree<C = WooCategory> {
  currency: string;
  categories: C[];
  /** The Pricing page's Monthly specials, in order. Absent only when the plugin is older than the list. */
  specials?: WooSpecial[];
  /** The offers carousel (home, Promotion and sale pages), in order. Absent only when the plugin is older than the list. */
  carousel?: WooSpecial[];
  /** The sale campaign, when one is stored in WooCommerce (public list only). */
  campaign?: WooCampaign | null;
  /** WooCommerce's tax for the cart's totals (public list only): the standard rate at the shop's base location. */
  tax?: WooTax;
}

/** Tax as WooCommerce has it (see cms/wp-content/plugins/ndm-pricing/includes/tax.php). */
export interface WooTax {
  /** Whether WooCommerce charges tax on top of the listed prices. */
  enabled: boolean;
  /** Percent: 13 for 13%. 0 when no rate is set. */
  rate: number;
  /** "HST". */
  label: string;
}

/* ---- the management screen: everything, with the display settings ---- */

export interface WooAdminVariation extends WooVariation {
  promo: WooPromoLabel;
  /** Hidden on the Pricing page only. */
  hidden: boolean;
  /** False when the variation is switched off in WooCommerce itself. */
  enabled: boolean;
}

export interface WooAdminProduct extends WooProduct {
  label: WooPromoLabel;
  variations: WooAdminVariation[];
  hidden: boolean;
  /** "publish", "draft", "private". */
  status: string;
  /** Whether options can be added on the management screen (one simple option list). */
  addable: boolean;
  categoryIds: number[];
  /** Its card in Promotions (the Promotion page's offers and the offers wheel); null when it is not shown there. */
  promo: WooProductPromo | null;
  /** The product's own image in WooCommerce: the photo of that card. */
  image: WooPromoImage | null;
}

/** A product's Promotions card, as the price list's management screen edits it. */
export interface WooProductPromo {
  /** Position among the offers, 0 first. */
  order: number;
  /** Card title; empty shows the product's name. */
  name: string;
  text: string;
  area: PromoArea;
  icon: PromoIcon;
  /** Focus point of the photo, "50% 40%". */
  focus: string;
  scope: PromoScope;
  /** The one option the offer's price is read from ("2 zones"); not edited on the screen. */
  option?: string;
  /** A photo uploaded on the screen and not saved yet. */
  imageId?: number;
}

export interface WooAdminCategory extends WooCategory<WooAdminProduct> {
  visible: boolean;
  order: number;
}

export type WooAdminTree = WooPricingTree<WooAdminCategory>;

/** A category is its WooCommerce ID, or the "new-…" ref of one created by the same save. */
export type CategoryRef = number | `new-${string}`;

/** One set of changes for `ndm/v1/pricing/admin/save`. Only what changed is sent. */
export interface PricingPatch {
  createCategories?: { ref: `new-${string}`; name: string; description?: string; visible?: boolean; perUnit?: boolean }[];
  categories?: { id: CategoryRef; name?: string; description?: string; visible?: boolean; perUnit?: boolean; /** The category's full product list, in order. */ products?: number[] }[];
  categoryOrder?: CategoryRef[];
  products?: {
    id: number;
    name?: string;
    note?: string;
    hidden?: boolean;
    label?: WooPromoLabel;
    /** null takes the product out of Promotions; an object puts it there or changes its card. */
    promo?: null | { name: string; text: string; area: PromoArea; icon: PromoIcon; focus: string; scope: PromoScope; position?: number; imageId?: number };
    /** The price of a product without variations. An empty sale price means none. */
    regularPrice?: string;
    salePrice?: string;
    /** New options: each becomes a WooCommerce variation. */
    addVariations?: { ref: `newv-${string}`; name: string; regularPrice: string; salePrice?: string; hidden?: boolean; label?: WooPromoLabel }[];
    /** Options to take away: their variations go to WooCommerce's trash. */
    removeVariations?: number[];
    /** Every variation the product will have (new ones by their ref), in order. */
    variationOrder?: (number | `newv-${string}`)[];
  }[];
  variations?: { id: number; hidden?: boolean; label?: WooPromoLabel; regularPrice?: string; salePrice?: string }[];
  /** The Pricing page's whole Monthly specials list, in its new order. */
  specials?: { productId: number; name: string; scope: PromoScope }[];
  /** The offers carousel's whole list, in its new order. */
  carousel?: { productId: number; name: string; scope: PromoScope }[];
}

export interface PricingSaveResult {
  /** New category refs and the WooCommerce IDs they received. */
  created: Record<string, number>;
  tree: WooAdminTree;
}
