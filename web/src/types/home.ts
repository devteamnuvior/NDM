import type { StartPanel } from "@/config/home-start";
import type { TreatmentTab } from "@/config/home-treatments";
import type { Product } from "@/config/shop";
import type { WPConcernImage, WPConcernProduct } from "@/types/concern";

/** Icons of the hero's proof points and of the Aptos section's chips: the drawings are the site's. */
export type ProofIcon = "physician" | "award" | "clinics" | "analysis";
export type PointIcon = "check" | "thread" | "shield";

/** A section's tag and its two-line heading. */
interface Head {
  tag: string;
  lead: string;
  strong: string;
}

/** The home page's own words and photos, as its sections read them. */
export interface HomeCopy {
  /** The page title and description for search engines. */
  title: string;
  description: string;
  hero: {
    tagline: string;
    lead: string;
    strong: string;
    intro: string;
    /** The words on the second button (the first is always "Book Free Consultation"). */
    button: string;
    proof: { icon: ProofIcon; label: string }[];
    /** Technology and brands in the band along the bottom edge. */
    brands: string[];
  };
  about: Head & {
    /** Shown word by word as the section scrolls into view. */
    text: string;
    /** The word of the text that is set in the brand colour. */
    highlight: string;
    /** `figure` is a whole number with an optional sign after it: "16+". */
    stats: { figure: string; label: string }[];
  };
  /** The panels come from WordPress, else they are the built-in ones (`START_PANELS`). */
  start: Head & { panels: StartPanel[] };
  /** The tabs come from WordPress, else they are the built-in ones (`TREATMENT_TABS`). `allTab` is the first tab, holding every card. */
  treatments: Head & { text: string; allTab: { label: string; all: { href: string; label: string } }; tabs: TreatmentTab[] };
  aptos: Head & {
    intro: string;
    /** The chip on the figure: "Up to" "24" "months of lift and support". */
    chip: { before: string; number: string; after: string };
    /** `fill` is how far the ring fills, in percent. `spoken` is the full sentence for screen readers. */
    dials: { value: string; unit: string; label: string; spoken: string; fill: string }[];
    points: { icon: PointIcon; label: string }[];
    areas: Head & { text: string; photos: { src: string; label: string; alt: string }[] };
  };
  space: Head;
  team: Head & { text: string };
  results: Head & { text: string };
  process: Head & { steps: { title: string; text: string; button: string }[] };
  reviews: Head & { note: string };
  visit: Head & { text: string };
  faq: Head & { intro: string; items: [question: string, answer: string][] };
  booking: { lead: string; strong: string; text: string };
  /** `link` is the button's address; the products come from WordPress, else they are the built-in ones (`PRODUCTS`). */
  shop: Head & { text: string; button: string; link: string; products: Product[] };
  journal: Head;
  social: Head & { text: string; button: string; note: string };
}

/** A panel of "Where would you like to start?" as WordPress serves it. */
export interface WPStartPanel {
  title: string;
  sub: string;
  heading: string;
  text: string;
  /** With WordPress's own sizes of the photo. */
  image: (WPConcernImage & { srcset?: string }) | null;
  position: string;
  position_open: string;
  concerns: {
    label: string;
    title: string;
    lede: string;
    /** `product` is the picked WooCommerce product (null for a category or nothing picked). */
    options: { price_source: string; product: WPConcernProduct | null; name: string; what: string; link: string }[];
    facts: { term: string; text: string }[];
    note: string;
    more_label: string;
    more_link: string;
  }[];
  link_label: string;
  link: string;
}

/** A tab of "Treatments, by what they do" as WordPress serves it. */
export interface WPTreatTab {
  label: string;
  all_label: string;
  all_link: string;
  cards: {
    price_source: string;
    /** The picked WooCommerce product (null for a category or nothing picked); its image comes with WordPress's sizes. */
    product: (WPConcernProduct & { image: (WPConcernImage & { srcset?: string }) | null }) | null;
    name: string;
    text: string;
    image: (WPConcernImage & { srcset?: string }) | null;
    tag: string;
    link: string;
    price_note: string;
  }[];
}

/**
 * The home page as WordPress serves it (`ndm/v1/home-page`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/home.php): the page chosen as the homepage under
 * Settings > Reading, with the fields of its edit screen.
 */
export interface WPHomePage {
  id: number;
  /** The page's name in the admin only. */
  title: string;
  modified: string;
  content: {
    hero_tagline: string;
    hero_lead: string;
    hero_strong: string;
    hero_intro: string;
    hero_button: string;
    hero_proof: { icon: string; label: string }[];
    hero_brands: string[];
    seo_title: string;
    seo_description: string;
    about_tag: string;
    about_lead: string;
    about_strong: string;
    about_text: string;
    about_highlight: string;
    about_stats: { figure: string; label: string }[];
    start_tag: string;
    start_lead: string;
    start_strong: string;
    start_panels: WPStartPanel[];
    treat_tag: string;
    treat_lead: string;
    treat_strong: string;
    treat_text: string;
    treat_all_tab: string;
    treat_all_button: string;
    treat_all_link: string;
    treat_tabs: WPTreatTab[];
    aptos_tag: string;
    aptos_lead: string;
    aptos_strong: string;
    aptos_intro: string;
    aptos_chip_before: string;
    aptos_chip_number: string;
    aptos_chip_after: string;
    aptos_dials: { value: string; unit: string; label: string; spoken: string; fill: string }[];
    aptos_points: { icon: string; label: string }[];
    areas_tag: string;
    areas_lead: string;
    areas_strong: string;
    areas_text: string;
    areas_photos: { image: WPConcernImage | null; label: string }[];
    space_tag: string;
    space_lead: string;
    space_strong: string;
    team_tag: string;
    team_lead: string;
    team_strong: string;
    team_text: string;
    results_tag: string;
    results_lead: string;
    results_strong: string;
    results_text: string;
    process_tag: string;
    process_lead: string;
    process_strong: string;
    process_steps: { title: string; text: string; button: string }[];
    reviews_tag: string;
    reviews_lead: string;
    reviews_strong: string;
    reviews_note: string;
    visit_tag: string;
    visit_lead: string;
    visit_strong: string;
    visit_text: string;
    faq_tag: string;
    faq_lead: string;
    faq_strong: string;
    faq_intro: string;
    faqs: { q: string; a: string }[];
    book_lead: string;
    book_strong: string;
    book_text: string;
    shop_tag: string;
    shop_lead: string;
    shop_strong: string;
    shop_text: string;
    shop_button: string;
    shop_link: string;
    shop_products: { name: string; size: string; image: WPConcernImage | null; link: string }[];
    journal_tag: string;
    journal_lead: string;
    journal_strong: string;
    social_tag: string;
    social_lead: string;
    social_strong: string;
    social_text: string;
    social_button: string;
    social_note: string;
  };
}
