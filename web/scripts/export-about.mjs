#!/usr/bin/env node
/* Prints the site's original About page (ABOUT_COPY in src/config/about.ts) for WordPress: the one post
   of the type "About Page" with the fields of its edit screen. A gallery photo is a file path under
   web/public, or the https address the original page showed it from (the clinic's own site); the import
   puts both into the media library, with the photo's description as its alternative text.

   Left out on purpose, because the site fills them in: the clinic film, the team members and their
   profiles, the two clinics (addresses, phones, hours, maps, parking), the Top Choice Award badges,
   How it works, the message form and @newdermamed.

   One-time import (the page is created only when it does not exist yet):
     node scripts/export-about.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm about-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/config/about.ts", import.meta.url)), "utf8");
const start = source.indexOf("{", source.indexOf("export const ABOUT_COPY:"));
const p = JSON.parse(source.slice(start, source.indexOf("\n};", start) + 2));

const content = {
  header_tag: p.header.tag,
  heading_1: p.header.lead,
  heading_2: p.header.strong,
  intro: p.header.text,
  stats: p.header.stats,
  seo_title: p.title,
  seo_description: p.description,
  team_tag: p.team.tag,
  team_lead: p.team.lead,
  team_strong: p.team.strong,
  team_intro: p.team.intro,
  clinics_tag: p.clinics.tag,
  clinics_lead: p.clinics.lead,
  clinics_strong: p.clinics.strong,
  photos: p.gallery.photos.map((g) => ({ image: { file: g.src.startsWith("https://") ? g.src : g.src.replace(/^\//, ""), alt: g.alt }, title: g.title })),
  awards_tag: p.gallery.tag,
  awards_line: p.gallery.line,
  awards_lead: p.gallery.lead,
  awards_strong: p.gallery.strong,
  awards_text: p.gallery.text,
  faq_tag: p.faq.tag,
  faq_lead: p.faq.lead,
  faq_strong: p.faq.strong,
  faq_intro: p.faq.intro,
  faqs: p.faq.items.map(([q, a]) => ({ q, a })),
  contact_tag: p.contact.tag,
  contact_lead: p.contact.lead,
  contact_strong: p.contact.strong,
  contact_text: p.contact.text,
};

process.stdout.write(JSON.stringify({ title: "About us", content }, null, 1));
