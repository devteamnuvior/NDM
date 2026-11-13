import type { CSSProperties } from "react";
import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { BaCompare } from "@/components/ui/ba-compare";
import { Button } from "@/components/ui/button";
import { IconArrow, IconInfo } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { BA_DISCLAIMER } from "@/config/before-after";
import { pagePath } from "@/lib/routes";
import { TxPhoto } from "@/components/treatment/tx-photo";
import type { TxResultsContent } from "@/types/treatment";
import { withBase } from "@/lib/base-path";

/* the fanned stack of photos on the "more cases" tile: tilt, sideways shift and stacking order */
const FAN = [
  { r: -12, x: -44, z: 1 },
  { r: 0, x: 0, z: 3 },
  { r: 12, x: 44, z: 2 },
];

/**
 * Results: compare cards side by side (two per row on phones). With fewer than four real cases the last
 * place is a "more cases" tile that opens the gallery, rather than a repeated photo.
 */
export function TxResults({ results: t, number }: { results: TxResultsContent; number: string }) {
  const gallery = pagePath("beforeAfter");
  const all = t.cases ?? [];
  const cases = all.slice(0, 4);
  return (
    <RevealSection id="results" aria-labelledby="results-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={TX_WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <TxTag number={number}>Before &amp; after</TxTag>
            <TwoTone
              id="results-title"
              className="rv mt-4"
              size="text-[clamp(32px,3.4vw,50px)]"
              lead={
                <>
                  {t.lead}
                  <br />
                </>
              }
              strong={t.strong}
              style={{ transitionDelay: ".05s" }}
            />
            <p className="rv mt-4 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
              {t.text}
            </p>
          </div>
          <div className="rv" style={{ transitionDelay: ".12s" }}>
            <Button href={gallery} target="_blank" rel="noopener" v="line">
              See all before &amp; after
            </Button>
          </div>
        </div>
        {t.pics ? (
          <ul role="list" className="mt-[clamp(32px,4vw,52px)] grid gap-4 sm:grid-cols-3">
            {t.pics.map((c, i) => (
              <li key={c.src} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
                <figure className="m-0 overflow-hidden rounded-[22px] bg-white p-2.5 shadow-[0_22px_44px_-36px_rgba(27,36,43,.35)] ring-1 ring-ndm-ink/[.06]">
                  <span className="relative block aspect-[431/310] overflow-hidden rounded-[16px] bg-ndm-mist">
                    <TxPhoto src={c.src} alt={`${c.label}, before and after`} sizes="(min-width: 640px) 380px, 100vw" className="absolute inset-0 h-full w-full object-cover" />
                  </span>
                  <figcaption className="flex items-baseline justify-between gap-3 px-1.5 pt-3 pb-1">
                    <span className="font-aeonik text-[18px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{c.label}</span>
                    <span className="font-inter text-[12.5px] text-ndm-muted">Before · After</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <ul role="list" className="mt-[clamp(32px,4vw,52px)] grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-x-4">
            {cases.map((c, i) => (
              <li key={c.id} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
                <figure className="m-0">
                  <BaCompare c={c} i={i} nudge={i < 2} />
                  <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="font-aeonik text-[18px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">Case {c.id}</span>
                    <span className="font-inter text-[13px] text-ndm-muted">{c.view}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
            {cases.length < 4 && (
              <li className="rv" style={{ transitionDelay: `${0.06 * cases.length}s` }}>
                <a href={withBase(gallery)} target="_blank" rel="noopener" className="tx-more group relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-[22px] p-2.5 text-white sm:p-3.5">
                  <span aria-hidden="true" className="tx-more-mesh absolute inset-0" />
                  <span aria-hidden="true" className="relative mx-auto mt-[6%] h-[50%] w-full">
                    {all.slice(0, 3).map((c, k) => (
                      /* eslint-disable-next-line @next/next/no-img-element -- case photo served by the clinic's site, as in the prototype */
                      <img
                        key={c.id}
                        src={withBase(c.after)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="tx-more-pic absolute"
                        style={{ "--r": `${FAN[k].r}deg`, "--x": `${FAN[k].x}%`, zIndex: FAN[k].z, objectPosition: `${c.fx || 50}% 30%` } as CSSProperties}
                      />
                    ))}
                  </span>
                  <span className="tx-more-glass relative mt-auto flex items-end justify-between gap-2 rounded-[14px] p-2.5 sm:rounded-[16px] sm:p-4">
                    <span className="min-w-0">
                      <span className="hidden font-inter text-[11.5px] font-semibold tracking-[.16em] text-white/75 uppercase sm:block">Gallery</span>
                      <span className="block font-aeonik text-[clamp(18px,1.8vw,26px)] leading-[1.08] tracking-[-0.02em] sm:mt-1">More cases</span>
                      <span className="mt-1 hidden font-inter text-[13px] leading-[1.4] text-white/85 sm:block">See the full before &amp; after gallery</span>
                      <span className="mt-0.5 block font-inter text-[12px] text-white/85 sm:hidden">Full gallery</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ndm-deep transition-transform duration-500 group-hover:-rotate-45 sm:size-12">
                      <IconArrow />
                    </span>
                  </span>
                </a>
              </li>
            )}
          </ul>
        )}
        <p className="mt-8 flex items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-ndm-muted">
          <IconInfo className="mt-0.5 shrink-0" />
          {BA_DISCLAIMER}
        </p>
      </div>
    </RevealSection>
  );
}
