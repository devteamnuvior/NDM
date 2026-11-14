import "server-only";
import { SITE_SETTINGS } from "@/config/site-settings";
import { getSiteSettingsRaw, settle } from "@/lib/wordpress";
import { toSlug } from "@/lib/routes";
import type { Announcement, MenuGroup, MenuItem, SiteMenu, SiteSettings, SocialNetwork, WPSiteSettings } from "@/types/site-settings";

const NETWORKS: SocialNetwork[] = ["instagram", "facebook", "youtube", "x", "linkedin"];

/** Seconds a message stays: a number from 2 to 20, else the built-in time. */
function seconds(raw: string): number {
  const n = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 2 && n <= 20 ? n : SITE_SETTINGS.header.announcement.seconds;
}

/** WordPress trims what is typed: the words and their link words get back the space between them. */
const spaced = (text: string, cta: string) => (text && cta && !/\s$/.test(text) ? `${text} ` : text);

const MENU_KINDS: Record<WPSiteSettings["content"]["menu_items"][number]["kind"], MenuItem["kind"]> = {
  Link: "link",
  "Procedures panel": "procedures",
  "Concerns panel": "concerns",
  "About panel": "about",
  "Skincare shop": "shop",
};

/** Groups as the panels read them: links without words, and groups left with no link, are left out. */
function groups(list: WPSiteSettings["content"]["concerns_groups"]): MenuGroup[] {
  return list.map((g) => ({ title: g.title, items: g.items.filter((it) => it.label) })).filter((g) => g.items.length);
}

/** The menu of the WordPress settings. An empty list falls back to the built-in one, an empty label to the built-in words. */
function menuFromWordPress(c: WPSiteSettings["content"]): SiteMenu {
  const d = SITE_SETTINGS.menu;
  const items = c.menu_items.filter((m) => m.label).map((m): MenuItem => ({ label: m.label, kind: MENU_KINDS[m.kind] ?? "link", link: m.link, newTab: m.new_tab }));
  const used = new Set<string>();
  const categories = c.proc_categories
    .filter((cat) => cat.label)
    .map((cat) => {
      /* the id only tells the categories apart: a name used twice gets a number */
      let id = toSlug(cat.label) || "category";
      for (let n = 2; used.has(id); n++) id = `${toSlug(cat.label)}-${n}`;
      used.add(id);
      return { id, label: cat.label, link: cat.link, blurb: cat.blurb, aptos: cat.layout === "Aptos (NAMICA card)", groups: groups(cat.groups) };
    });
  const concernGroups = groups(c.concerns_groups);
  const aboutLinks = c.about_links.filter((l) => l.label);
  return {
    items: items.length ? items : d.items,
    procedures: {
      categories: categories.length ? categories : d.procedures.categories,
      card: { tag: c.proc_card_tag || d.procedures.card.tag, title: c.proc_card_title || d.procedures.card.title, photo: c.proc_card_photo?.src ?? "" },
    },
    aptos: {
      tag: c.aptos_tag || d.aptos.tag,
      title: c.aptos_title || d.aptos.title,
      subtitle: c.aptos_subtitle,
      badge: c.aptos_badge,
      link: c.aptos_link || d.aptos.link,
    },
    concerns: {
      title: c.concerns_title || d.concerns.title,
      text: c.concerns_text,
      groups: concernGroups.length ? concernGroups : d.concerns.groups,
      card: { tag: c.concerns_card_tag || d.concerns.card.tag, title: c.concerns_card_title || d.concerns.card.title, photo: c.concerns_card_photo?.src ?? "" },
    },
    about: {
      links: aboutLinks.length ? aboutLinks : d.about.links,
      photos: { uptown: c.about_photo_uptown?.src ?? "", downtown: c.about_photo_downtown?.src ?? "" },
      cardLink: c.about_card_link || d.about.cardLink,
    },
  };
}

/** The WordPress settings as the header and footer read them. Rules are written beside each field in WordPress. */
function fromWordPress(wp: WPSiteSettings): SiteSettings {
  const c = wp.content;
  const d = SITE_SETTINGS;

  const desktop: Announcement[] = c.announce_desktop
    .filter((m) => m.text || m.link_label)
    .map((m, i) => ({ id: `d${i}`, kind: "message", text: spaced(m.text, m.link_label), cta: m.link_label || undefined, href: m.link || "#" }));
  const mobile: Announcement[] = c.announce_mobile.flatMap((m, i): Announcement[] => {
    if (m.kind === "Clinic phone numbers") return [{ id: `m${i}`, kind: "phones" }];
    if (!m.text && !m.link_label) return [];
    return [{ id: `m${i}`, kind: "message", text: spaced(m.text, m.link_label), cta: m.link_label || undefined, href: m.link || "#", external: m.new_tab || undefined }];
  });

  const columns = c.columns
    .map((col) => ({ title: col.title, links: col.links.filter((l) => l.label) }))
    .filter((col) => col.title || col.links.length);

  return {
    header: {
      announcement: {
        /* no message in either list: nothing to show */
        hidden: c.announce_hide || (!desktop.length && !mobile.length),
        badge: c.announce_badge,
        seconds: seconds(c.announce_seconds),
        desktop: desktop.length ? desktop : mobile,
        mobile: mobile.length ? mobile : desktop,
        shopLabel: c.shop_label,
      },
      bookLabel: c.book_label || d.header.bookLabel,
      bookShort: c.book_short || d.header.bookShort,
      shopLink: c.shop_link || d.header.shopLink,
    },
    footer: {
      film: { src: c.film_video || d.footer.film.src, poster: c.film_poster?.src || d.footer.film.poster },
      cta: {
        lead: c.cta_lead || d.footer.cta.lead,
        strong: c.cta_strong || d.footer.cta.strong,
        text: c.cta_text,
        book: c.cta_book || d.footer.cta.book,
        second: c.cta_second_label ? { label: c.cta_second_label, link: c.cta_second_link || "#" } : null,
      },
      about: c.about_text,
      badges: { award: c.badge_award, years: c.badge_years },
      columns: columns.length ? columns : d.footer.columns,
      contactTitle: c.contact_title || d.footer.contactTitle,
      email: c.email,
      copyright: c.copyright,
      social: Object.fromEntries(NETWORKS.map((n) => [n, c[`social_${n}`]])) as Record<SocialNetwork, string>,
    },
    /* settings saved before the Menu tab existed hold no menu fields: the built-in menu */
    menu: c.menu_items ? menuFromWordPress(c) : d.menu,
  };
}

/**
 * The header and footer settings: WordPress's Site Settings, or the built-in ones when WordPress cannot
 * be reached or the settings were never saved.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const read = await settle(getSiteSettingsRaw);
  return read.ok && read.data ? fromWordPress(read.data) : SITE_SETTINGS;
}
