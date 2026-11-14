import type { WPConcernImage } from "@/types/concern";

/** One rotating message in the announcement bar. `phones` is the built-in clinic phone numbers message. */
export type Announcement =
  | { id: string; kind: "message"; text: string; cta?: string; href: string; external?: boolean }
  | { id: string; kind: "phones" };

export type SocialNetwork = "instagram" | "facebook" | "youtube" | "x" | "linkedin";

/** A link of a menu panel. `link` empty: the page with this name (a WordPress post with that slug, else the route table). */
export interface MenuLink {
  label: string;
  link: string;
}

/** A column of a panel; `title` empty: no small title above it. */
export interface MenuGroup {
  title: string;
  items: MenuLink[];
}

/** A category of the Procedures panel. */
export interface MenuCategory {
  id: string;
  label: string;
  /** Where the category's title links; empty: the page with its name, if one exists. */
  link: string;
  blurb: string;
  /** The Aptos layout: the first group's links beside the NAMICA card. */
  aptos: boolean;
  groups: MenuGroup[];
}

/** The photo card at the right of a panel. `photo` empty: the built-in photo. */
export interface MenuCard {
  tag: string;
  title: string;
  photo: string;
}

/** A top-level menu item: a link, one of the three panels, or the skincare shop (Header Bar's address, new tab). */
export interface MenuItem {
  label: string;
  kind: "link" | "procedures" | "concerns" | "about" | "shop";
  /** `link` kind only; empty: the page with this name. */
  link: string;
  newTab: boolean;
}

export interface SiteMenu {
  items: MenuItem[];
  procedures: { categories: MenuCategory[]; card: MenuCard };
  aptos: { tag: string; title: string; subtitle: string; badge: string; link: string };
  concerns: { title: string; text: string; groups: MenuGroup[]; card: MenuCard };
  /** `photos` empty: the built-in clinic photos. */
  about: { links: MenuLink[]; photos: { uptown: string; downtown: string }; cardLink: string };
}

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
  /** The header's menu: the top items, the three panels and the phone menu. */
  menu: SiteMenu;
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
    menu_items: { label: string; kind: "Link" | "Procedures panel" | "Concerns panel" | "About panel" | "Skincare shop"; link: string; new_tab: boolean }[];
    proc_categories: { label: string; link: string; blurb: string; layout: "Treatment list" | "Aptos (NAMICA card)"; groups: WPMenuGroup[] }[];
    proc_card_tag: string;
    proc_card_title: string;
    proc_card_photo: WPConcernImage | null;
    aptos_tag: string;
    aptos_title: string;
    aptos_subtitle: string;
    aptos_badge: string;
    aptos_link: string;
    concerns_title: string;
    concerns_text: string;
    concerns_groups: WPMenuGroup[];
    concerns_card_tag: string;
    concerns_card_title: string;
    concerns_card_photo: WPConcernImage | null;
    about_links: MenuLink[];
    about_photo_uptown: WPConcernImage | null;
    about_photo_downtown: WPConcernImage | null;
    about_card_link: string;
  };
}

interface WPMenuGroup {
  title: string;
  items: MenuLink[];
}
