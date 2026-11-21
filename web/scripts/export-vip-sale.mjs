#!/usr/bin/env node
/* Prints the site's built-in VIP Sale page (src/config/vip-sale.json) for WordPress: a standard page with
   the template "VIP Sale page" and the fields of its edit screen. The header photo is a file path under
   web/public; the import puts it into the media library. A category is "category:<slug>" of the
   WooCommerce price list. No price or percentage is in it: the site reads those from WooCommerce.

   The page is created as a draft unless --status=publish is given to the import: its dates, offers and
   terms need Raymond's approval before the public sees them.

   One-time import (the page is created only when it does not exist yet):
     node scripts/export-vip-sale.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm vip-sale-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const p = JSON.parse(readFileSync(fileURLToPath(new URL("../src/config/vip-sale.json", import.meta.url)), "utf8"));
const category = (slug) => `category:${slug}`;

const content = {
  sale_name: p.name,
  starts: p.starts,
  ends: p.ends,
  heading_1: p.hero.lead,
  heading_2: p.hero.strong,
  offer_words: p.hero.offer,
  intro: p.hero.text,
  gift: p.gift,
  photo: { file: p.hero.photo.src.replace(/^\//, ""), alt: "" },
  tape: p.tape,
  seo_title: p.title,
  seo_description: p.description,
  noindex: p.noindex,
  how: p.how,
  concerns_lead: p.concerns.lead,
  concerns_strong: p.concerns.strong,
  concerns_text: p.concerns.text,
  concerns: p.concerns.items.map((c) => ({ name: c.name, text: c.text, categories: c.categories.map((slug) => ({ category: category(slug) })) })),
  deals_lead: p.deals.lead,
  deals_strong: p.deals.strong,
  deals_text: p.deals.text,
  groups: p.deals.groups.map((g) => ({ category: category(g.category), tab: g.tab })),
  specials_tag: p.specials.tag,
  specials_lead: p.specials.lead,
  specials_strong: p.specials.strong,
  specials_count: String(p.specials.count),
  plan_lead: p.plan.lead,
  plan_strong: p.plan.strong,
  plan_note: p.plan.note,
  clinics_tag: p.clinics.tag,
  clinics_lead: p.clinics.lead,
  clinics_strong: p.clinics.strong,
  footer_lead: p.footer.lead,
  footer_text: p.footer.text,
  footer_terms: p.footer.terms,
};

process.stdout.write(JSON.stringify({ title: "VIP Sale", status: "draft", content }, null, 1));
