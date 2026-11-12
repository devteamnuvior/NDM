"use client";

import { Fragment, useEffect, useRef, type MouseEvent } from "react";
import { CLINIC_FILM } from "@/components/home/space";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { useReveal } from "@/hooks/use-reveal";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";

/** Pricing header: the clinic film (playing straight through, on a loop), the title, and three facts. */
export function PricingHero({ total }: { total: number }) {
  const section = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  useReveal(section);

  useEffect(() => {
    const v = film.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const browse = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = byId("prices");
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 40);
  };
  const stats: [string, string][] = [
    [`${total} treatments`, "Current prices and offers"],
    ["Free consultation", "Before every treatment"],
    ["2 Toronto clinics", "Uptown and Downtown"],
  ];

  return (
    <section ref={section} data-nav="dark" aria-labelledby="pricing-title" className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ndm-night pt-[150px] text-white md:h-[100svh] md:max-h-[1040px] md:min-h-[640px] md:pt-0">
      <video ref={film} src={CLINIC_FILM.src} poster={CLINIC_FILM.poster} muted loop playsInline preload="auto" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(90deg,rgba(11,15,19,.5) 0%,rgba(11,15,19,.18) 55%,rgba(11,15,19,.1) 100%),linear-gradient(180deg,rgba(11,15,19,.62) 0%,rgba(11,15,19,.2) 28%,rgba(11,15,19,.26) 50%,rgba(11,15,19,.86) 100%)" }}
      />
      {/* the page carries on below: a quiet "Scroll to prices" line at the right edge (clear of the bottom tab), which also scrolls there */}
      <a href="#prices" onClick={browse} className="pr-scroll absolute top-1/2 right-[var(--gx)] z-[1] hidden -translate-y-1/2 flex-col items-center gap-3 font-inter text-[11px] font-medium tracking-[.22em] text-white/75 uppercase transition-colors hover:text-white md:flex">
        <span style={{ writingMode: "vertical-rl" }}>Scroll to prices</span>
        <span aria-hidden="true" className="pr-scroll-line" />
      </a>
      <div className="px-[var(--gx)] pb-[clamp(84px,8vw,112px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-[760px]">
            <Eyebrow dark className="rv">
              Pricing
            </Eyebrow>
            <TwoTone as="h1" id="pricing-title" dark className="rv mt-5" size="text-[clamp(46px,6.4vw,100px)]" lead="Treatments &" strong="pricing" style={{ transitionDelay: ".06s" }} />
            <p className="rv mt-5 max-w-[50ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: ".12s" }}>
              Browse treatment costs and current offers below. Every treatment begins with a free consultation, so your provider can assess your needs before confirming your final price.
            </p>
            <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: ".18s" }}>
              <Button href="#prices" onClick={browse} v="glass">
                Browse all prices
              </Button>
              <Button href={ACTIONS.book} v="book" onDark>
                Book Free Consultation
              </Button>
            </div>
          </div>
          <ul className="rv flex items-center border-t border-white/15 pt-6 lg:border-0 lg:pt-0" role="list" style={{ transitionDelay: ".24s" }}>
            {stats.map(([title, line], k) => (
              <Fragment key={title}>
                <li className="min-w-0 flex-1 px-1 py-1 text-center lg:w-[clamp(170px,11.5vw,220px)] lg:flex-none">
                  <span className="block font-inter text-[13px] leading-[1.3] font-medium text-white capitalize sm:text-[15px]">{title}</span>
                  <span className="mt-1.5 block font-inter text-[11.5px] leading-[1.35] text-ndm-soft sm:mt-2.5 sm:text-[13px]">{line}</span>
                </li>
                {k < stats.length - 1 && <li role="presentation" aria-hidden="true" className="h-[50px] w-px shrink-0 bg-[#B9B9B9]/60" />}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
