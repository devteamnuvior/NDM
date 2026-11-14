import "server-only";
import { SITE_SETTINGS } from "@/config/site-settings";
import { getSiteSettingsRaw, settle } from "@/lib/wordpress";
import type { Announcement, SiteSettings, SocialNetwork, WPSiteSettings } from "@/types/site-settings";

const NETWORKS: SocialNetwork[] = ["instagram", "facebook", "youtube", "x", "linkedin"];

/** Seconds a message stays: a number from 2 to 20, else the built-in time. */
function seconds(raw: string): number {
  const n = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 2 && n <= 20 ? n : SITE_SETTINGS.header.announcement.seconds;
}

/** WordPress trims what is typed: the words and their link words get back the space between them. */
const spaced = (text: string, cta: string) => (text && cta && !/\s$/.test(text) ? `${text} ` : text);

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
