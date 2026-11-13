#!/usr/bin/env node
/* Prints the site's original Aptos Thread Lift page (src/config/aptos.ts) for WordPress: one post of the
   type "Aptos Pages" with the fields of its edit screen. A photo is a file path under web/public, or the
   https address the original page showed it from (the clinic's own sites); the import puts both into the
   media library.

   No price is exported. The price list names its WooCommerce product, which the import picks, and the
   one option the page shows ("Mid face"); the amount inside the copy is the token {{price}} the site
   fills in from that product.

   Before and after photos are not exported: the original page showed compare cards that are not cases
   of the "Before & After" post type. Cases are picked in the page's edit screen.

   Left out on purpose, because the site fills them in: the section bar's order, the Aptos logo, the
   team photo of Why NewDermaMed, Our team, Testimonials, Visit us and Start your journey.

   One-time import (a page is created only when its slug is free):
     node scripts/export-aptos.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm aptos-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/config/aptos.ts", import.meta.url)), "utf8");
const start = source.indexOf("{", source.indexOf("export const APTOS:"));
const end = source.indexOf("\n};", start) + 2;
/* the one value that is not plain data: the compare cards of the original Before & after section */
const p = JSON.parse(source.slice(start, end).replace(/BA_REAL_CASES\.map\([^\n]*\),/, "[],"));
/* the page's title, description and FAQ heading: plain strings of the built-in copy at the end of the file */
const own = source.slice(source.indexOf('"aptos-thread-lift": {'));
const str = (key) => JSON.parse(new RegExp(`\\b${key}:\\s*("(?:[^"\\\\]|\\\\.)*")`).exec(own)[1]);
const seo = { title: str("title"), description: str("description"), faq: { lead: str("lead"), strong: str("strong"), intro: str("intro") } };

const file = (path) => (path.startsWith("https://") ? path : path.replace(/^\//, ""));
const photo = (path, alt) => (alt ? { file: file(path), alt } : file(path));
const pairs = (list) => list.map(([title, text]) => ({ title, text }));

const content = {
  heading_1: p.title[0],
  heading_2: p.title[1],
  intro: p.sub,
  hero_mobile: file(p.hero.mobile),
  hero_position: p.hero.position,
  facts: p.facts.map(([label, value]) => ({ label, value })),
  seo_title: seo.title,
  seo_description: seo.description,
  what_tag: p.intro.tag,
  what_lead: p.intro.lead,
  what_strong: p.intro.strong,
  what_text: p.intro.text,
  what_note: p.intro.note,
  what_image: photo(p.intro.img, p.intro.alt),
  what_position: p.intro.position,
  what_ring: p.intro.ring,
  what_points: pairs(p.intro.points),
  how_tag: p.steps.tag,
  how_lead: p.steps.lead,
  how_strong: p.steps.strong,
  how_text: p.steps.text,
  how_steps: pairs(p.steps.items),
  safety_tag: p.safety.tag,
  safety_lead: p.safety.lead,
  safety_strong: p.safety.strong,
  safety_text: p.safety.text,
  safeguards: p.safety.safeguards,
  product_image: photo(p.safety.product.img, p.safety.product.alt),
  product_tag: p.safety.product.tag,
  product_name: p.safety.product.name,
  product_note: p.safety.product.note,
  lasting_lead: p.duration.lead,
  lasting_strong: p.duration.strong,
  lasting_text: p.duration.text,
  lasting_figure: p.duration.stat,
  lasting_unit: p.duration.unit,
  lasting_label: p.duration.label,
  lasting_note: p.duration.note,
  fit_tag: p.fit.tag,
  fit_lead: p.fit.lead,
  fit_strong: p.fit.strong,
  fit_text: p.fit.text,
  fit_yes: p.fit.yes,
  fit_no: p.fit.no,
  fit_image: photo(p.fit.img, p.fit.alt),
  fit_position: p.fit.position,
  expect_lead: p.expect.lead,
  expect_strong: p.expect.strong,
  expect_steps: p.expect.items.map(([when, title, text]) => ({ when, title, text })),
  results_lead: p.results.lead,
  results_strong: p.results.strong,
  results_text: p.results.text,
  cases: [],
  care_lead: p.care.lead,
  care_strong: p.care.strong,
  care_text: p.care.text,
  care_before: p.care.before,
  care_after: p.care.after,
  pair_tag: p.pair.tag,
  pair_lead: p.pair.lead,
  pair_strong: p.pair.strong,
  pair_text: p.pair.text,
  pair_groups: p.pair.groups.map(([when, treatments]) => ({ when, treatments })),
  pair_links: p.pair.links.map((l) => ({ name: l.name, menu: l.menu, tag: l.tag, image: file(l.img), line: l.line })),
  prices_lead: p.prices.lead,
  prices_strong: p.prices.strong,
  prices_intro: p.prices.intro,
  /* the WooCommerce product by name: the import picks it; its prices stay in WooCommerce. The page shows the midface only. */
  price_list: [{ product: "Aptos Excellence Visage Method EV PLA/PCL (up to 24 months)", name: p.prices.title, blurb: p.prices.blurb, options: ["Mid face"] }],
  sessions_figure: p.sessions.stat,
  sessions_unit: p.sessions.unit,
  sessions_text: p.sessions.text,
  sessions_chips: p.sessions.chips,
  why_lead: p.why.lead,
  why_strong: p.why.strong,
  why_items: p.why.items.map(([figure, unit, text]) => ({ figure, unit, text })),
  faq_lead: seo.faq.lead,
  faq_strong: seo.faq.strong,
  faq_intro: seo.faq.intro,
  faqs: p.faqs.map(([q, a]) => ({ q, a })),
};

process.stdout.write(JSON.stringify([{ slug: "aptos-thread-lift", title: p.crumbs[1], hero: file(p.hero.desktop), heroAlt: "", content }], null, 1));
