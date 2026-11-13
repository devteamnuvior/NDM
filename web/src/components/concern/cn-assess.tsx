import { IconTick } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { ACTIONS } from "@/config/routes";
import type { ConcernPage } from "@/types/concern";
import { withBase, withBaseSrcSet } from "@/lib/base-path";

/** Assessment: the free consultation and VISIA® skin analysis, and what we look at. */
export function CnAssess({ assess: a, short, number }: { assess: ConcernPage["assess"]; short: string; number: string }) {
  return (
    <RevealSection id="assess" aria-labelledby="assess-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <TxHead number={number} tag="Your consultation" headingId="assess-title" lead="How we assess" strong={short} />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(32px,4vw,64px)]`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8">
          <p className="font-inter text-[16px] leading-[1.7] text-ndm-ink/85">{a.text}</p>
          <p className="mt-6 font-inter text-[12.5px] font-semibold tracking-[.14em] text-ndm-deep uppercase">What we look at</p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2" role="list">
            {a.points.map((x) => (
              <li key={x} className="flex items-start gap-2.5 font-inter text-[15px] leading-[1.55] text-ndm-ink/85">
                <span aria-hidden="true" className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
                  <IconTick size={10} />
                </span>
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
            <a href="#/visia-skin-analysis" className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-deep">
              About the VISIA® skin analysis
              <IconArrow className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
        <div className="rv peach relative min-h-[300px] overflow-hidden rounded-[24px] bg-ndm-line lg:min-h-[420px]" style={{ transitionDelay: ".1s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the home page's own photo files, in two widths */}
          <img
            src={withBase("/assets/home/v3/visia-1440.webp")}
            srcSet={withBaseSrcSet("/assets/home/v3/visia-720.webp 720w, /assets/home/v3/visia-1440.webp 1440w")}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt="A NewDermaMed provider reviewing VISIA skin analysis results with a patient"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "28% 60%" }}
          />
          <span className="absolute bottom-3 left-3 rounded-[14px] bg-white/95 px-4 py-2.5 font-inter text-[13.5px] text-ndm-ink shadow-[0_18px_40px_-20px_rgba(27,36,43,.55)] backdrop-blur-[8px] sm:bottom-4 sm:left-4">Free VISIA® skin analysis with every consultation</span>
        </div>
      </div>
    </RevealSection>
  );
}
