"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ProductCard, ProductTags, cad } from "@/components/shop/product-card";
import { TwoTone } from "@/components/ui/two-tone";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { storeAdd } from "@/config/shop";
import type { ShopCard, ShopImage, ShopProduct } from "@/types/shop";

const MAX_QTY = 10;
const SEEN_KEY = "ndm-shop-seen";

/* the site's own photos, used to fill the grid beside a product's own (both versions keep them at these addresses) */
const MOOD = ["/assets/treatments/journey-skin.webp", "/assets/home/v3/mirror-1440.webp", "/assets/home/v3/skinx-1366.webp", "/assets/home/v3/facial-1000.webp", "/assets/home/v3/visia-1440.webp"];

type Tile = { kind: "product"; img: ShopImage } | { kind: "mood"; src: string };

/** The product's photos, then the site's own photos to make an even grid of at least four (which ones depends on the product). */
function tilesOf(p: ShopProduct): Tile[] {
  const own: Tile[] = (p.gallery.length ? p.gallery : p.image ? [p.image] : []).map((img) => ({ kind: "product", img }));
  const want = Math.max(4, own.length + (own.length % 2));
  const fill: Tile[] = Array.from({ length: want - own.length }, (_, i) => ({ kind: "mood", src: MOOD[(p.id + i) % MOOD.length] }));
  return [...own.slice(0, 1), ...fill.slice(0, 1), ...own.slice(1), ...fill.slice(1)];
}

/** One product photo on white that zooms where the pointer is (wide screens with a mouse). */
function ZoomTile({ img, alt, eager }: { img: ShopImage; alt: string; eager: boolean }) {
  const [zoom, setZoom] = useState<CSSProperties | null>(null);
  const move = (e: MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ transformOrigin: `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`, transform: "scale(1.9)" });
  };
  return (
    <div className="spp-tile is-product relative h-full w-full overflow-hidden bg-white" onMouseMove={move} onMouseLeave={() => setZoom(null)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store (transparent PNG on white) */}
      <img src={zoom ? img.large : img.src} srcSet={zoom ? undefined : img.srcSet || undefined} sizes="(min-width: 1024px) 28vw, 86vw" alt={alt} fetchPriority={eager ? "high" : undefined} loading={eager ? "eager" : "lazy"} className="spp-img absolute inset-0 h-full w-full object-contain" style={zoom ?? undefined} />
    </div>
  );
}

/**
 * The photos, after auna.framer.media's product page: a grid of two columns on wide screens (the product's own
 * photos on white, the site's skin photos between them), a row to swipe on phones with a counter.
 */
export function ProductGallery({ p }: { p: ShopProduct }) {
  const tiles = tilesOf(p);
  const row = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(0);
  let n = 0;
  return (
    <div className="spp-photos relative">
      <div
        ref={row}
        onScroll={(e) => {
          const el = e.currentTarget;
          setOn(Math.round(el.scrollLeft / Math.max(1, el.clientWidth * 0.86)));
        }}
        className="no-scrollbar -mx-[var(--gx)] flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[var(--gx)] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible lg:px-0"
      >
        {tiles.map((t, i) => (
          <div key={t.kind === "product" ? t.img.src : `${t.src}-${i}`} className="relative aspect-[4/4.4] w-[86%] shrink-0 snap-center overflow-hidden rounded-[22px] bg-ndm-mist lg:w-auto">
            {t.kind === "product" ? (
              <ZoomTile img={t.img} alt={`${p.name}${++n > 1 ? `, photo ${n}` : ""}`} eager={i === 0} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer
              <img src={optimized(t.src, 828)} srcSet={optimizedSrcSet(t.src, [640, 828]) || undefined} sizes="(min-width: 1024px) 28vw, 86vw" alt="" loading="lazy" className="spp-tile is-mood absolute inset-0 h-full w-full object-cover" />
            )}
            {i === 0 && <ProductTags p={p} className="absolute top-4 left-4" />}
          </div>
        ))}
      </div>
      <p aria-hidden="true" className="mt-3 text-center font-inter text-[12.5px] text-ndm-muted tabular-nums lg:hidden">
        {`${Math.min(on + 1, tiles.length)} / ${tiles.length}`}
      </p>
    </div>
  );
}

/**
 * Quantity, Add to cart and Buy now (both open the online store with the product and quantity added: its cart, or
 * its checkout), and on phones a bar with the price and Add to cart that shows once these buttons scroll away.
 */
