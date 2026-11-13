import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { PRODUCTS, SHOP_ORBIT_TILES, SHOP_URL } from "@/config/shop";
import type { HomeCopy } from "@/types/home";

/* product photos come from the shop's own site, already at 300 px, as in the prototype */
/* eslint-disable @next/next/no-img-element */

/* one large circle of product tiles turning slowly above the heading; only its upper arc shows, the rest
   fades out. Tiles keep the same size on every screen, only the circle's radius changes. */
function ShopOrbit() {
  const tiles = Array.from({ length: SHOP_ORBIT_TILES }, (_, i) => PRODUCTS[i % PRODUCTS.length]);
  return (
    <div aria-hidden="true" className="shop-orbit pointer-events-none absolute inset-0 overflow-hidden">
      <div className="shop-ring absolute top-[var(--orbit-top)] left-1/2 size-[calc(var(--r)*2)]">
        {tiles.map((p, i) => (
          <span key={i} className="shop-tile absolute top-1/2 left-1/2" style={{ transform: `rotate(${(i / SHOP_ORBIT_TILES) * 360}deg) translateY(calc(var(--r) * -1)) rotate(${i % 2 ? 9 : -7}deg)` }}>
            <img src={p.image} alt="" decoding="async" className="h-full w-full object-contain" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Skincare shop: the turning circle of products, the heading and link to the shop, then twelve products. */
export function Shop({ copy }: { copy: HomeCopy["shop"] }) {
  const items = PRODUCTS.slice(0, 12);
  return (
    <RevealSection aria-labelledby="shop" className="relative z-10 bg-ndm-paper pb-[clamp(8px,1.5vw,20px)]">
      <div className="shop-stage relative">
        <ShopOrbit />
        <div className="relative px-[var(--gx)] pt-[var(--head-top)] text-center">
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="shop"
            className="rv mx-auto mt-4"
            lead={
              <>
                {copy.lead}
                <br />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mx-auto mt-4 max-w-[48ch] font-inter text-[16px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {copy.text}
          </p>
          <div className="rv mt-6 flex justify-center" style={{ transitionDelay: ".14s" }}>
            <Button href={SHOP_URL} target="_blank" rel="noopener" v="ink">
              {copy.button}
              <span className="sr-only"> (opens in a new tab)</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="relative mt-[clamp(20px,2.6vw,36px)] px-[var(--gx)] lg:mt-12!">
        <ul role="list" className="shop-list mx-auto grid max-w-[1280px] grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {items.map((p, i) => (
            <li key={p.href} className={`rv ${i >= 6 ? "hidden lg:block" : ""}`} style={{ transitionDelay: `${0.04 * (i % 6)}s` }}>
              <a href={p.href} target="_blank" rel="noopener" className="group flex h-full items-center gap-3 rounded-[16px] bg-ndm-mist/70 p-2 transition-colors hover:bg-ndm-mist sm:gap-4 sm:p-2.5">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white sm:size-[68px]">
                  <img src={p.image} alt="" loading="lazy" className="h-[86%] w-[86%] object-contain transition-transform duration-500 group-hover:scale-105" />
                </span>
                <span className="min-w-0">
                  <span className="block font-inter text-[14px] leading-[1.3] text-ndm-ink capitalize sm:text-[16px]">{p.name}</span>
                  <span className="mt-1 block font-inter text-[13px] text-ndm-muted sm:text-[14.5px]">{p.size}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
