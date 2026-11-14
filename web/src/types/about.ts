import type { WPConcernImage } from "@/types/concern";

/** A photo of the About page's gallery. */
export interface GalleryPhoto {
  src: string;
  /** Shown in the viewer. */
  title: string;
  alt: string;
}

/** The About page's own words and photos, as its sections read them. */
export interface AboutCopy {
  /** The page title and description for search engines. */
  title: string;
  description: string;
  header: {
    tag: string;
    lead: string;
    strong: string;
    text: string;
    /** `figure` is a whole number with an optional sign after it: "16+". */
    stats: { figure: string; unit: string; label: string }[];
  };
  team: { tag: string; lead: string; strong: string; intro: string };
  clinics: { tag: string; lead: string; strong: string };
  gallery: { photos: GalleryPhoto[]; tag: string; line: string; lead: string; strong: string; text: string };
  faq: { tag: string; lead: string; strong: string; intro: string; items: [question: string, answer: string][] };
  contact: { tag: string; lead: string; strong: string; text: string };
}

/**
 * The About page as WordPress serves it (`ndm/v1/about-page`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/about.php): the standard WordPress page with the
 * template "About page" (or the slug "about"), with the fields of its edit screen.
 */
export interface WPAboutPage {
  id: number;
  /** The page's slug in WordPress; the address on the site is always /about. */
  slug: string;
  /** The page's name in the admin only. */
  title: string;
  modified: string;
  content: {
    header_tag: string;
    heading_1: string;
    heading_2: string;
    intro: string;
    stats: { figure: string; unit: string; label: string }[];
    seo_title: string;
    seo_description: string;
    team_tag: string;
    team_lead: string;
    team_strong: string;
    team_intro: string;
    clinics_tag: string;
    clinics_lead: string;
    clinics_strong: string;
    photos: { image: WPConcernImage | null; title: string }[];
    awards_tag: string;
    awards_line: string;
    awards_lead: string;
    awards_strong: string;
    awards_text: string;
    faq_tag: string;
    faq_lead: string;
    faq_strong: string;
    faq_intro: string;
    faqs: { q: string; a: string }[];
    contact_tag: string;
    contact_lead: string;
    contact_strong: string;
    contact_text: string;
  };
}
