"use client";

import { useRef, type MouseEvent } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { useReveal } from "@/hooks/use-reveal";
import type { PriceSpecialView } from "@/lib/pricing-view";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";

interface PriceSpecialsProps {
  specials: PriceSpecialView[];
  sub: string;
  note: string;
}

/** Exclusive monthly specials: eight cards; Buy opens that category in the price list below and scrolls to it. */
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
      <ul role="list" className="mx-auto mt-[clamp(28px,3.4vw,44px)] grid w-full max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-4">
        {specials.map((s, i) => (
          <li key={s.name} className="rv flex flex-col rounded-[20px] bg-white p-4 ring-1 ring-ndm-ink/[.06] md:p-5" style={{ transitionDelay: `${0.04 * i}s` }}>
            {s.offer ? (
              <span className="deal-badge self-start">
                <i aria-hidden="true">%</i>
                {s.offer}
              </span>
            ) : (
              <span className="self-start rounded-full bg-ndm-blue/10 px-2.5 py-1 font-inter text-[11px] font-semibold tracking-[.12em] text-ndm-deep uppercase">Special</span>
            )}
            <span className="mt-3 block font-inter text-[11px] tracking-[.16em] text-ndm-muted uppercase">From</span>
            <span className="mt-1 block font-aeonik text-[clamp(26px,2.4vw,34px)] leading-none tracking-[-0.03em] text-ndm-ink">
              {s.price}
              {s.unit ? <span className="ml-1 font-inter text-[13px] tracking-normal text-ndm-muted">{s.unit}</span> : null}
            </span>
            <span className="mt-2 block font-inter text-[15px] leading-[1.3] font-medium text-ndm-ink">{s.name}</span>
            <span className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-4">
              <a href={`#${s.target}`} onClick={(e) => go(e, s.target)} className="btn btn-buy h-9 px-4 text-[13px]">
                Buy
              </a>
              <span className="font-inter text-[12.5px] text-ndm-muted">{note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
