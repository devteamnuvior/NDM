import type { ReactNode } from "react";
import { preload } from "react-dom";
import { HeroFilm, HeroFilmToggle, HeroStage } from "@/components/home/hero-stage";
import { Button } from "@/components/ui/button";
import { HERO } from "@/config/home";
import type { HomeCopy, ProofIcon } from "@/types/home";
import { withBase } from "@/lib/base-path";

const PROOF_ICONS: Record<ProofIcon, ReactNode> = {
  physician: (
    <>
      <path d="M4 2v3.5a3 3 0 006 0V2M7 8.5v1.8a3 3 0 006 0V9" />
      <circle cx="13" cy="7.8" r="1.2" />
    </>
  ),
  award: (
    <>
      <circle cx="8" cy="6" r="3.8" />
      <path d="M5.6 9.1L4.5 14l3.5-1.8 3.5 1.8-1.1-4.9" />
    </>
  ),
  clinics: (
    <>
      <path d="M8 14.5s4.5-4.2 4.5-7.8A4.5 4.5 0 008 2.2a4.5 4.5 0 00-4.5 4.5c0 3.6 4.5 7.8 4.5 7.8z" />
      <circle cx="8" cy="6.7" r="1.6" />
    </>
  ),
  analysis: <path d="M8 1.5l1.4 4.1 4.1 1.4-4.1 1.4L8 12.5 6.6 8.4 2.5 7l4.1-1.4z" />,
};

/** Home hero: one clinic film, the headline, the proof points and the brand band. */
export function Hero({ copy }: { copy: HomeCopy["hero"] }) {
  const { film, primaryCta, secondaryHref } = HERO;
  const { tagline, lead, strong, intro, button, proof, brands } = copy;
  /* the poster is the first thing painted on the home page */
  preload(withBase(film.poster), { as: "image", fetchPriority: "high" });

  return (
    <HeroStage>
      <HeroFilm {...film} />
      <div
        data-hero-words
        className="hf-in px-[var(--gx)] pt-[118px] pb-[76px] md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-x-12 md:pt-[clamp(150px,24vh,240px)] md:pb-[clamp(30px,5.5vh,60px)]"
      >
        <div>
          <p className="font-inter text-[clamp(14px,1.05vw,16px)] font-medium text-white/80">{tagline}</p>
          <h1 id="hero-title" className="mt-4 max-w-[14ch] font-aeonik text-[clamp(44px,6vw,94px)] leading-[1.02] font-normal tracking-[-0.035em] [text-shadow:0_20px_35px_rgba(0,0,0,.15)]">
            {lead}
            <br />
            <span className="tt-strong text-ndm-sky">{strong}</span>
          </h1>
          <p className="mt-5 max-w-[46ch] font-inter text-[clamp(16px,1.1vw+3px,20px)] leading-[1.5] text-white/85">{intro}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href={primaryCta.href} v="book" hot>
              {primaryCta.label}
            </Button>
            {button && (
              <Button href={secondaryHref} v="glass">
                {button}
              </Button>
            )}
          </div>
        </div>
        <ul
          className="mt-6 grid max-w-[calc(100%-8px)] grid-cols-2 gap-x-4 gap-y-2.5 font-inter text-[13px] leading-[1.35] font-medium text-white/85 sm:mt-7 sm:text-[14px] md:mt-0 md:max-w-none md:grid-cols-1 md:gap-y-3.5 md:rounded-[20px] md:border md:border-white/15 md:bg-white/[.08] md:px-6 md:py-5 md:backdrop-blur-[12px]"
          aria-label="Why clients choose NewDermaMed"
        >
          {proof.map((p, i) => (
            <li key={i} className="flex items-start gap-2 sm:items-center sm:gap-2.5 md:whitespace-nowrap">
              <svg viewBox="0 0 16 16" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0 text-[#7FD3F5] sm:mt-0">
                {PROOF_ICONS[p.icon]}
              </svg>
              {p.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="hf-band" data-float-avoid="">
        <HeroFilmToggle />
        <div className="marquee-mask min-w-0 flex-1 overflow-hidden" aria-label="Technology and brands we use">
          <div className="hf-marq">
            {[0, 1].map((copy) => (
              <ul key={copy} role="list" aria-hidden={copy === 1 || undefined}>
                {brands.map((b, i) => (
                  <li key={i} className="font-aeonik">
                    {b}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </HeroStage>
  );
}
