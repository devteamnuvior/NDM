"use client";

import { useRef, type MouseEvent } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { useReveal } from "@/hooks/use-reveal";
import type { PriceSpecialView } from "@/lib/pricing-view";
import { withBase } from "@/lib/base-path";
import { jumpToPriceGroup } from "@/lib/price-jump";
import { BestDealProvider, OfferTag, SaleNameProvider, useSaleTags } from "@/components/pricing/sale-tags";
import { money } from "@/lib/cart";

interface PriceSpecialsProps {
  specials: PriceSpecialView[];
  sub: string;
  note: string;
}

/**
 * Exclusive monthly specials: centred cards; Buy opens that category in the price list below and scrolls to it.
 * Since 2026-11-25 (user) they wear the price list's own theme: white cards like its panels, the list's pill for the same
 * treatment or category (the sale's black and red, the red halves on fire, "BEST DEAL" beside a one-part offer), and the
 * price in the sale's red with the regular price struck through.
 */
export function PriceSpecials(props: PriceSpecialsProps) {
  return (
    <SaleNameProvider shown={false}>
      <BestDealProvider shown>
        <SpecialsSection {...props} />
      </BestDealProvider>
    </SaleNameProvider>
  );
}

function SpecialsSection({ specials, sub, note }: PriceSpecialsProps) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const sale = useSaleTags();

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (jumpToPriceGroup(`${id}-h`)) e.preventDefault();
  };

  return (
    <section ref={section} id="specials" aria-labelledby="specials-title" className="relative z-10 scroll-mt-[150px] px-[var(--gx)] py-[clamp(48px,5.5vw,80px)]">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow className="rv">Monthly specials</Eyebrow>
        <TwoTone
          id="specials-title"
          className="rv mx-auto mt-5"
          size="text-[clamp(30px,3.2vw,46px)]"
          lead={
            <>
              Exclusive
              <br />
            </>
          }
          strong="monthly specials"
          style={{ transitionDelay: ".06s" }}
        />
        <p className="rv mx-auto mt-4 font-inter text-[15px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
          {sub}
        </p>
      </div>
      {/* centred cards: the offer pill, a From chip, the price with its unit, the name, Buy and the note */}
      <ul role="list" className="mx-auto mt-[clamp(28px,3.4vw,44px)] grid w-full max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {specials.map((s, i) => {
          const cut = !!sale && s.was > 0;
          return (
            <li key={s.id} className="rv psx" style={{ transitionDelay: `${0.04 * i}s` }}>
              <span className="psx-tag">
                <OfferTag offer={s.offer} badge={s.badge} coded={s.coded} small />
              </span>
              <span className="psx-from">From</span>
              <span className="psx-price">
                {cut && (
                  <s className="psx-was">
                    <span className="sr-only">Regular price </span>
                    {money(s.was)}
                  </s>
                )}
                <span data-look={sale?.look} className={`psx-now ${cut ? "is-sale" : ""}`}>
                  {cut && <span className="sr-only">now </span>}
                  {s.price}
                </span>
                {s.unit && <span className="psx-unit">{s.unit}</span>}
              </span>
              <span className="psx-name">{s.name}</span>
              <span className="psx-act">
                <a href={withBase(`#${s.target}`)} onClick={(e) => go(e, s.target)} className="btn btn-buy h-10 px-6 text-[14px]">
                  Buy
                </a>
                <span className="psx-note">{note}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
