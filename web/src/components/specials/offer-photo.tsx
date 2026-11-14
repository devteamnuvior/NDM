import type { CSSProperties } from "react";
import type { OfferPhoto } from "@/components/specials/offers";
import { withBase, withBaseSrcSet } from "@/lib/base-path";

/**
 * An offer's photo. It is the product's image in WooCommerce, served by WordPress in its own sizes
 * (`srcSet`), so it is a plain image rather than one resized by this site.
 */
export function OfferImg({ photo, sizes, className, style }: { photo: OfferPhoto | null; sizes: string; className: string; style?: CSSProperties }) {
  if (!photo) return null;
  /* eslint-disable-next-line @next/next/no-img-element -- already sized by WordPress */
  return <img src={withBase(photo.src)} srcSet={withBaseSrcSet(photo.srcSet || undefined)} sizes={sizes} alt="" loading="lazy" decoding="async" draggable={false} className={className} style={style} />;
}
