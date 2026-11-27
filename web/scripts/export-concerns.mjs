#!/usr/bin/env node
/* Prints the site's original concern page (Wrinkles & fine lines, src/config/wrinkles.ts) for WordPress:
   one post of the type "Concerns" with the fields of its edit screen. Photos are file paths under
   web/public; the import puts them into the media library.

   Left out on purpose, because every concern page shares them and the site fills them in: the section
   bar, the glance card, the clinics line, the headings of What to expect and Before and after, and
   Why NewDermaMed.

   One-time import (a concern is created only when its slug is free):
     node scripts/export-concerns.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../web/public:/tmp/site:ro" cli wp ndm concerns-import --images=/tmp/site) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/config/wrinkles.ts", import.meta.url)), "utf8");
const start = source.indexOf("{", source.indexOf("export const WRINKLES"));
const p = JSON.parse(source.slice(start, source.lastIndexOf("}") + 1));

const SHOP_PHOTOS = "https://shop.newdermamedlaserclinic.com/wp-content/uploads/2026/06/";
const slug = (label) =>
  label
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* "pricing.html#prices" -> "/pricing#prices"; a "#/slug" placeholder that is just the name's own slug -> empty
   (the site then links the page with that name, once it exists) */
const link = (href, name) => {
  if (!href) return "";
  if (href === `#/${slug(name ?? "")}`) return "";
  if (/^(#|https?:)/.test(href)) return href;
  return `/${href.replace(/\.html(?=#|$)/, "")}`;
};
const file = (path) => path.replace(/^\//, "");

const content = {
  heading_1: p.title[0],
  heading_2: p.title[1],
  intro: p.sub,
  hero_mobile: file(p.hero.mobile),
  hero_position: p.hero.position,
  seo_title: "Wrinkles & Fine Lines Treatment Toronto | NewDermaMed",
  seo_description:
    "Treatments for wrinkles and fine lines in Toronto: 11 options compared, with a free consultation and VISIA® skin analysis at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.",
  lede: p.lede,
  pages: p.pages.map((x) => ({ name: x.name, link: link(x.href, x.name) })),
  gallery: p.gallery,
  notice: p.notice,
  cause: p.cause,
  assess_text: p.assess.text,
  assess_points: p.assess.points,
  options: [...p.options, ...p.bio].map((o) => ({
    name: o.name,
    role: o.role,
    image: file(o.img),
    fit: o.fit,
    line: o.line,
    link: link(o.href, o.name),
    /* the price is read from the WooCommerce product with this name; none is written */
    price_source: "",
    price_link: link(o.priceHref),
    visit: o.visit,
    course: o.course,
    down: o.down,
    res: o.res,
  })),
  rx_text: p.rx.text,
  rx_links: p.rx.links.map((x) => ({ name: x.name, link: link(x.href, x.name) })),
  expect: p.expect.items.map(([when, title, text]) => ({ when, title, text })),
  /* Before and after photos: cases of the "Before & After" post type, by title. The page's three photos
     (assets/botox/case-1..3.webp) are the same files as the gallery's Botox cases 2, 3 and 4. */
  cases: ["Botox 2", "Botox 3", "Botox 4"],
  home: p.home.map((h) => ({
    title: h.title,
    category: h.category,
    text: h.text,
    product_name: h.product?.name ?? "",
    product_size: h.product?.size ?? "",
    product_image: h.product ? SHOP_PHOTOS + h.product.img : "",
    product_link: h.product?.href ?? "",
  })),
  /* From the journal: WordPress posts. Each is created once (title, date, category, photo, excerpt; its
     slug is the article's on the clinic's blog, its text is written in WordPress) and then chosen. */
  journal: p.articles.map((a) => ({
    slug: new URL(a.href).pathname.replace(/^\/+|\/+$/g, ""),
    title: a.title,
    date: new Date(`${a.date} UTC`).toISOString().slice(0, 10),
    topic: a.topic,
    image: file(a.img),
    excerpt: a.excerpt,
  })),
  related: p.related.map((r) => ({ name: r.name, kind: r.kind, image: file(r.img) })),
  faqs: p.faqs.map(([q, a]) => ({ q, a })),
};

process.stdout.write(JSON.stringify([{ slug: "wrinkles-fine-lines", title: p.short, hero: file(p.hero.desktop), heroAlt: p.hero.alt ?? "", content }], null, 1));
