import "server-only";
import { LEGAL, type LegalDocId } from "@/config/legal";
import { getPageBySlug } from "@/lib/wordpress";

/**
 * A legal document as WordPress holds it (the page whose slug is the document's id: privacy, terms,
 * refunds), made ready for the legal page: the title in its two tones, the month it was last changed,
 * the "On this page" list worked out from its headings, and its text.
 */
export interface LegalDocument {
  lead: string;
  strong: string;
  /** "November 2026", from the page's last change in WordPress. */
  updated: string;
  toc: [id: string, label: string][];
  /** The page's text as HTML, written by the clinic's own WordPress editors. */
  html: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Text of a piece of WordPress HTML: tags out, character references read. */
function plain(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(\w+));/gi, (all, dec, hex, name) => (dec ? String.fromCodePoint(Number(dec)) : hex ? String.fromCodePoint(parseInt(hex, 16)) : (NAMED[name.toLowerCase()] ?? all)))
    .replace(/\s+/g, " ")
    .trim();
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Prepares the page's HTML and lists its h2 headings:
 * - nothing that runs: scripts, styles, frames and inline event handlers are dropped (editors are trusted
 *   WordPress users, this is a second lock);
 * - every h2 gets an id (its own anchor from the editor, or one made from its words);
 * - a numbered list that starts later (`start="3"` in the editor) continues the page's own (a), (b), (c)
 *   or (i), (ii) numbering, which is drawn by a CSS counter.
 */
function prepare(source: string): { html: string; headings: [id: string, text: string][] } {
  const headings: [string, string][] = [];
  const used = new Set<string>();
  const html = source
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(?:script|style|iframe|object|embed)\b[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (_all, attrs: string, inner: string) => {
      const text = plain(inner);
      let id = /\sid="([^"]+)"/.exec(attrs)?.[1];
      if (!id) {
        const base = slugify(text) || "section";
        id = base;
        for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
        attrs += ` id="${id}"`;
      }
      used.add(id);
      headings.push([id, text]);
      return `<h2${attrs}>${inner}</h2>`;
    })
    .replace(/<ol\b([^>]*)\sstart="(\d+)"([^>]*)>/gi, (_all, before: string, start: string, after: string) => {
      const counter = /lg-roman/.test(before + after) ? "lr" : "lg";
      return `<ol${before}${after} style="counter-reset:${counter} ${Number(start) - 1}">`;
    });
  return { html, headings };
}

/**
 * The document from WordPress, or null when WordPress has no published page for it. Throws a
 * WordPressError when WordPress cannot be reached.
 */
export async function getLegalDocument(doc: LegalDocId): Promise<LegalDocument | null> {
  const page = await getPageBySlug(doc);
  if (!page || !page.content.rendered.trim()) return null;

  const builtIn = LEGAL[doc];
  const { html, headings } = prepare(page.content.rendered);

  /* the title keeps its designed line break while it is the original one; a new title breaks before its last word */
  const title = plain(page.title.rendered);
  const cut = title.lastIndexOf(" ");
  const original = title === `${builtIn.lead} ${builtIn.strong}` || !title;
  const lead = original ? builtIn.lead : cut > 0 ? title.slice(0, cut) : "";
  const strong = original ? builtIn.strong : cut > 0 ? title.slice(cut + 1) : title;

  /* the bar's short names for the original headings; a heading added in WordPress shows its own words */
  const short = new Map(builtIn.toc);
  const toc = headings.map(([id, text]): [string, string] => [id, short.get(id) ?? text]);

  const [year, month] = page.modified.split("-").map(Number);
  const updated = MONTHS[month - 1] && year ? `${MONTHS[month - 1]} ${year}` : "";

  return { lead, strong, updated, toc, html };
}
