import type { WPConcernImage } from "@/types/concern";

/** A procedure in the list of procedures (`ndm/v1/procedures`). */
export interface WPProcedureSummary {
  /** The post's slug; its address on the site is the post type's folder and the slug ("/injectables/botox", `procedurePath`). */
  slug: string;
  title: string;
  /** The post type's name in WordPress: "Procedures", "Injectables", "Laser", "Body", "Veins" or "Hair". Missing on a WordPress without the procedure lists. */
  type?: string;
}

/**
 * A procedure as WordPress serves it (`ndm/v1/procedures/<slug>`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/procedures.php): a post of the type "Procedures"
 * with the fields of its edit screen. Only what belongs to this procedure; what every procedure page
 * shares is in `@/config/procedure`. It holds no price: a row of `price_list` only says which
 * WooCommerce product the price list shows.
 */
export interface WPProcedure extends WPProcedureSummary {
  id: number;
  modified: string;
  /** The day of the last save: ["2026-11-10", "November 10, 2026"]. */
  updated: [iso: string, text: string];
  /** The wide header photo (the featured image). */
  hero: WPConcernImage | null;
  content: {
    heading_1: string;
    heading_2: string;
    intro: string;
    hero_mobile: WPConcernImage | null;
    hero_position: string;
    /** The step before the name in the breadcrumb ("Injectables"). */
    group: string;
    facts: { label: string; value: string }[];
    offer_title: string;
    seo_title: string;
    seo_description: string;
    benefits_lead: string;
    benefits_strong: string;
    benefits_text: string[];
    benefits_chips: string[];
    benefits_note: string;
    benefits_image: WPConcernImage | null;
    benefits_diagram: boolean;
    about_lead: string;
    about_strong: string;
    tabs: { label: string; figure: string; figure_label: string; text: string[]; link: string; link_label: string }[];
    choose_lead: string;
    choose_strong: string;
    choose_image: WPConcernImage | null;
    cards: { title: string; text: string }[];
    reel_video: string;
    reel_poster: WPConcernImage | null;
    reel_text: string;
    /** Before and after photos: the cases of the "Before & After" post type chosen for this procedure, in order. */
    cases: { id: number; title: string; label: string; image: WPConcernImage }[];
    prices_lead: string;
    prices_strong: string;
    /** The products the price list shows, in order. */
    price_list: {
      /** The WooCommerce product or category picked: "product:<id>" or "category:<slug>". */
      price_source: string;
      /** Title of the group; empty: the product's name. */
      name: string;
      /** Text under the title; empty: the product's short description. */
      blurb: string;
      /** The picked product's own name and short description. Null for a category or a product that is gone. */
      product: { id: number; name: string; description: string; image: WPConcernImage | null } | null;
    }[];
    guide_lead: string;
    guide_strong: string;
    guide_intro: string;
    guide: { q: string; a: string[]; list: string[] }[];
    related: { name: string; kind: string; image: WPConcernImage | null }[];
    faqs: { q: string; a: string }[];
  };
}
