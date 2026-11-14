#!/usr/bin/env node
/* Prints the site's original procedure page (Botox, src/config/botox.ts) for WordPress: one post of the
   type "Injectables" (a procedure post type) with the fields of its edit screen. Photos are file paths under web/public; the
   import puts them into the media library.

   No price is exported. The price list names its WooCommerce products ("Botox Cosmetic", "Dysport"),
   which the import picks; the amounts inside the copy are tokens ({{price}}, {{maxoff}}...) the site
   fills in from those products.

   Left out on purpose, because every procedure page shares them and the site fills them in: the section
   bar, the clinics line, the clinic film, section tags and Why NewDermaMed.

   One-time import (a procedure is created only when its slug is free):
     node scripts/export-procedures.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm procedures-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/config/botox.ts", import.meta.url)), "utf8");
const start = source.indexOf("{", source.indexOf("export const BOTOX"));
const p = JSON.parse(source.slice(start, source.lastIndexOf("}") + 1));

const file = (path) => path.replace(/^\//, "");
const photo = (path, alt) => (alt ? { file: file(path), alt } : file(path));

const content = {
  heading_1: p.title[0],
  heading_2: p.title[1],
  intro: p.sub,
  hero_mobile: file(p.hero.mobile),
  hero_position: p.hero.position,
  group: p.crumbs[1],
  facts: p.facts.map(([label, value]) => ({ label, value })),
  offer_title: p.offer.title,
  seo_title: "Botox Toronto from {{price}}/Unit, Free Consultation | NewDermaMed",
  seo_description:
    "Botox® Cosmetic in Toronto from {{price}} per unit, packages up to {{maxoff}} off. Free consultation and VISIA® skin analysis at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.",
  benefits_lead: p.intro.lead,
  benefits_strong: p.intro.strong,
  benefits_text: p.intro.text,
  benefits_chips: p.intro.chips,
  benefits_note: p.intro.note,
  benefits_image: photo(p.intro.img, p.intro.alt),
  benefits_diagram: !!p.intro.contain,
  about_lead: p.overview.lead,
  about_strong: p.overview.strong,
  tabs: p.overview.tabs.map((t) => ({ label: t.label, figure: t.stat[0], figure_label: t.stat[1], text: t.text, link: t.link?.[0] ?? "", link_label: t.link?.[1] ?? "" })),
  choose_lead: p.choose.lead,
  choose_strong: p.choose.strong,
  choose_image: photo(p.choose.img, p.choose.alt),
  cards: p.choose.cards.map(([title, text]) => ({ title, text })),
  reel_video: p.reel.src,
  reel_poster: file(p.reel.poster),
  reel_text: p.reel.text,
  /* Before and after photos: cases of the "Before & After" post type, by title. The page's three photos
     (assets/botox/case-1..3.webp) are the same files as the gallery's Botox cases 2, 3 and 4. */
  cases: ["Botox 2", "Botox 3", "Botox 4"],
  prices_lead: p.prices.lead,
  prices_strong: p.prices.strong,
  /* the WooCommerce product of each row, by name: the import picks it; its prices stay in WooCommerce */
  price_list: p.prices.groups.map((g) => ({ product: g.name, name: g.title, blurb: g.blurb })),
  guide_lead: p.guide.lead,
  guide_strong: p.guide.strong,
  guide_intro: p.guide.intro,
  guide: p.guide.items.map((it) => ({ q: it.q, a: it.a, list: it.list ?? [] })),
  related: p.guide.related.map((r) => ({ name: r.name, kind: r.kind, image: file(r.img) })),
  faqs: p.faqs.map(([q, a]) => ({ q, a })),
};

/* "date": the day the page was last updated; it becomes the procedure's "Page updated" day until it is saved again */
process.stdout.write(JSON.stringify([{ slug: "botox", title: p.crumbs[2], type: "ndm_injectable", date: p.guide.updated[0], hero: file(p.hero.desktop), heroAlt: p.hero.alt ?? "", content }], null, 1));
