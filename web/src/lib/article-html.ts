import { plain } from "@/lib/legal";
import type { ArticleBlock, BlogPhoto } from "@/types/blog";

/**
 * An article's text as WordPress renders it (the block editor's HTML), cut into the pieces the article
 * page draws one by one: headings, paragraphs, lists, photos. The page keeps its own look for each
 * piece, so nothing of WordPress's markup but the inline formatting (links, bold, italics) is kept.
 */

const VOID = new Set(["hr", "img", "br"]);

/** Nothing that runs: scripts, styles, frames and inline event handlers are dropped (editors are trusted WordPress users, this is a second lock). */
export function scrub(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(?:script|style|iframe|object|embed)\b[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

interface Piece {
  tag: string;
  attrs: string;
  inner: string;
}

/** The elements at the top level of a piece of HTML, in order. Text between them is not part of a block and is left out. */
function topLevel(html: string): Piece[] {
  const pieces: Piece[] = [];
  const open = /<([a-z][a-z0-9]*)\b([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = open.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    if (VOID.has(tag) || attrs.trimEnd().endsWith("/")) {
      pieces.push({ tag, attrs, inner: "" });
      continue;
    }
    /* the matching close: the same tag can be nested (a list inside a list) */
    const same = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
    same.lastIndex = open.lastIndex;
    let depth = 1;
    let end = html.length;
    let after = html.length;
    let s: RegExpExecArray | null;
    while ((s = same.exec(html))) {
      depth += s[1] ? -1 : 1;
      if (depth === 0) {
        end = s.index;
        after = same.lastIndex;
        break;
      }
    }
    pieces.push({ tag, attrs, inner: html.slice(open.lastIndex, end) });
    open.lastIndex = after;
  }
  return pieces;
}

const attr = (attrs: string, name: string): string => {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(attrs);
  return m ? plain(m[1] ?? m[2] ?? "") : "";
};

/** The photo of an `<img>` tag: its address, smaller copies, size and alternative text. */
function photoOf(attrs: string): BlogPhoto | null {
  const src = attr(attrs, "src");
  if (!src) return null;
  const width = Number(attr(attrs, "width"));
  const height = Number(attr(attrs, "height"));
  return { src, srcSet: attr(attrs, "srcset") || undefined, width: width || undefined, height: height || undefined, alt: attr(attrs, "alt") };
}

const HEADINGS: Record<string, "h2" | "h3" | "h4"> = { h1: "h2", h2: "h2", h3: "h3", h4: "h4", h5: "h4", h6: "h4" };

/** The article's blocks. A heading keeps its level (an h1 becomes an h2: the page has its own h1). */
export function articleBlocks(source: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  for (const { tag, attrs, inner } of topLevel(scrub(source))) {
    const html = inner.trim();
    if (HEADINGS[tag]) {
      if (plain(html)) blocks.push({ tag: HEADINGS[tag], html });
    } else if (tag === "p") {
      /* a paragraph that only holds a photo (the classic editor) is the photo */
      const img = /^<img\b([^>]*)>$/i.exec(html);
      const photo = img && photoOf(img[1]);
      if (photo) blocks.push({ tag: "img", photo });
      else if (plain(html)) blocks.push({ tag: "p", html });
    } else if (tag === "ul" || tag === "ol" || tag === "blockquote") {
      if (plain(html)) blocks.push({ tag, html });
    } else if (tag === "img") {
      const photo = photoOf(attrs);
      if (photo) blocks.push({ tag: "img", photo });
    } else if (tag === "figure") {
      const img = /<img\b([^>]*)>/i.exec(html);
      const photo = img && photoOf(img[1]);
      const caption = plain(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(html)?.[1] ?? "");
      if (photo) blocks.push({ tag: "img", photo, caption: caption || undefined });
      else if (plain(html)) blocks.push({ tag: "div", html });
    } else if (tag === "hr") {
      blocks.push({ tag: "hr" });
    } else if (plain(html)) {
      blocks.push({ tag: "div", html });
    }
  }
  return blocks;
}

/** The number of words in a list of blocks. */
export function wordCount(blocks: ArticleBlock[]): number {
  return blocks.reduce((n, b) => n + ("html" in b ? plain(b.html).split(/\s+/).filter(Boolean).length : 0), 0);
}
