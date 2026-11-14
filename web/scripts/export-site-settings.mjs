#!/usr/bin/env node
/* Prints the site's built-in header and footer settings (src/config/site-settings.json) as the fields of
   WordPress's Site Settings screen. The film poster is an https address the import puts into the media
   library.

   Left out on purpose, because the site fills them in: the menu and its panels, the logo, the two
   clinics (names, addresses, phone numbers), the Privacy, Terms and Refunds links.

   One-time import (settings that were saved already are kept; --fill-empty fills their empty fields):
     node scripts/export-site-settings.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm settings-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const s = JSON.parse(readFileSync(fileURLToPath(new URL("../src/config/site-settings.json", import.meta.url)), "utf8"));
const { header: h, footer: f } = s;
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
};

process.stdout.write(JSON.stringify({ content }, null, 1));
