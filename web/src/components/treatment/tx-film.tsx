"use client";

import { useEffect, useRef, useState } from "react";
import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { useClipInView } from "@/components/treatment/use-clip-in-view";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import { pageLink, pagePath } from "@/lib/routes";
import type { ProcedurePage } from "@/types/treatment";
import { withBase } from "@/lib/base-path";

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <path d="m16 9 5 6" />
          <path d="m21 9-5 6" />
        </>
      )}
    </svg>
  );
}

/** The clinic on film: the one clinic video drifting slowly behind the page's name, with the two addresses and a sound button. */
export function TxFilm({ film: f, number }: { film: ProcedurePage["film"]; number: string }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);
  useReveal(section);
  useClipInView(section, video);
  useEffect(() => {
    if (video.current) video.current.muted = !sound;
  }, [sound]);
  useOnScroll(() => {
    const el = section.current;
    const v = video.current;
    if (!el || !v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const k = clamp01((vh - r.top) / (vh + r.height));
    v.style.transform = `translate3d(0,${((k - 0.5) * 60).toFixed(1)}px,0)`;
  });
  return (
    <section ref={section} id="film" data-nav="dark" aria-labelledby="film-title" className="tx-film relative z-10 scroll-mt-[120px] overflow-hidden px-[var(--gx)] py-[clamp(56px,9vw,140px)] text-white">
      <video ref={video} muted loop playsInline preload="none" poster={withBase(f.poster)} src={withBase(f.src)} aria-label="A walk through the NewDermaMed clinic" />
      <span aria-hidden="true" className="tx-film-shade absolute inset-0" />
      <svg aria-hidden="true" className="tx-film-ring hidden text-white/80 md:block" viewBox="0 0 100 100">
        <defs>
          <path id="tx-film-ring-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text fontSize="9.2" fontFamily="Inter, sans-serif" letterSpacing="2.2" fill="currentColor">
          <textPath href="#tx-film-ring-path">UPTOWN · DOWNTOWN · TORONTO · NEWDERMAMED · </textPath>
        </text>
        <circle cx="50" cy="50" r="6" fill="#FFA617" />
      </svg>
      <div className={`${TX_WRAP} relative`}>
        <TxTag number={number} dark>
          Inside the clinic
        </TxTag>
        <TwoTone
          id="film-title"
          dark
          className="rv mt-5 max-w-[14ch]"
          size="text-[clamp(34px,4.4vw,64px)]"
          lead={
            <>
              {f.lead}
              <br />
            </>
          }
          strong={f.strong}
          style={{ transitionDelay: ".06s" }}
        />
        <p className="rv mt-5 max-w-[50ch] font-inter text-[clamp(15.5px,1.15vw,17px)] leading-[1.6] text-white/80" style={{ transitionDelay: ".1s" }}>
          {f.text}
        </p>
        <ul className="rv mt-8 hidden flex-wrap gap-2 sm:flex" role="list" style={{ transitionDelay: ".14s" }}>
          {f.chips.map((c) => (
            <li key={c} className="tx-film-chip rounded-full px-4 py-2 font-inter text-[13.5px] text-white/90">
              {c}
            </li>
          ))}
        </ul>
        <div className="rv mt-8 flex flex-wrap items-center gap-3" style={{ transitionDelay: ".18s" }}>
          <Button href={ACTIONS.book} v="book" hot>
            Book Free Consultation
          </Button>
          <span className="hidden sm:contents">
            <SiteLink to={{ ...pageLink("about"), href: `${pagePath("about")}#contact` }} className="btn btn-glass">
              <span>Find a clinic</span>
            </SiteLink>
          </span>
          <button
            type="button"
            onClick={() => setSound((x) => !x)}
            aria-pressed={sound}
            aria-label={sound ? "Turn the sound off" : "Turn the sound on"}
            className="tx-film-sound grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-[12px] transition-colors hover:bg-white/20"
          >
            <SoundIcon on={sound} />
          </button>
        </div>
      </div>
    </section>
  );
}
