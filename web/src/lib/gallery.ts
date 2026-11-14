import "server-only";
import { GALLERY } from "@/config/gallery";
import { plain } from "@/lib/legal";
import { getBeforeAfter } from "@/lib/wordpress";
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
}

/**
 * The gallery from WordPress, ready for the page. Throws a WordPressError when WordPress cannot be
 * reached.
 */
export async function getGallery(): Promise<GalleryView> {
  const { page, cases } = await getBeforeAfter();

  const paragraphs = page ? Array.from(page.content.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi), (m) => plain(m[1])).filter(Boolean) : [];
  const labels: string[] = [];
  const list = cases.map((c): GalleryCase => {
    const names = c.categories.map((k) => k.name);
    for (const name of names) if (!labels.includes(name)) labels.push(name);
    return { id: c.id, label: names[0] ?? "", labels: names, photo: c.photo };
  });

  return { subs: paragraphs.length ? paragraphs : GALLERY.subs, labels, cases: list };
}
