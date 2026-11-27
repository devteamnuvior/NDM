#!/usr/bin/env node
/* Prints the three legal documents (the site's built-in text, src/components/legal/bodies.tsx) as WordPress
   pages: JSON [{ slug, title, content }] where content is block-editor markup (paragraphs, headings with
   their anchors, lists, groups), so each part can be edited in WordPress as a normal block.

   One-time import (creates a page only when its slug does not exist yet):
     node scripts/export-legal-pages.mjs | (cd ../cms && docker compose run --rm -T cli wp ndm legal-import) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(fileURLToPath(new URL("../src/components/legal/bodies.tsx", import.meta.url)), "utf8");

const PAGES = [
  { slug: "privacy", title: "Privacy Policy", component: "PrivacyBody" },
  { slug: "terms", title: "Terms of Service", component: "TermsBody" },
  { slug: "refunds", title: "Refunds & Cancellations", component: "RefundsBody" },
];

/** The JSX between `<>` and `</>` of one component, as plain HTML. */
function bodyHtml(component) {
  const start = source.indexOf(`export function ${component}(`);
  if (start < 0) throw new Error(`${component} not found`);
  const open = source.indexOf("<>", start);
  const close = source.indexOf("</>", open);
  return source
    .slice(open + 2, close)
    .replace(/<Link href=/g, "<a href=")
    .replace(/<\/Link>/g, "</a>")
    .replace(/className=/g, "class=")
    .replace(/ style=\{\{ counterReset: 'lg (\d+)' \}\}/g, (_, n) => ` start="${Number(n) + 1}"`)
    .replace(/<br \/>/g, "<br>");
}

const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
const comment = (name, attrs) => `<!-- wp:${name}${Object.keys(attrs).length ? ` ${JSON.stringify(attrs)}` : ""} -->`;

/** Index just past the closing tag that matches the element opened right before `from`. */
function closeOf(html, name, from) {
  const re = new RegExp(`<(/?)${name}\\b[^>]*>`, "g");
  re.lastIndex = from;
  let depth = 1;
  for (let m; (m = re.exec(html)); ) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return { inner: html.slice(from, m.index), end: re.lastIndex };
  }
  throw new Error(`<${name}> is not closed`);
}

function listBlock(tagName, openTag, inner) {
  const cls = attr(openTag, "class");
  const start = attr(openTag, "start");
  const attrs = {};
  if (tagName === "ol") attrs.ordered = true;
  if (start) attrs.start = Number(start);
  if (cls) attrs.className = cls;
  const items = [];
  for (let pos = 0; ; ) {
    const at = inner.indexOf("<li>", pos);
    if (at < 0) break;
    const li = closeOf(inner, "li", at + 4);
    pos = li.end;
    const nested = /<(ul|ol)\b[^>]*>/.exec(li.inner);
    let content = li.inner.trim();
    if (nested) {
      const sub = closeOf(li.inner, nested[1], nested.index + nested[0].length);
      content = li.inner.slice(0, nested.index).trim() + listBlock(nested[1], nested[0], sub.inner);
    }
    items.push(`${comment("list-item", {})}\n<li>${content}</li>\n<!-- /wp:list-item -->`);
  }
  const startAttr = start ? ` start="${start}"` : "";
  return `${comment("list", attrs)}\n<${tagName}${startAttr} class="${["wp-block-list", cls].filter(Boolean).join(" ")}">${items.join("\n\n")}</${tagName}>\n<!-- /wp:list -->`;
}

function blocks(html) {
  const out = [];
  const open = /<(p|h2|h3|h4|ul|ol|div)\b[^>]*>/g;
  for (let m; (m = open.exec(html)); ) {
    const [tag, name] = m;
    const { inner, end } = closeOf(html, name, open.lastIndex);
    open.lastIndex = end;
    const cls = attr(tag, "class");
    if (name === "p") {
      out.push(`${comment("paragraph", cls ? { className: cls } : {})}\n<p${cls ? ` class="${cls}"` : ""}>${inner.trim()}</p>\n<!-- /wp:paragraph -->`);
    } else if (/^h\d$/.test(name)) {
      const level = Number(name[1]);
      const id = attr(tag, "id");
      const attrs = {};
      if (level !== 2) attrs.level = level;
      if (cls) attrs.className = cls;
      out.push(`${comment("heading", attrs)}\n<${name} class="${["wp-block-heading", cls].filter(Boolean).join(" ")}"${id ? ` id="${id}"` : ""}>${inner.trim()}</${name}>\n<!-- /wp:heading -->`);
    } else if (name === "div") {
      out.push(`${comment("group", { className: cls })}\n<div class="wp-block-group ${cls}">${blocks(inner)}</div>\n<!-- /wp:group -->`);
    } else {
      out.push(listBlock(name, tag, inner));
    }
  }
  return out.join("\n\n");
}

process.stdout.write(JSON.stringify(PAGES.map(({ slug, title, component }) => ({ slug, title, content: blocks(bodyHtml(component)) })), null, 1));
