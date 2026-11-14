import type { WPConcernImage } from "@/types/concern";

/** One rotating message in the announcement bar. `phones` is the built-in clinic phone numbers message. */
export type Announcement =
  | { id: string; kind: "message"; text: string; cta?: string; href: string; external?: boolean }
  | { id: string; kind: "phones" };

export type SocialNetwork = "instagram" | "facebook" | "youtube" | "x" | "linkedin";

/** The general settings of the site (WordPress: Site Settings), as the header and footer read them. */
export interface SiteSettings {
  header: {
    announcement: {
      hidden: boolean;
      /** Small pill before the messages; empty: none. */
      badge: string;
      /** Time each message stays on screen. */
      seconds: number;
      /** Wide screens (1024px and up): the sentence, then its link. */
      desktop: Announcement[];
      /** Phones and tablets: shorter messages, the whole line is the link. */
      mobile: Announcement[];
      /** The shop link at the right on wide screens; empty: none. */
      shopLabel: string;
    };
    bookLabel: string;
    bookShort: string;
    /** The skincare shop: the menu item, the phone menu and the announcement bar open it in a new tab. */
    shopLink: string;
  };
  footer: {
    film: { src: string; poster: string };
    cta: { lead: string; strong: string; text: string; book: string; second: { label: string; link: string } | null };
    about: string;
    badges: { award: string; years: string };
    /** `link` empty: the page with this name (resolved like the menu's labels). */
    columns: { title: string; links: { label: string; link: string }[] }[];
    contactTitle: string;
    email: string;
    copyright: string;
    /** Empty address: no icon. */
    social: Record<SocialNetwork, string>;
  };
}

/** GET ndm/v1/site-settings. */
export interface WPSiteSettings {
  modified: string;
  content: {
    announce_hide: boolean;
    announce_badge: string;
    announce_seconds: string;
    announce_desktop: { text: string; link_label: string; link: string }[];
    announce_mobile: { kind: "Message" | "Clinic phone numbers"; text: string; link_label: string; link: string; new_tab: boolean }[];
    shop_label: string;
    book_label: string;
    book_short: string;
    shop_link: string;
    cta_lead: string;
    cta_strong: string;
    cta_text: string;
    cta_book: string;
    cta_second_label: string;
    cta_second_link: string;
    film_video: string;
    film_poster: WPConcernImage | null;
    about_text: string;
    badge_award: string;
    badge_years: string;
    columns: { title: string; links: { label: string; link: string }[] }[];
    contact_title: string;
    email: string;
    copyright: string;
    social_instagram: string;
    social_facebook: string;
    social_youtube: string;
    social_x: string;
    social_linkedin: string;
  };
}
