import { withBase } from "@/lib/base-path";

/**
 * A photo through the site's image optimizer (Next.js, "/_next/image"): resized and in a modern format.
 * For plain `<img>` tags whose file is not imported, such as a photo from WordPress's media library.
 * The widths and the quality must be ones next.config.ts allows (`images.deviceSizes`, `images.qualities`),
 * and a photo on another address must match `images.remotePatterns` there.
 */
const QUALITY = 60;

/** True for a photo the optimizer can take: one of this site's own files, or a full address. */
const usable = (src: string) => /^(\/(?!\/)|https?:\/\/)/.test(src) && !/\.svg(\?|$)/i.test(src);

/** The address of `src` at `width` pixels wide; `src` itself when the optimizer cannot take it. */
export function optimized(src: string, width: number): string {
  if (!usable(src)) return withBase(src);
  return `${withBase("/_next/image")}?url=${encodeURIComponent(src.startsWith("/") ? withBase(src) : src)}&w=${width}&q=${QUALITY}`;
}

/** A `srcset` of `src` at each width; empty when the optimizer cannot take it. */
export function optimizedSrcSet(src: string, widths: number[]): string {
  return usable(src) ? widths.map((w) => `${optimized(src, w)} ${w}w`).join(", ") : "";
}
