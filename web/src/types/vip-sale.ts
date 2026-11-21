import type { WPConcernImage } from "@/types/concern";

import type { SaleCopy } from "@/types/sale";

/** The VIP Sale page's own settings and words, as the page reads them (WordPress, or the built-in copy). */
export type VipSaleCopy = SaleCopy;

/** The sale's dates in words, worked out from its first and last minute (Toronto time). */
export interface SaleWords {
  /** "Friday, Nov 27 to Monday, Nov 30" */
  full: string;
  /** "Nov 27 to 30" */
  short: string;
  /** "November 27 to 30" */
  long: string;
  /** "Fri, Nov 27" and "Mon, Nov 30" */
  startDay: string;
  endDay: string;
  /** "November 30" */
  end: string;
  /** Number of days, first and last included. */
  days: number;
  /** "Friday to Monday" */
  span: string;
}

/**
 * The VIP Sale page as WordPress serves it (`ndm/v1/vip-sale-page`, see
 * cms/wp-content/mu-plugins/ndm-headless/includes/vip-sale.php): the standard WordPress page with the
 * template "VIP Sale page" (or the slug "vip-sale"), with the fields of its edit screen.
 */
export interface WPVipSalePage {
  id: number;
  slug: string;
  title: string;
  modified: string;
  content: {
    sale_name: string;
    starts: string;
    ends: string;
    heading_1: string;
    heading_2: string;
    offer_words: string;
    intro: string;
    gift: string;
    photo: WPConcernImage | null;
    seo_title: string;
    seo_description: string;
    noindex: boolean;
    tape: string[];
    how: { title: string; text: string }[];
    concerns_lead: string;
    concerns_strong: string;
    concerns_text: string;
    /** `category` is "category:<slug>". */
    concerns: { name: string; text: string; categories: { category: string }[] }[];
    deals_lead: string;
    deals_strong: string;
    deals_text: string;
    groups: { category: string; tab: string }[];
    specials_tag: string;
    specials_lead: string;
    specials_strong: string;
    specials_count: string;
    plan_lead: string;
    plan_strong: string;
    plan_note: string;
    clinics_tag: string;
    clinics_lead: string;
    clinics_strong: string;
    footer_lead: string;
    footer_text: string;
    footer_terms: string;
  };
}
