/** One product of the online skincare shop (shop.newdermamedlaserclinic.com), as the /shop page shows it. */
export interface ShopProduct {
  id: number;
  /** The product's slug on the store: its page here is /shop/<slug>. */
  slug: string;
  sku: string;
  name: string;
  /** The product's page on the shop. */
  link: string;
  /** The shop's cart with this product added (WooCommerce's `?add-to-cart=`): checkout happens there. */
  addToCart: string;
  brand: string;
  /** WooCommerce product categories ("Pigment Control", "Postcare"). */
  categories: string[];
  /** Size or contents ("30 ml (1.0 fl. oz.)"). */
  size: string;
  /** The shop's one-line description. */
  text: string;
  /** Prices in cents (CAD): what it costs now, and before a sale. */
  price: number;
  regular: number;
  onSale: boolean;
  inStock: boolean;
  /** Published in the last 30 days (the shop's "New Arrivals"). */
  isNew: boolean;
  /** Place in the shop's own newest-first order (0 is the newest). */
  newest: number;
  image: ShopImage | null;
  /** The second photo, shown when a card is hovered. */
  image2: ShopImage | null;
  /** Every photo of the product (the first is `image`). */
  gallery: ShopImage[];
  /** The store's full description (plain text, paragraphs split by a blank line). */
  description: string;
  /** "Dermaceutic: Cosmeceuticals" */
  line: string;
  concerns: string[];
  skinTypes: string[];
  ingredients: string[];
  productTypes: string[];
  areas: string[];
}

export interface ShopImage {
  src: string;
  srcSet: string;
  /** The largest copy (up to 1024px), for zoom. */
  large: string;
}

/** What a product card needs: the product without its long text and photos (the list sends less to the browser). */
export type ShopCard = Omit<ShopProduct, "description" | "gallery">;

/** The sale campaign as the shop's header shows it (WooCommerce's campaign on the clinic site), when one runs. */
export interface ShopSale {
  /** The phase running now ("VIP Sale") and the Black Friday phase itself. */
  now: { label: string; to: number } | null;
  blackFriday: { label: string; from: number; to: number; days: string };
  /** "Up to 70% off selected treatments" */
  headline: string;
  /** The sale page for the phase running now, and its button's words. */
  link: string;
  cta: string;
}

/** The filters the page offers: one list of options per kind, with how many products carry each. */
export type ShopFacetId = "brand" | "category" | "concern" | "skin" | "type" | "ingredient" | "area";

export interface ShopFacet {
  id: ShopFacetId;
  label: string;
  options: { value: string; count: number }[];
}

export interface ShopCatalog {
  /** False when the shop could not be reached: the page then points to the shop itself. */
  ok: boolean;
  products: ShopCard[];
  facets: ShopFacet[];
  /** The address of the shop's own listing and of its cart. */
  storeUrl: string;
  cartUrl: string;
}
