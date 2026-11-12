"use client";

import { useRef } from "react";
import { ProcForm } from "@/components/treatment/proc-form";
import { IconArrow, IconPin } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import type { TxHeroContent } from "@/types/treatment";

/** Treatment page header: the photo with a slow parallax, the title, and the booking form on the right (desktop). */
export function ProcHero({ title, sub, hero, where, offer: o }: TxHeroContent) {
  const section = useRef<HTMLElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  useReveal(section);
  useOnScroll(() => {
    const img = photo.current;
    if (!img || !img.parentElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = img.closest("div");
    if (!frame) return;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.2, frame.offsetHeight * 0.1).toFixed(1)}px,0)`;
  });
  return (
    <section ref={section} data-nav="dark" aria-labelledby="proc-title" className="relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        {/* a wide photo, and a tall one for phones */}
        <picture>
          <source media="(max-width: 767px)" srcSet={hero.mobile} />
          { }
          <img ref={photo} src={hero.desktop} alt={hero.alt ?? ""} fetchPriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: hero.position }} />
        </picture>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{ background: "linear-gradient(90deg,rgba(11,15,19,.72) 0%,rgba(11,15,19,.38) 50%,rgba(11,15,19,.18) 100%),linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,0) 30%,rgba(11,15,19,.35) 100%)" }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden" style={{ background: "linear-gradient(180deg,rgba(11,15,19,.55) 0%,rgba(11,15,19,.25) 30%,rgba(11,15,19,.6) 62%,rgba(11,15,19,.88) 100%)" }} />
      <div className="grid items-end gap-10 px-[var(--gx)] pt-[184px] pb-[clamp(28px,4.5vw,64px)] sm:pt-[170px] lg:min-h-[min(100svh,920px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-center xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[640px]">
          <TwoTone
            as="h1"
            id="proc-title"
            dark
            className="rv"
            size="text-[clamp(44px,5.6vw,88px)]"
            lead={
              <>
                {title[0]}
                <br />
              </>
            }
            strong={title[1]}
          />
          <p className="rv mt-5 max-w-[48ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: ".08s" }}>
            {sub}
          </p>
          {where && (
            <p className="rv mt-3 flex items-start gap-2 font-inter text-[14px] leading-[1.5] text-white/75" style={{ transitionDelay: ".1s" }}>
              <IconPin size={15} className="mt-0.5 shrink-0 text-ndm-sky" />
              {where}
            </p>
          )}
          {/* the offer, at a glance: frosted glass with a light that sweeps across it now and then */}
          {o && (
            <a
              href={o.href}
              aria-label={`${o.tag}: ${o.title}, ${o.big.join(" ")}. ${o.cta}`}
              className="rv offer-glass offer-shine group mt-7 mb-5 inline-flex max-w-full items-center gap-4 overflow-hidden rounded-[18px] py-3 pr-3 pl-4 lg:mb-0"
              style={{ transitionDelay: ".16s" }}
            >
              <span className="min-w-0">
                <span className="offer-pill inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-inter text-[11px] font-medium">
                  <i className="offer-dot size-1.5 rounded-full bg-ndm-amber" />
                  {o.tag}
                </span>
                <span className="mt-1.5 block font-aeonik text-[17px] leading-[1.2] tracking-[-0.01em] text-white">{o.title}</span>
              </span>
              <span className="offer-big flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="font-inter text-[11px] tracking-[.14em] text-white/70 uppercase">{o.big[0]}</span>
                <span className="font-aeonik text-[34px] leading-none tracking-[-0.03em] text-white">{o.big[1]}</span>
                <span className="font-inter text-[11px] tracking-[.14em] text-[#FFC266] uppercase">{o.big[2]}</span>
              </span>
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-ndm-ink">
                <IconArrow />
              </span>
            </a>
          )}
        </div>
        <ProcForm id="hero-form" className="rv hidden lg:block" />
      </div>
    </section>
  );
}
