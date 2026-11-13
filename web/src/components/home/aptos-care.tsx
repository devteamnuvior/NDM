import type { CSSProperties } from "react";
import { AptosFigure } from "@/components/ui/aptos-figure";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { APTOS_EXPLORE } from "@/config/home";
import { ACTIONS } from "@/config/routes";
import { NAMICA_SPHERE_SRC } from "@/config/site";
import { pagePath } from "@/lib/routes";
import type { HomeCopy, PointIcon } from "@/types/home";

/* the chips' icons, as SVG paths */
const POINT_ICONS: Record<PointIcon, string> = {
  check: "M5 12l4 4 10-10",
  thread: "M4 18c4-10 12-2 16-12",
  shield: "M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4Z",
};

/**
 * Aptos, our signature: the thread figure with the turning NAMICA badge, the facts as three dials, the
 * points as chips and both buttons, then the four clinical marking photos.
 */
export function AptosCare({ copy }: { copy: HomeCopy["aptos"] }) {
  const { tag, lead, strong, intro, chip, dials, points, areas } = copy;
  const explore = APTOS_EXPLORE;
  /* the chip's number counts up when it is a whole number; anything else is shown as typed */
  const chipNumber = /^\d+$/.test(chip.number) ? Number(chip.number) : null;
  const chipBefore = chip.before ? `${chip.before} ` : "";
  return (
    <RevealSection aria-labelledby="aptos" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,140px)]">
      <div className="mx-auto grid max-w-[1340px] items-center gap-[clamp(40px,6vw,96px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* the tilted figure card and the turning NAMICA badge */}
        <div className="rv apx" aria-hidden="true">
          <div className="apx-one">
            <AptosFigure faceOnly className="h-full w-full" />
          </div>
          <div className="apx-globe">
            <svg className="apx-ring" viewBox="0 0 240 240">
              <defs>
                <path id="apxRing" d="M120,120 m-103,0 a103,103 0 1,1 206,0 a103,103 0 1,1 -206,0" />
              </defs>
              <circle className="apx-track" cx="120" cy="120" r="89" />
              <text>
                <textPath href="#apxRing" textLength="645" lengthAdjust="spacing">
                  A NEW ERA OF SOLID, LONG-LASTING BIOSTIMULATION · APTOS NAMICA ·{" "}
                </textPath>
              </text>
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote badge art, as in the prototype */}
            <img src={NAMICA_SPHERE_SRC} alt="" className="apx-sphere nm-spin" />
          </div>
          {(chip.number || chip.after) && (
            <span className="apx-chip apx-c1">
              {chipNumber === null ? <b className="tabular-nums">{chipBefore + chip.number}</b> : <CountUp as="b" className="tabular-nums" prefix={chipBefore} to={chipNumber} within=".apx" />}
              {chip.after}
            </span>
          )}
        </div>

        <div>
          <Eyebrow className="rv">{tag}</Eyebrow>
          <TwoTone
            id="aptos"
            className="rv mt-4"
            size="text-[clamp(34px,3.8vw,58px)]"
            lead={
              <>
                {lead}
                <br />
              </>
            }
            strong={strong}
            style={{ transitionDelay: ".05s" }}
          />
          <p className="rv mt-5 max-w-[48ch] font-inter text-[16px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {intro}
          </p>
          <ul className="rv sig-dials mt-8 grid grid-cols-3 gap-3 sm:gap-4" role="list" style={{ transitionDelay: ".14s" }}>
            {dials.map((d, i) => (
              <li key={i} className="sig-dial relative grid place-items-center rounded-[22px] bg-white px-2 py-5 ring-1 ring-ndm-ink/[.06]" style={{ "--k": Math.min(1, Math.max(0, (Number(d.fill) || 0) / 100)), "--d": `${0.15 * i}s` } as CSSProperties}>
                <svg viewBox="0 0 100 100" aria-hidden="true" className="sig-ring absolute top-[18px] left-1/2 size-[clamp(78px,7vw,96px)] -translate-x-1/2">
                  <circle cx="50" cy="50" r="44" className="sig-track" />
                  <circle cx="50" cy="50" r="44" className="sig-arc" pathLength="100" />
                </svg>
                <span className="relative grid size-[clamp(78px,7vw,96px)] place-items-center text-center" aria-hidden="true">
                  <span>
                    <b className="block font-aeonik text-[clamp(28px,2.6vw,36px)] leading-none font-normal tracking-[-0.03em] text-ndm-ink">{d.value}</b>
                    <span className="mt-0.5 block font-inter text-[11px] tracking-[.14em] text-ndm-deep uppercase">{d.unit}</span>
                  </span>
                </span>
                <span className="mt-3 block text-center font-inter text-[12.5px] leading-[1.3] text-ndm-muted">
                  <span className="sr-only">{d.spoken}. </span>
                  {d.label}
                </span>
              </li>
            ))}
          </ul>
          <ul className="rv mt-5 flex flex-wrap gap-2" role="list" style={{ transitionDelay: ".18s" }}>
            {points.map((p, i) => (
              <li key={i} className="sig-chip inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pr-4 pl-1.5 font-inter text-[13.5px] text-ndm-ink ring-1 ring-ndm-ink/[.07]">
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-ndm-deep/10 text-ndm-deep">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d={POINT_ICONS[p.icon]} />
                  </svg>
                </span>
                {p.label}
              </li>
            ))}
          </ul>
          <div className="rv mt-8 flex flex-wrap items-center gap-3" style={{ transitionDelay: ".22s" }}>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
            <Button href={pagePath(explore.page)} v="line">
              {explore.label}
            </Button>
          </div>
        </div>
      </div>

      {/* treatment areas: the clinical marking photos */}
      <div className="mx-auto mt-[clamp(64px,7vw,104px)] max-w-[1340px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rv font-inter text-[12px] tracking-[.14em] text-ndm-deep uppercase">{areas.tag}</p>
            <h3 className="rv mt-2 font-aeonik text-[clamp(26px,2.4vw,36px)] leading-[1.1] font-normal tracking-[-0.025em] text-ndm-ink">
              {areas.lead}
              <br />
              <span className="tt-strong text-ndm-deep">{areas.strong}</span>
            </h3>
          </div>
          <p className="rv max-w-[44ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">{areas.text}</p>
        </div>
        <ul className="no-scrollbar -mx-[var(--gx)] mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gx)] md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0" role="list">
          {areas.photos.map((ph, i) => (
            <li key={ph.src} className="rv w-[min(64vw,260px)] shrink-0 snap-start md:w-auto" style={{ transitionDelay: `${0.06 * i}s` }}>
              <figure className="group m-0 overflow-hidden rounded-[18px] border border-ndm-line bg-ndm-paper p-1.5">
                <div className="aspect-[4/5] overflow-hidden rounded-[13px] bg-ndm-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote clinical photo, as in the prototype */}
                  <img src={ph.src} alt={ph.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
                </div>
                <figcaption className="px-2.5 pt-2.5 pb-1.5 font-inter text-[11.5px] font-medium tracking-[.14em] text-ndm-muted uppercase">{ph.label}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
