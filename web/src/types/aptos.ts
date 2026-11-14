import type { WPConcernImage } from "@/types/concern";

/**
 * The Aptos Thread Lift page as WordPress serves it (`ndm/v1/aptos-page`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/aptos.php): a standard page with the template
 * "Aptos Thread Lift page" and the fields of its edit screen. It holds no price: a row of `price_list` only says which WooCommerce
 * product the price list shows, and `cases` are entries of the "Before & After" post type.
 */
export interface WPAptosPage {
  id: number;
  /** Its address on the site, always "aptos-thread-lift" (whatever the page's slug in the admin). */
  slug: string;
  title: string;
  modified: string;
  /** The wide header photo (the featured image). */
  hero: WPConcernImage | null;
  content: {
    heading_1: string;
    heading_2: string;
    intro: string;
    hero_mobile: WPConcernImage | null;
    hero_position: string;
    facts: { label: string; value: string }[];
    seo_title: string;
    seo_description: string;
    what_tag: string;
    what_lead: string;
    what_strong: string;
    what_text: string[];
    what_note: string;
    what_image: WPConcernImage | null;
    what_position: string;
    what_ring: string;
    what_points: { title: string; text: string }[];
    how_tag: string;
    how_lead: string;
    how_strong: string;
    how_text: string;
    how_steps: { title: string; text: string }[];
    safety_tag: string;
    safety_lead: string;
    safety_strong: string;
    safety_text: string[];
    safeguards: string[];
    product_image: WPConcernImage | null;
    product_tag: string;
    product_name: string;
    product_note: string;
    lasting_lead: string;
    lasting_strong: string;
    lasting_text: string;
    lasting_figure: string;
    lasting_unit: string;
    lasting_label: string;
    lasting_note: string;
    fit_tag: string;
    fit_lead: string;
    fit_strong: string;
    fit_text: string;
    fit_yes: string[];
    fit_no: string[];
    fit_image: WPConcernImage | null;
    fit_position: string;
    expect_lead: string;
    expect_strong: string;
    expect_steps: { when: string; title: string; text: string }[];
    results_lead: string;
    results_strong: string;
    results_text: string;
    /** Before and after photos: the cases of the "Before & After" post type chosen for this page, in order. */
    cases: { id: number; title: string; label: string; image: WPConcernImage }[];
    care_lead: string;
    care_strong: string;
    care_text: string;
    care_before: string[];
    care_after: string[];
    pair_tag: string;
    pair_lead: string;
    pair_strong: string;
    pair_text: string;
    pair_groups: { when: string; treatments: string[] }[];
    pair_links: { name: string; menu: string; tag: string; image: WPConcernImage | null; line: string }[];
    prices_lead: string;
    prices_strong: string;
    prices_intro: string;
    /** The products the price list shows, in order. */
    price_list: {
      /** The WooCommerce product or category picked: "product:<id>" or "category:<slug>". */
      price_source: string;
      /** Title of the group; empty: the product's name. */
      name: string;
      /** Text under the title; empty: the product's short description. */
      blurb: string;
      /** Names of the product's options the page shows; empty: all of them. */
      options: string[];
    }[];
    sessions_figure: string;
    sessions_unit: string;
    sessions_text: string;
    sessions_chips: string[];
    why_lead: string;
    why_strong: string;
    why_items: { figure: string; unit: string; text: string }[];
    faq_lead: string;
    faq_strong: string;
    faq_intro: string;
    faqs: { q: string; a: string }[];
  };
}
