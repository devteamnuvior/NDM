"use client";

import { useRef, type MouseEvent } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { useReveal } from "@/hooks/use-reveal";
import type { PriceSpecialView } from "@/lib/pricing-view";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";
import { withBase } from "@/lib/base-path";

interface PriceSpecialsProps {
  specials: PriceSpecialView[];
  sub: string;
  note: string;
}

/** Exclusive monthly specials: twelve centred cards; Buy opens that category in the price list below and scrolls to it. */
export function PriceSpecials({ specials, sub, note }: PriceSpecialsProps) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = byId(`${id}-h`);
    if (!el) return;
    e.preventDefault();
    if (el.getAttribute("aria-expanded") !== "true") el.click();
    scrollToY(el.getBoundingClientRect().top + window.scrollY - 150);
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
      {/* centred cards: the red offer tag, a From chip, the price with its unit, the name, Buy and the note */}
      <ul role="list" className="mx-auto mt-[clamp(28px,3.4vw,44px)] grid w-full max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {specials.map((s, i) => (
          <li key={s.name} className="rv ps-card flex flex-col items-center rounded-[22px] bg-white px-3 pt-4 pb-5 text-center ring-1 ring-ndm-ink/[.06] md:px-5 md:pt-5 md:pb-6" style={{ transitionDelay: `${0.04 * i}s` }}>
            {s.offer ? (
              <span className="deal-badge">
                <i aria-hidden="true">%</i>
                {s.offer}
              </span>
            ) : (
              /* keeps the tag's place, so every card's price sits on one line */
              <span className="deal-badge invisible" aria-hidden="true">
                <i>%</i>Offer
              </span>
            )}
            <span className="mt-4 rounded-full bg-ndm-blue/10 px-3 py-1 font-inter text-[11px] font-semibold tracking-[.16em] text-ndm-deep uppercase">From</span>
            <span className="mt-3 flex flex-wrap items-baseline justify-center gap-x-1">
              <span className="font-aeonik text-[clamp(30px,3vw,44px)] leading-none tracking-[-0.03em] text-ndm-ink">{s.price}</span>
              {s.unit && <span className="font-inter text-[13px] whitespace-nowrap text-ndm-muted md:text-[14px]">{s.unit}</span>}
            </span>
            <span className="mt-2.5 block font-inter text-[15px] leading-[1.3] font-medium text-ndm-ink md:text-[16.5px]">{s.name}</span>
            <span className="mt-auto flex flex-col items-center pt-4">
              <a href={withBase(`#${s.target}`)} onClick={(e) => go(e, s.target)} className="btn btn-buy h-10 px-6 text-[14px]">
                Buy
              </a>
              <span className="mt-2 font-inter text-[12.5px] text-ndm-muted">{note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
