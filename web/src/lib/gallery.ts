import "server-only";
import { GALLERY } from "@/config/gallery";
import { plain } from "@/lib/legal";
import { procedurePath } from "@/lib/post-paths";
import { getBeforeAfter, getProcedureList, settle } from "@/lib/wordpress";
import type { WPBeforeAfterPhoto } from "@/types/before-after";

/** One case of the gallery: a post of the type "Before & After" in WordPress. */
export interface GalleryCase {
  /** Post ID. */
  id: number;
  /** Its first category (the treatment): the name on the card. Empty when it has none. */
  label: string;
  /** Every category it sits under, for the filter. */
  labels: string[];
  photo: WPBeforeAfterPhoto;
}

export interface GalleryView {
  /** The intro under the heading: the paragraphs of the WordPress page "Before & After". */
  subs: string[];
  /** The filter: the categories in use, in the order their first case appears. */
  labels: string[];
  cases: GalleryCase[];
  /** The treatment page of each category that has one (category name -> the page's address on this site). */
  pages: Record<string, string>;
}

/** A photo narrower than this is a category cover, not a before and after case (the imported covers are 86px wide). */
const MIN_CASE_WIDTH = 200;

/** The procedure page each gallery category belongs to, by the procedure's WordPress slug (user, 2026-11-18). */
const CATEGORY_PAGES: Record<string, string> = {
  botox: "botox",
  belkyra: "belkyra-kybella",
  "chemical peel": "chemical-peels",
  dermamelan: "dermamelan",
  "fractional skin resurfacing": "laser-skin-resurfacing",
  "laser acne chemical peels": "acne-treatments",
  "laser acne": "acne-treatments",
  "lip fillers": "lip-augmentation",
  microneedling: "microneedling",
  "mole removal": "mole-removal",
  "tear troughs": "tear-trough-correction",
  "prp hair": "hair-loss-treatments",
  "stretch marks": "stretch-marks",
};

/**
 * The gallery from WordPress, ready for the page. Throws a WordPressError when WordPress cannot be
 * reached.
 */
export async function getGallery(): Promise<GalleryView> {
  const [{ page, cases: all }, procs] = await Promise.all([getBeforeAfter(), settle(getProcedureList)]);
  /* category covers (no before and after in them) are not cases */
  const cases = all.filter((c) => !c.photo.width || c.photo.width >= MIN_CASE_WIDTH);

  const paragraphs = page ? Array.from(page.content.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi), (m) => plain(m[1])).filter(Boolean) : [];
  const labels: string[] = [];
  const list = cases.map((c): GalleryCase => {
    const names = c.categories.map((k) => k.name);
    for (const name of names) if (!labels.includes(name)) labels.push(name);
    return { id: c.id, label: names[0] ?? "", labels: names, photo: c.photo };
  });

  const bySlug = new Map((procs.ok ? procs.data : []).map((p) => [p.slug, procedurePath(p.type, p.slug, p.parents)]));
  const pages: Record<string, string> = {};
  for (const l of labels) {
    const path = bySlug.get(CATEGORY_PAGES[l.toLowerCase()] ?? "");
    if (path) pages[l] = path;
  }

  return { subs: paragraphs.length ? paragraphs : GALLERY.subs, labels, cases: list, pages };
}
