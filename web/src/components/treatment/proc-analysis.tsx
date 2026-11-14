"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import journey from "@/assets/images/treatments/journey-skin.webp";
import { TX_WRAP } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SiteLink } from "@/components/ui/site-link";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { pageLink, pagePath } from "@/lib/routes";
import { withBase } from "@/lib/base-path";

const delay = (k: number) => ({ transitionDelay: `${0.75 + k * 0.12}s` });

/**
 * Start your journey: a rounded photo card that opens from the middle while its words sharpen from a blur.
 * The card is clipped to nothing until it opens, so its section is what is watched.
 */
export function ProcAnalysis() {
  const card = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = card.current;
    if (!el?.parentElement) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el.parentElement);
    return () => io.disconnect();
  }, []);
  /* a second trigger from the scroll position, in case the browser delays the visibility check */
  useOnScroll(() => {
    const el = card.current;
    if (!el?.parentElement || on) return;
    if (el.parentElement.getBoundingClientRect().top < window.innerHeight * 0.85) setOn(true);
  });
  return (
    <section aria-labelledby="analysis-title" className="relative z-10 px-[var(--gx)] py-[clamp(40px,5vw,72px)]">
      <div
        ref={card}
        className={`jr-card ${TX_WRAP} relative isolate flex min-h-[600px] flex-col justify-end overflow-hidden rounded-[24px] p-6 text-white md:min-h-[clamp(460px,40vw,520px)] md:justify-center md:rounded-[32px] md:p-[56px] ${on ? "is-on" : ""}`}
      >
        <Image src={withBase(journey)} alt="" sizes="(min-width: 768px) 780px, 100vw" className="jr-pic absolute inset-0 -z-20 h-full w-full object-cover object-[47%_28%] md:left-auto md:w-[66%] md:object-[50%_30%]" />
        <span aria-hidden="true" className="jr-shade absolute inset-0 -z-10" />
        <div className="max-w-[620px]">
          <div className="jr-t" style={delay(0)}>
            <Eyebrow dark>Start your journey</Eyebrow>
          </div>
          <TwoTone
            id="analysis-title"
            dark
            className="jr-t mt-5"
            size="text-[clamp(32px,3.4vw,48px)]"
            lead={
              <>
                Start with a free
                <br />
              </>
            }
            strong="skin analysis"
            style={delay(1)}
          />
          <p className="jr-t mt-4 max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-white/80" style={delay(2)}>
            Your first consultation and VISIA® skin analysis are free, at Uptown or Downtown. No pressure, just a clear plan.
          </p>
          <div className="jr-t mt-7 flex flex-wrap items-center gap-x-5 gap-y-3" style={delay(3)}>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
            <SiteLink to={{ ...pageLink("about"), href: `${pagePath("about")}#contact` }} className="btn btn-light">
              <span>Find a clinic</span>
            </SiteLink>
          </div>
        </div>
      </div>
    </section>
  );
}
