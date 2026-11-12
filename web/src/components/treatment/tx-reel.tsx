"use client";

import { useRef } from "react";
import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { useClipInView } from "@/components/treatment/use-clip-in-view";
import { Button } from "@/components/ui/button";
import { IconArrow, IconInstagram } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { SOCIAL } from "@/config/social";
import { useReveal } from "@/hooks/use-reveal";
import type { ProcedurePage } from "@/types/treatment";

/** Watch: a short reel from the clinic's Instagram in a phone frame, beside the page's quick facts. */
export function TxReel({ reel: r, facts, number }: { reel: ProcedurePage["reel"]; facts: ProcedurePage["facts"]; number: string }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useReveal(section);
  useClipInView(section, video);
  return (
    <section ref={section} id="watch" aria-labelledby="watch-title" className="relative z-10 scroll-mt-[170px] overflow-hidden bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(40px,6vw,96px)]`}>
        <div>
          <TxTag number={number}>Watch</TxTag>
          <TwoTone
            id="watch-title"
            className="rv mt-5"
            size="text-[clamp(32px,3.4vw,50px)]"
            lead={
              <>
                {r.lead}
                <br />
              </>
            }
            strong={r.strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mt-4 max-w-[48ch] font-inter text-[16px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {r.text}
          </p>
          <dl className="rv mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3" style={{ transitionDelay: ".14s" }}>
            {facts.slice(0, 3).map(([k, v]) => (
              <div key={k} className="rounded-[18px] bg-white p-4 ring-1 ring-ndm-ink/[.06]">
                <dt className="font-inter text-[12px] text-ndm-muted">{k}</dt>
                <dd className="mt-1 font-inter text-[15px] leading-[1.3] font-semibold text-ndm-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rv mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ transitionDelay: ".18s" }}>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">
              <IconInstagram size={18} />
              @newdermamed
              <IconArrow className="transition-transform group-hover:translate-x-1" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="rv relative mx-auto lg:mx-0 lg:justify-self-center" style={{ transitionDelay: ".12s" }}>
          <span aria-hidden="true" className="tx-phone-glow" />
          <div className="tx-phone relative">
            <span aria-hidden="true" className="tx-phone-notch" />
            <div className="tx-phone-screen">
              <video ref={video} muted loop playsInline preload="none" poster={r.poster} aria-label={`${r.tag} reel from the NewDermaMed Instagram`}>
                <source src={r.src} type="video/mp4" />
              </video>
            </div>
          </div>
          <span className="tx-pill absolute top-[18%] -left-3 hidden items-center gap-2 rounded-full py-2 pr-4 pl-2 font-inter text-[13px] font-semibold text-ndm-ink md:flex">
            <i aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-ndm-amber text-white">
              <IconArrow size={11} />
            </i>
            {r.tag}
          </span>
          <span className="tx-pill absolute -right-2 bottom-[14%] hidden rounded-full px-4 py-2 font-inter text-[13px] text-ndm-ink md:block">Uptown &amp; Downtown Toronto</span>
        </div>
      </div>
    </section>
  );
}
