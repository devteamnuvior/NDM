import type { TreatmentPage, TxHeroContent, TxResultsContent, TxWhyContent } from "@/types/treatment";

/** One treatment option of a concern: a card in Options and a row in Side by side. */
export interface ConcernOption {
  key: string;
  name: string;
  role: "Primary" | "Supporting" | "Combination" | "Bio-stimulator";
  /** What it often suits. */
  fit: string;
  line: string;
  /** "From $245", from WooCommerce; empty when the treatment has no product there. Never typed. */
  price: string;
  priceHref: string;
  /** The treatment's own page. */
  href: string;
  img: string;
  visit: string;
  course: string;
  down: string;
  res: string;
}

/** Content of a concern page. The header, glance card, section bar and several sections are the treatment pages'. */
export interface ConcernPage extends TxHeroContent {
  /** The concern's name, used inside sentences and headings. */
  short: string;
  crumbs: string[];
  facts: [label: string, value: string][];
  nav: [id: string, label: string][];
  lede: string[];
  /** Pages on the site about this concern. */
  pages: { name: string; href: string }[];
  /** Link the before & after gallery in the Overview card. */
  gallery: boolean;
  notice: string[];
  cause: string[];
  assess: { text: string; points: string[] };
  options: ConcernOption[];
  bio: ConcernOption[];
  /** The note about prescription treatments, with their pages. */
  rx: { text: string; links: { name: string; href: string }[] };
  compare: ConcernOption[];
  expect: TreatmentPage["expect"];
  results: TxResultsContent;
  home: { title: string; category: string; text: string; product?: { name: string; size: string; img: string; href: string } }[];
  articles: { title: string; href: string; date: string; topic: string; img: string; excerpt: string }[];
  /** Related treatments: `menu` is the menu label whose page the card opens, unless `href` names the page. */
  related: { name: string; menu: string; img: string; kind: string; href?: string }[];
  why: TxWhyContent;
  faqs: [question: string, answer: string][];
}

/** A photo of WordPress's media library. */
export interface WPConcernImage {
  id: number;
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** A WooCommerce product picked in a row: its own name, short description, first category and image. */
export interface WPConcernProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  image: WPConcernImage | null;
}

/** A concern in the list of concerns (`ndm/v1/concerns`). */
export interface WPConcernSummary {
  /** Its address on the site: "/<slug>". */
  slug: string;
  title: string;
}

/**
 * A concern as WordPress serves it (`ndm/v1/concerns/<slug>`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/concerns.php): a post of the type "Concerns" with
 * the fields of its edit screen. Only what belongs to this concern; what every concern page shares is
 * in `@/config/concern`.
 */
export interface WPConcern extends WPConcernSummary {
  id: number;
  modified: string;
  /** The wide header photo (the featured image). */
  hero: WPConcernImage | null;
  content: {
    heading_1: string;
    heading_2: string;
    intro: string;
    hero_mobile: WPConcernImage | null;
    hero_position: string;
    seo_title: string;
    seo_description: string;
    lede: string[];
    pages: { name: string; link: string }[];
    gallery: boolean;
    notice: string[];
    cause: string[];
    assess_text: string;
    assess_points: string[];
    options: {
      name: string;
      role: string;
      image: WPConcernImage | null;
      fit: string;
      line: string;
      link: string;
      price_link: string;
      /** The WooCommerce product or category picked for it: "product:<id>", "category:<slug>", or empty (priced by its title). */
      price_source: string;
      /** The picked product's own name, short description and image: used for the title, summary and image left empty. Null for a category or no pick. */
      product: WPConcernProduct | null;
      visit: string;
      course: string;
      down: string;
      res: string;
    }[];
    rx_text: string;
    rx_links: { name: string; link: string }[];
    expect: { when: string; title: string; text: string }[];
    /** Before and after photos: the cases of the "Before & After" post type chosen for this concern, in order. `label` is the case's first category. */
    cases: { id: number; title: string; label: string; image: WPConcernImage }[];
    home: { title: string; category: string; text: string; product_name: string; product_size: string; product_image: string; product_link: string }[];
    /** From the journal: the WordPress posts chosen for this concern, in order (published ones only). */
    journal: { id: number; slug: string; title: string; /** "November 7, 2025" */ date: string; /** First category; empty when it has none. */ topic: string; image: WPConcernImage | null; excerpt: string }[];
    /**
     * Related treatments: each row is a WooCommerce product searched and picked ("product:<id>"), with an
     * optional title, tag and image that replace the product's name, category and image. A row without
     * a pick shows what was typed.
     */
    related: { price_source: string; name: string; kind: string; image: WPConcernImage | null; link: string; product: WPConcernProduct | null }[];
    faqs: { q: string; a: string }[];
  };
}
