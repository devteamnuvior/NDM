#!/usr/bin/env node
/* Prints the site's original home page (src/config/home-copy.json) for WordPress: the page chosen as the
   homepage under Settings > Reading (created and chosen when none is), with the fields of its edit screen. The four Aptos marking photos are given by the
   https address the original page showed them from (nuvior.com); the import puts them into the media
   library, with the photo's description as its alternative text.

   Left out on purpose, because the site fills them in: the films, the concern panels and treatment cards
   (their prices come from WooCommerce), the team members, the before and after cases, the photos and
   links of How it works, the monthly specials, the reviews and awards, the two clinics, the booking
   form, the shop's products, the journal posts and the reels.

   One-time import (left alone when the home page already holds its words):
     node scripts/export-home.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm home-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const p = JSON.parse(readFileSync(fileURLToPath(new URL("../src/config/home-copy.json", import.meta.url)), "utf8"));

/* the edit screen lists an icon by its name with a capital: "Award" */
const icon = (name) => name[0].toUpperCase() + name.slice(1);
/* a section's tag and two-line heading, with keys starting with `prefix` */
const head = (prefix, s) => ({ [`${prefix}_tag`]: s.tag, [`${prefix}_lead`]: s.lead, [`${prefix}_strong`]: s.strong });

const content = {
  hero_tagline: p.hero.tagline,
  hero_lead: p.hero.lead,
  hero_strong: p.hero.strong,
  hero_intro: p.hero.intro,
  hero_button: p.hero.button,
  hero_proof: p.hero.proof.map((x) => ({ icon: icon(x.icon), label: x.label })),
  hero_brands: p.hero.brands,
  seo_title: p.title,
  seo_description: p.description,
  ...head("about", p.about),
  about_text: p.about.text,
  about_highlight: p.about.highlight,
  about_stats: p.about.stats,
  ...head("start", p.start),
  ...head("treat", p.treatments),
  treat_text: p.treatments.text,
  ...head("aptos", p.aptos),
  aptos_intro: p.aptos.intro,
  aptos_chip_before: p.aptos.chip.before,
  aptos_chip_number: p.aptos.chip.number,
  aptos_chip_after: p.aptos.chip.after,
  aptos_dials: p.aptos.dials,
  aptos_points: p.aptos.points.map((x) => ({ icon: icon(x.icon), label: x.label })),
  ...head("areas", p.aptos.areas),
  areas_text: p.aptos.areas.text,
  areas_photos: p.aptos.areas.photos.map((g) => ({ image: { file: g.src.startsWith("https://") ? g.src : g.src.replace(/^\//, ""), alt: g.alt }, label: g.label })),
  ...head("space", p.space),
  ...head("team", p.team),
  team_text: p.team.text,
  ...head("results", p.results),
  results_text: p.results.text,
  ...head("process", p.process),
  process_steps: p.process.steps,
  ...head("reviews", p.reviews),
  reviews_note: p.reviews.note,
  ...head("visit", p.visit),
  visit_text: p.visit.text,
  ...head("faq", p.faq),
  faq_intro: p.faq.intro,
  faqs: p.faq.items.map(([q, a]) => ({ q, a })),
  book_lead: p.booking.lead,
  book_strong: p.booking.strong,
  book_text: p.booking.text,
  ...head("shop", p.shop),
  shop_text: p.shop.text,
  shop_button: p.shop.button,
  ...head("journal", p.journal),
  ...head("social", p.social),
  social_text: p.social.text,
  social_button: p.social.button,
  social_note: p.social.note,
};

process.stdout.write(JSON.stringify({ title: "Home", content }, null, 1));
