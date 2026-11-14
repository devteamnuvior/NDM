#!/usr/bin/env node
/* Prints the site's built-in header and footer settings (src/config/site-settings.json) as the fields of
   WordPress's Site Settings screen. The film poster is an https address the import puts into the media
   library.

   Left out on purpose, because the site fills them in: the logo, the two clinics (names, addresses,
   hours, phone numbers), the Privacy, Terms and Refunds links. The menu panels' photos are left empty,
   so the site keeps its built-in (optimized) photos until someone picks others.

   One-time import (settings that were saved already are kept; --fill-empty fills their empty fields):
     node scripts/export-site-settings.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm settings-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const s = JSON.parse(readFileSync(fileURLToPath(new URL("../src/config/site-settings.json", import.meta.url)), "utf8"));
const { header: h, footer: f, menu: m } = s;
const KINDS = { link: "Link", procedures: "Procedures panel", concerns: "Concerns panel", about: "About panel", shop: "Skincare shop" };
const bar = h.announcement;

const content = {
  announce_hide: bar.hidden,
  announce_badge: bar.badge,
  announce_seconds: String(bar.seconds),
  announce_desktop: bar.desktop.map((m) => ({ text: m.text, link_label: m.cta ?? "", link: m.href })),
  announce_mobile: bar.mobile.map((m) =>
    m.kind === "phones"
      ? { kind: "Clinic phone numbers", text: "", link_label: "", link: "", new_tab: false }
      : { kind: "Message", text: m.text, link_label: m.cta ?? "", link: m.href, new_tab: !!m.external },
  ),
  shop_label: bar.shopLabel,
  book_label: h.bookLabel,
  book_short: h.bookShort,
  shop_link: h.shopLink,
  cta_lead: f.cta.lead,
  cta_strong: f.cta.strong,
  cta_text: f.cta.text,
  cta_book: f.cta.book,
  cta_second_label: f.cta.second?.label ?? "",
  cta_second_link: f.cta.second?.link ?? "",
  film_video: f.film.src,
  film_poster: { file: f.film.poster, alt: "" },
  about_text: f.about,
  badge_award: f.badges.award,
  badge_years: f.badges.years,
  columns: f.columns,
  contact_title: f.contactTitle,
  email: f.email,
  copyright: f.copyright,
  ...Object.fromEntries(Object.entries(f.social).map(([net, href]) => [`social_${net}`, href])),
  menu_items: m.items.map((i) => ({ label: i.label, kind: KINDS[i.kind], link: i.link, new_tab: i.newTab })),
  proc_categories: m.procedures.categories.map((c) => ({ label: c.label, link: c.link, blurb: c.blurb, layout: c.aptos ? "Aptos (NAMICA card)" : "Treatment list", groups: c.groups })),
  proc_card_tag: m.procedures.card.tag,
  proc_card_title: m.procedures.card.title,
  aptos_tag: m.aptos.tag,
  aptos_title: m.aptos.title,
  aptos_subtitle: m.aptos.subtitle,
  aptos_badge: m.aptos.badge,
  aptos_link: m.aptos.link,
  concerns_title: m.concerns.title,
  concerns_text: m.concerns.text,
  concerns_groups: m.concerns.groups,
  concerns_card_tag: m.concerns.card.tag,
  concerns_card_title: m.concerns.card.title,
  about_links: m.about.links,
  about_card_link: m.about.cardLink,
};

process.stdout.write(JSON.stringify({ content }, null, 1));
