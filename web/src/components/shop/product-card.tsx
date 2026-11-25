import Link from "next/link";
import { productPath } from "@/config/shop";
import type { ShopCard } from "@/types/shop";

export const cad = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
export const percentOff = (p: Pick<ShopCard, "price" | "regular">): number => Math.round((1 - p.price / p.regular) * 100);

/** The small tags on a product photo: the saving, New, Sold out. */
export function ProductTags({ p, className = "" }: { p: ShopCard; className?: string }) {
  const off = p.onSale ? percentOff(p) : 0;
  if (!off && !p.isNew && p.inStock) return null;
  return (
    <span className={`sp-tags ${className}`}>
      {!p.inStock && <span className="sp-tag is-out">Sold out</span>}
      {p.inStock && off > 0 && <span className="sp-tag is-sale">{`Save ${off}%`}</span>}
      {p.isNew && <span className="sp-tag is-new">New</span>}
    </span>
  );
}

/**
 * One product: the photo on white (the second photo on hover), its tags, brand, name, size, price with the price
 * before a sale, and Add to cart (the store's cart). The card opens the product's page on this site. On wide
 * screens with a mouse the button rises over the photo on hover or focus; elsewhere it sits under the price.
 */
export function ProductCard({ p, eager = false, sizes = "(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 46vw" }: { p: ShopCard; eager?: boolean; sizes?: string }) {
  return (
    <article className={`sp-card group relative flex h-full flex-col ${p.inStock ? "" : "is-out"}`}>
      <div className="sp-media relative aspect-[4/5] overflow-hidden rounded-[20px] bg-white">
        {p.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store (transparent PNG on white) */}
            <img src={p.image.src} srcSet={p.image.srcSet || undefined} sizes={sizes} alt="" loading={eager ? "eager" : "lazy"} decoding="async" className="sp-img absolute inset-0 h-full w-full object-contain" />
            {p.image2 && (
              // eslint-disable-next-line @next/next/no-img-element -- the second photo, shown on hover
              <img src={p.image2.src} srcSet={p.image2.srcSet || undefined} sizes={sizes} alt="" loading="lazy" decoding="async" className="sp-img2 absolute inset-0 h-full w-full object-contain" />
            )}
          </>
        ) : (
          <span aria-hidden="true" className="sp-blank absolute inset-0" />
        )}
        <ProductTags p={p} className="absolute top-3 left-3" />
      </div>
      <div className="flex flex-1 flex-col px-1 pt-4">
        {p.brand && <p className="font-mont text-[10.5px] tracking-[.16em] text-ndm-muted uppercase sm:text-[11px]">{p.brand}</p>}
        <h3 className="sp-name mt-1.5 font-aeonik text-[16.5px] leading-[1.2] tracking-[-0.01em] text-ndm-ink sm:text-[19px]">
          <Link href={productPath(p.slug)} className="sp-link transition-colors group-hover:text-ndm-deep">
            {p.name}
          </Link>
        </h3>
        {p.size && <p className="mt-1 font-inter text-[12.5px] text-ndm-muted sm:text-[13px]">{p.size}</p>}
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2.5">
          <span className="font-inter text-[16px] font-semibold tracking-[-0.01em] text-ndm-ink tabular-nums sm:text-[17px]">
            {cad(p.price)}
            {p.onSale && <span className="sr-only">, was {cad(p.regular)}</span>}
          </span>
          {p.onSale && (
            <s aria-hidden="true" className="font-inter text-[13.5px] text-ndm-muted/80 tabular-nums">
              {cad(p.regular)}
            </s>
          )}
        </p>
        {p.inStock ? (
          <a href={p.addToCart} rel="nofollow" className="sp-quick btn btn-ink btn-sm btn-block btn-buy relative z-[2] mt-3">
            <span>Add to cart</span>
            <span className="sr-only">{`: ${p.name}, opens the online store`}</span>
          </a>
        ) : (
          <Link href={productPath(p.slug)} className="sp-quick btn btn-line btn-sm btn-block relative z-[2] mt-3">
            <span>View product</span>
          </Link>
        )}
      </div>
    </article>
  );
}