export function ProductBuy({ p }: { p: ShopProduct }) {
  const [qty, setQty] = useState(1);
  const [bar, setBar] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  /* shown once the buttons have scrolled up out of view */
  useOnScroll(() => {
    const el = box.current;
    if (el) setBar(el.getBoundingClientRect().bottom < 0);
  });

  if (!p.inStock) {
    return (
      <div ref={box} className="mt-7">
        <p className="rounded-[16px] bg-ndm-mist px-5 py-4 font-inter text-[14.5px] text-ndm-ink">This product is sold out on the online store for now. Ask either clinic about it, or see similar products below.</p>
      </div>
    );
  }
  return (
    <>
      <div ref={box} className="mt-7 flex flex-wrap items-stretch gap-3">
        <div className="spp-qty flex h-[52px] items-center rounded-full bg-white ring-1 ring-ndm-ink/[.12]">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One less" className="grid h-full w-12 place-items-center rounded-l-full text-ndm-ink disabled:text-ndm-muted/40">
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 7h8" />
            </svg>
          </button>
          <label className="sr-only" htmlFor="spp-qty">
            Quantity
          </label>
          <input id="spp-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.min(MAX_QTY, Math.max(1, Number.parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)))} className="w-8 bg-transparent text-center font-inter text-[16px] font-medium text-ndm-ink tabular-nums outline-none" />
          <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="One more" className="grid h-full w-12 place-items-center rounded-r-full text-ndm-ink disabled:text-ndm-muted/40">
            <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 7h8M7 3v8" />
            </svg>
          </button>
        </div>
        <a href={storeAdd(p.id, qty)} rel="nofollow" className="spp-tall btn btn-ink btn-buy min-w-[180px] flex-1">
          <span>
            Add to cart<span className="max-[420px]:hidden">{` · ${cad(p.price * qty)}`}</span>
          </span>
          <span className="sr-only">, opens the online store</span>
        </a>
        <a href={storeAdd(p.id, qty, "checkout")} rel="nofollow" className="spp-tall btn btn-line w-full">
          <span>Buy now</span>
          <span className="sr-only">, opens the online store&apos;s checkout</span>
        </a>
      </div>

      {/* phones: the price and Add to cart stay in reach */}
      <div className={`spp-bar fixed inset-x-0 bottom-0 z-[90] border-t border-ndm-ink/[.08] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden ${bar ? "is-on" : ""}`} aria-hidden={!bar}>
        <div className="flex items-center gap-3">
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store
            <img src={p.image.src} alt="" className="size-11 shrink-0 rounded-[10px] bg-white object-contain ring-1 ring-ndm-ink/[.06]" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-inter text-[13.5px] text-ndm-ink">{p.name}</span>
            <span className="block font-inter text-[14px] font-semibold text-ndm-ink tabular-nums">{cad(p.price)}</span>
          </span>
          <a href={storeAdd(p.id, qty)} rel="nofollow" tabIndex={bar ? 0 : -1} className="btn btn-ink btn-sm btn-buy shrink-0">
            <span>Add to cart</span>
          </a>
        </div>
      </div>
    </>
  );
}

/** "Recently viewed": the last products opened in this browser (kept in localStorage, product slugs only), this one left out. */
export function RecentlyViewed({ slug, all }: { slug: string; all: ShopCard[] }) {
  const [seen, setSeen] = useState<string[]>([]);
  useEffect(() => {
    let list: string[] = [];
    try {
      list = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
      if (!Array.isArray(list)) list = [];
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 12)));
    } catch {
      /* storage blocked: nothing to show */
    }
    setSeen(list.filter((s) => s !== slug)); // eslint-disable-line react-hooks/set-state-in-effect -- the list lives in this browser only
  }, [slug]);
  const cards = seen.map((s) => all.find((p) => p.slug === s)).filter((p): p is ShopCard => !!p).slice(0, 4);
  if (!cards.length) return null;
  return (
    <section aria-labelledby="spp-seen" className="px-[var(--gx)] pt-[clamp(56px,6vw,96px)]">
      <TwoTone
        id="spp-seen"
        size="text-[clamp(28px,2.8vw,40px)]"
        lead={
          <>
            Recently
            <br />
          </>
        }
        strong="viewed"
      />
      <ul role="list" className="mt-6 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.id}>
            <ProductCard p={c} sizes="(min-width: 1024px) 22vw, 46vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
