#!/usr/bin/env node
/* Prints the original Before & After gallery (the prototype's src/before-after-data.json, taken from the
   live site) for WordPress: the "Before & After" page with the intro text as two paragraph blocks, and one
   case per photo with its category (the treatment) and its photo's file name in assets/before-after.

   One-time import (the page is created only when its slug is free, the cases only when there are none):
     node scripts/export-before-after.mjs | (cd ../cms && docker compose run --rm -T -v "$PWD/../assets/before-after:/tmp/ba:ro" cli wp ndm before-after-import --images=/tmp/ba) */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const data = JSON.parse(readFileSync(fileURLToPath(new URL("../../src/before-after-data.json", import.meta.url)), "utf8"));

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const content = data.subs.map((s) => `<!-- wp:paragraph -->\n<p>${escape(s)}</p>\n<!-- /wp:paragraph -->`).join("\n\n");

/* "Belkyra 1", "Belkyra 2": the title is what the editor sees in the list of cases */
const seen = new Map();
const cases = data.cases.map(({ src, label }) => {
  const n = (seen.get(label) ?? 0) + 1;
  seen.set(label, n);
  return { title: `${label} ${n}`, category: label, image: basename(src) };
});

process.stdout.write(JSON.stringify({ page: { title: "Before &amp; After", content }, cases }, null, 1));
