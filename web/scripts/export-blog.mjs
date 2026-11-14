#!/usr/bin/env node
/* Prints the site's original blog (src/config/blog.ts, and the one article written out here,
   src/config/article-rosacea.ts) for WordPress: one post per story with its topic (category), date,
   summary, reading time, its wide photo (the featured image) and its tall card photo. The photos are
   the clinic's own, saved once in assets/blog under their original file names.

   The rosacea article carries its text (as blocks: the opening paragraph first). Every other post has
   no text yet: its card keeps opening the article on the clinic's earlier site ("Opens at") until the
   text is written in WordPress.

   One-time import (a post is created only when its slug is free):
     node scripts/export-blog.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../assets/blog:/tmp/blog:ro" cli wp ndm blog-import --images=/tmp/blog) */
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const literal = (source, name, open, close) => JSON.parse(source.slice(source.indexOf(open, source.indexOf("=", source.indexOf(`export const ${name}`))), source.lastIndexOf(close) + 1));

const posts = literal(read("../src/config/blog.ts"), "BLOG_POSTS", "[", "]");
const article = literal(read("../src/config/article-rosacea.ts"), "ROSACEA_ARTICLE", "{", "}");

const photos = fileURLToPath(new URL("../../assets/blog/", import.meta.url));
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const paragraph = (text) => `<!-- wp:paragraph -->\n<p>${escape(text)}</p>\n<!-- /wp:paragraph -->`;
const block = (b) => {
  if (b.type === "h2") return `<!-- wp:heading -->\n<h2 class="wp-block-heading">${escape(b.text)}</h2>\n<!-- /wp:heading -->`;
  if (b.type === "h3") return `<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${escape(b.text)}</h3>\n<!-- /wp:heading -->`;
  if (b.type === "ul") return `<!-- wp:list -->\n<ul class="wp-block-list">${b.items.map((li) => `<!-- wp:list-item -->\n<li>${escape(li)}</li>\n<!-- /wp:list-item -->`).join("\n\n")}</ul>\n<!-- /wp:list -->`;
  /* the import puts the file into the media library and writes the image block */
  if (b.type === "img") return `{{image:${basename(b.src)}|${b.alt}}}`;
  return paragraph(b.text);
};

const out = posts.map((p) => {
  const slug = p.slug.replace(/^\/+|\/+$/g, "");
  const card = basename(p.img);
  /* "1-Name-m.webp" is the tall card photo; "1-Name.webp" the wide one, where the clinic's site has it */
  const wide = card.replace(/-m(\.\w+)$/, "$1");
  const hasWide = wide !== card && existsSync(photos + wide);
  const entry = {
    slug,
    title: p.title,
    date: p.date,
    topic: p.topic,
    excerpt: p.excerpt,
    minutes: p.minutes,
    image: hasWide ? wide : card,
    card: hasWide ? card : "",
    external: p.url,
  };
  if (p.slug !== article.slug) return entry;
  return {
    ...entry,
    external: "",
    image: basename(article.hero),
    heading: article.lead,
    takeaway: article.takeaway,
    content: [paragraph(article.intro), ...article.body.map(block)].join("\n\n"),
  };
});

process.stdout.write(JSON.stringify(out, null, 1));
