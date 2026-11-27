import Link from "next/link";
import { cad, percentOff } from "@/components/shop/product-card";
import { ShopCatalogView } from "@/components/shop/shop-catalog";
import { ShopHero } from "@/components/shop/shop-hero";
import { ShopRoutine } from "@/components/shop/shop-routine";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { SHOP_PAGE, productPath } from "@/config/shop";
import { CLINICS } from "@/config/site";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import { routines } from "@/lib/shop-related";
import { tel } from "@/lib/routes";
import type { ShopCard, ShopCatalog, ShopSale } from "@/types/shop";

/* the site's own photos (both versions keep them at these addresses) */
const PHOTOS = {
  detail: "/assets/home/v3/skinx-1366.webp",
  shelves: "/assets/home/v3/u4-1400.webp",
  visia: "/assets/home/v3/visia-1440.webp",
  facial: "/assets/home/v3/facial-1000.webp",
  pigment: "/assets/home/menu/cosmelan-dermamelan.jpg",
  room: "/assets/home/v3/tour-poster-1440.webp",
};

const shown = (p: ShopCard) => !!p.image && p.inStock && !p.areas.includes("Intimate");
const byPrice = (a: ShopCard, b: ShopCard) => b.regular - a.regular;
/** One product per product line and category, so a row never shows the same range twice. */
function oneEach(list: ShopCard[], count: number, byCategory = true): ShopCard[] {
  const seen = new Set<string>();
  return list
    .filter((p) => {
      const keys = [p.line || p.slug, byCategory ? p.categories[0] : ""].filter(Boolean) as string[];
      if (keys.some((k) => seen.has(k))) return false;
      keys.forEach((k) => seen.add(k));
      return true;
    })
    .slice(0, count);
}
const listWords = (words: string[]) => (words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : (words[0] ?? ""));
const ingredientsLine = (p: ShopCard) => p.ingredients.slice(0, 3).join(" · ") || p.productTypes[0] || p.categories[0] || "";

/** "Pick your number" in our style: three products on sale as large numbered cards. */
function Picks({ list, maxOff }: { list: ShopCard[]; maxOff: number }) {
  return (
    <RevealSection aria-labelledby="sp-picks" className="sp-picks px-[var(--gx)] pt-[clamp(72px,8vw,120px)]">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow className="rv">On sale now</Eyebrow>
          <TwoTone
            id="sp-picks"
            className="rv mt-5"
            size="text-[clamp(34px,4vw,60px)]"
            lead={
              <>
                {`Up to ${maxOff}% off,`}
                <br />
              </>
            }
            strong="selected skincare"
            style={{ transitionDelay: ".06s" }}
          />
        </div>
        <div className="rv max-w-[40ch]" style={{ transitionDelay: ".1s" }}>
          <p className="font-inter text-[15.5px] leading-[1.6] text-ndm-muted">Three of the products on sale now, at the online store&apos;s own prices.</p>
          <Link href={`${SHOP_PAGE}?avail=sale#products`} className="mt-2 inline-block font-inter text-[15px] font-medium text-ndm-deep underline-offset-4 hover:underline">
            See everything on sale
          </Link>
        </div>
      </div>
      <ul role="list" className="no-scrollbar -mx-[var(--gx)] mt-9 grid auto-cols-[minmax(286px,82vw)] grid-flow-col gap-3 overflow-x-auto px-[var(--gx)] pb-2 sm:auto-cols-[minmax(320px,1fr)] sm:gap-4 lg:mx-0 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {list.map((p, i) => (
          <li key={p.id} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
            <article className="sp-pick group relative flex h-full flex-col overflow-hidden rounded-[24px]">
              <div className="relative aspect-[4/3.4]">
                <span aria-hidden="true" className="sp-pick-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store */}
                <img src={p.image!.src} srcSet={p.image!.srcSet || undefined} sizes="(min-width: 1024px) 30vw, 80vw" alt="" loading="lazy" className="sp-pick-img absolute inset-0 h-full w-full object-contain" />
                <span className="sp-tag is-sale absolute top-4 left-4">{`Save ${percentOff(p)}%`}</span>
              </div>
              <div className="flex flex-1 flex-col px-5 pt-2 pb-5 sm:px-6 sm:pb-6">
                <p className="font-inter text-[13px] text-ndm-muted">{p.categories[0] ?? p.brand}</p>
                <h3 className="sp-name mt-1 font-aeonik text-[24px] leading-[1.15] tracking-[-0.02em] text-ndm-ink sm:text-[27px]">
                  <Link href={productPath(p.slug)} className="sp-link transition-colors group-hover:text-ndm-deep">
                    {p.name}
                  </Link>
                </h3>
                <p className="mt-1.5 font-inter text-[14px] text-ndm-muted">{ingredientsLine(p)}</p>
                <div className="sp-pick-bar mt-auto flex items-center justify-between gap-3">
                  <p className="font-inter text-ndm-ink">
                    <b className="text-[20px] font-semibold tabular-nums">{cad(p.price)}</b>
                    <s className="ml-2 text-[13px] text-ndm-muted/80 tabular-nums">{cad(p.regular)}</s>
                  </p>
                  <a href={p.addToCart} rel="nofollow" className="btn btn-ink btn-sm btn-buy relative z-[2]">
                    <span>Add to cart</span>
                    <span className="sr-only">{`: ${p.name}, opens the online store`}</span>
                  </a>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </RevealSection>
  );
}

/** A product on a dark photo band: photo on white, label, name, line, price and Add to cart. */
function GlassProduct({ p, label }: { p: ShopCard; label: string }) {
  return (
    <article className="sp-glass-card group relative flex min-w-0 gap-3 rounded-[20px] p-3 sm:gap-4 sm:p-4">
      <span className="block size-[88px] shrink-0 overflow-hidden rounded-[14px] bg-white sm:size-[128px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store */}
        {p.image && <img src={p.image.src} alt="" loading="lazy" className="h-full w-full object-contain" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-inter text-[12.5px] text-white/65">{label}</span>
        <Link href={productPath(p.slug)} className="sp-link sp-name mt-1 font-aeonik text-[20px] leading-[1.15] text-white sm:text-[22px]">
          {p.name}
        </Link>
        <span className="mt-1 line-clamp-2 font-inter text-[13.5px] leading-[1.45] text-white/70">{p.text}</span>
        <span className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3">
          <span className="font-inter text-white">
            <b className="text-[18px] font-semibold tabular-nums">{cad(p.price)}</b>
            {p.size && <span className="ml-2 text-[12.5px] text-white/55">{p.size.replace(/\s*\(.*\)$/, "")}</span>}
          </span>
          <a href={p.addToCart} rel="nofollow" className="btn btn-ink btn-sm btn-buy relative z-[2]">
            <span>Add to cart</span>
            <span className="sr-only">{`: ${p.name}, opens the online store`}</span>
          </a>
        </span>
      </span>
    </article>
  );
}

/** A full-width photo behind a band. */
function BandPhoto({ src, pos = "50% 50%", className = "" }: { src: string; pos?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer
    <img src={optimized(src, 1920)} srcSet={optimizedSrcSet(src, [828, 1200, 1920]) || undefined} sizes="100vw" alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover ${className}`} style={{ objectPosition: pos }} />
  );
}

/** Three quiet promises, above the closing card. */
const PERKS: [title: string, text: React.ReactNode][] = [
  ["Checkout on our online store", "Add to cart opens the NewDermaMed online store with the product in your cart."],
  ["Prices in Canadian dollars", "Straight from the online store, so they match what you pay there."],
  [
    "Returns",
    <>
      As set out in our{" "}
      <Link href="/refunds" className="text-ndm-deep underline-offset-4 hover:underline">
        refund policy
      </Link>
      . Individual results may vary.
    </>,
  ],
];

/**
 * /shop, after auna.framer.media's home page in the site's own design: the photo header with the floating card
 * (Black Friday while the sale runs, then products on sale), three products on sale as numbered cards, a dark band
 * with one product of each brand, the whole catalogue with its filters, a three-step routine, the pigment-control
 * range, three photo cards about the clinics, three promises and the consultation card. Every product, price and
 * count comes from the online store; the photos are the site's own.
 */
export function ShopPage({ catalog, sale }: { catalog: ShopCatalog; sale: ShopSale | null }) {
  const { products } = catalog;
  const [uptown] = CLINICS;
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => products.filter((p) => p.brand === b).length - products.filter((p) => p.brand === a).length);
  const sale$ = products.filter((p) => shown(p) && p.onSale).sort(byPrice);
  const maxOff = Math.max(0, ...sale$.map(percentOff));
  /* pigment control has its own band further down */
  const picks = oneEach(sale$.filter((p) => !p.categories.includes("Pigment Control")), 3);
  const featured = oneEach(sale$.filter((p) => !picks.includes(p)), 3);
  const flagships = brands.map((b) => products.filter((p) => shown(p) && p.brand === b && p.productTypes.includes("Concentrates and Serums")).sort(byPrice)[0] ?? products.filter((p) => shown(p) && p.brand === b).sort(byPrice)[0]).filter(Boolean).slice(0, 2);
  const pigment = products.filter((p) => p.categories.includes("Pigment Control"));
  const pigmentShown = oneEach(pigment.filter(shown).sort(byPrice), 3, false);
  const pigmentFrom = pigment.length ? Math.min(...pigment.map((p) => p.price)) : 0;
  const routineList = routines(products);

  return (
    <main id="main" data-shell="inner" data-page="shop" className="sp pt-[150px] xl:pt-[176px]">
      <Breadcrumb items={["Skincare shop"]} />

      <ShopHero count={products.length} brands={brands.length ? `${listWords(brands)}, ${products.length} products in all` : ""} featured={featured} sale={sale} maxOff={maxOff} />

      {picks.length > 0 && <Picks list={picks} maxOff={maxOff} />}

      {/* in every detail: a dark photo band with one product of each brand */}
      {flagships.length > 0 && (
        <RevealSection aria-labelledby="sp-detail" className="px-[var(--gx)] pt-[clamp(72px,8vw,120px)]">
          <div className="sp-band relative overflow-hidden rounded-[clamp(24px,2.6vw,36px)] px-[clamp(20px,4vw,64px)] pt-[clamp(48px,6vw,96px)] pb-[clamp(20px,3vw,40px)]">
            <BandPhoto src={PHOTOS.detail} pos="62% 58%" />
            <div className="sp-band-shade absolute inset-0" />
            <div className="relative max-w-[780px]">
              <TwoTone
                id="sp-detail"
                dark
                className="rv"
                size="text-[clamp(40px,5.4vw,82px)]"
                lead={
                  <>
                    Healthy-looking skin,
                    <br />
                  </>
                }
                strong="in every detail"
              />
              <p className="rv mt-5 max-w-[46ch] font-inter text-[16px] leading-[1.6] text-white/80" style={{ transitionDelay: ".08s" }}>
                The same medical-grade lines we carry at our Toronto clinics, for the days between your visits.
              </p>
            </div>
            <div className="relative mt-[clamp(40px,6vw,96px)] grid grid-cols-[minmax(0,1fr)] gap-3 sm:gap-4 lg:grid-cols-2">
              {flagships.map((p) => (
                <GlassProduct key={p.id} p={p} label={[p.brand, p.productTypes[0]].filter(Boolean).join(" · ")} />
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {catalog.ok ? (
        <ShopCatalogView products={products} facets={catalog.facets} />
      ) : (
        <section id="products" className="px-[var(--gx)] pt-[clamp(56px,6vw,96px)]">
          <div className="rounded-[22px] bg-ndm-mist px-6 py-10 text-center">
            <p className="font-inter text-[16px] text-ndm-ink">The product list is not available right now.</p>
            <p className="mt-2 font-inter text-[14.5px] text-ndm-muted">Please try again in a moment, or browse the online store directly.</p>
            <Button href={catalog.storeUrl} v="ink" sm className="btn-buy mt-5">
              Open the online store
            </Button>
          </div>
        </section>
      )}


      {routineList.length > 0 && <ShopRoutine list={routineList} />}

      {/* a range of its own, after the Reserve band: pigment control */}
      {pigment.length > 0 && (
        <RevealSection aria-labelledby="sp-line" className="px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
          <div className="sp-line relative grid overflow-hidden rounded-[clamp(24px,2.6vw,36px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="relative z-[2] px-[clamp(22px,4vw,64px)] py-[clamp(40px,5vw,80px)]">
              <TwoTone
                id="sp-line"
                dark
                className="rv"
                size="text-[clamp(38px,4.6vw,68px)]"
                lead={
                  <>
                    Pigment
                    <br />
                  </>
                }
                strong="control"
              />
              <p className="rv mt-5 max-w-[44ch] font-inter text-[16px] leading-[1.6] text-white/80" style={{ transitionDelay: ".06s" }}>
                {`${pigment.length} products from ${listWords([...new Set(pigment.map((p) => p.brand).filter(Boolean))])} for dark spots and an uneven-looking tone, including the Cosmelan and Dermamelan home packs.`}
              </p>
              <ul role="list" className="rv mt-7 max-w-[480px] border-t border-white/15" style={{ transitionDelay: ".1s" }}>
                {[
                  ["Home packs", "Follow-up packs for the in-clinic Cosmelan and Dermamelan methods"],
                  ["Daily care", "Creams and concentrates for an even-looking tone"],
                  ["Advice in clinic", "Your provider can tell you when and how to use them"],
                ].map(([t, d]) => (
                  <li key={t} className="border-b border-white/15 py-3.5">
                    <p className="font-aeonik text-[19px] leading-[1.2] text-white">{t}</p>
                    <p className="mt-1 font-inter text-[14px] text-white/65">{d}</p>
                  </li>
                ))}
              </ul>
              <div className="rv mt-8" style={{ transitionDelay: ".14s" }}>
                <Button href={`${SHOP_PAGE}?category=${encodeURIComponent("Pigment Control")}#products`} v="light">
                  {`Shop pigment control · from ${cad(pigmentFrom)}`}
                </Button>
              </div>
            </div>
            <div className="relative min-h-[360px] lg:min-h-0">
              <BandPhoto src={PHOTOS.pigment} pos="50% 35%" className="sp-line-photo" />
              <ul role="list" className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 sm:inset-x-6 sm:bottom-6 sm:gap-3">
                {pigmentShown.map((p) => (
                  <li key={p.id}>
                    <Link href={productPath(p.slug)} className="sp-line-tile group block">
                      <span className="block aspect-square overflow-hidden rounded-[12px] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store */}
                        {p.image && <img src={p.image.src} alt="" loading="lazy" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />}
                      </span>
                      <span className="sp-name mt-2 line-clamp-2 block font-inter text-[12.5px] leading-[1.3] text-white sm:text-[13.5px]">{p.name}</span>
                      <span className="block font-inter text-[12.5px] text-white/70 tabular-nums">{cad(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealSection>
      )}

      {/* made slowly, in our words: three photo cards about the clinics */}
      <RevealSection aria-labelledby="sp-why" className="px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
        <Eyebrow className="rv">Why shop with us</Eyebrow>
        <TwoTone
          id="sp-why"
          className="rv mt-5"
          size="text-[clamp(34px,4vw,60px)]"
          lead={
            <>
              Medical-grade skincare,
              <br />
            </>
          }
          strong="from your clinic"
          style={{ transitionDelay: ".06s" }}
        />
        <ul role="list" className="mt-9 grid gap-x-4 gap-y-9 md:grid-cols-3">
          {(
            [
              [PHOTOS.shelves, "Carried at our clinics", "The same lines we carry at our Uptown and Downtown clinics in Toronto.", "50% 50%"],
              [PHOTOS.visia, "Advice with a VISIA® analysis", "Ask about products at your free consultation, where we look at your skin with a VISIA® analysis.", "50% 35%"],
              [PHOTOS.facial, "Made for treatment days", "Home care to talk through with your provider before and after treatments. Individual results may vary.", "50% 30%"],
            ] as const
          ).map(([src, title, text, pos], i) => (
            <li key={title} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
              <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px] bg-ndm-mist">
                {/* eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer */}
                <img src={optimized(src, 828)} srcSet={optimizedSrcSet(src, [640, 828]) || undefined} sizes="(min-width: 768px) 32vw, 100vw" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: pos }} />
              </span>
              <h3 className="mt-5 border-t border-ndm-ink/[.1] pt-4 font-aeonik text-[23px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{title}</h3>
              <p className="mt-2 max-w-[40ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>
            </li>
          ))}
        </ul>
      </RevealSection>

      {/* three promises */}
      <ul role="list" className="sp-perks mx-[var(--gx)] mt-[clamp(64px,7vw,104px)] grid gap-6 border-y border-ndm-ink/[.1] py-7 md:grid-cols-3 md:gap-10">
        {PERKS.map(([t, d]) => (
          <li key={t}>
            <p className="font-inter text-[15px] font-semibold text-ndm-ink">{t}</p>
            <p className="mt-1 font-inter text-[14px] leading-[1.55] text-ndm-muted">{d}</p>
          </li>
        ))}
      </ul>

      {/* not sure where to start */}
      <section aria-labelledby="sp-book" className="px-[var(--gx)] pt-[clamp(56px,6vw,96px)] pb-[clamp(72px,8vw,120px)]">
        <div className="sp-cta relative overflow-hidden rounded-[clamp(24px,2.6vw,36px)] px-[clamp(22px,4.4vw,72px)] py-[clamp(56px,7vw,112px)] text-white">
          <BandPhoto src={PHOTOS.room} pos="60% 50%" />
          <div className="sp-cta-shade absolute inset-0" />
          <div className="relative max-w-[560px]">
            <TwoTone
              id="sp-book"
              dark
              size="text-[clamp(38px,4.6vw,68px)]"
              lead={
                <>
                  Not sure where
                  <br />
                </>
              }
              strong="to start?"
            />
            <p className="mt-5 max-w-[44ch] font-inter text-[16px] leading-[1.6] text-white/80">Book a free consultation. We look at your skin with a VISIA® analysis and can suggest a routine, with every step explained.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={ACTIONS.book} v="book" hot>
                Book Free Consultation
              </Button>
              <Button href={tel(uptown.phone)} v="glass">
                {`Call ${uptown.phone}`}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
