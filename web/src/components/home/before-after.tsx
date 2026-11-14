"use client";

import { useEffect, useRef, useState } from "react";
import { BaCompare } from "@/components/ui/ba-compare";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow, IconInfo } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { BA_DISCLAIMER, BA_MODELS } from "@/config/before-after";
import { HOME_COPY } from "@/config/home";
import { useReveal } from "@/hooks/use-reveal";
import { pagePath } from "@/lib/routes";
import type { HomeCopy } from "@/types/home";

const CASES = BA_MODELS.slice(0, 7);

/**
 * Before & after on the home page: the heading row with the button to the full gallery, then a row of
 * compare cards (four in view on wide screens) with arrows on both sides.
 */
export function BeforeAfter({ copy = HOME_COPY.results }: { copy?: HomeCopy["results"] }) {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  useReveal(section);
  const [edge, setEdge] = useState<[atStart: boolean, atEnd: boolean]>([true, false]);

  const sync = () => {
    const r = rail.current;
    if (!r) return;
    setEdge([r.scrollLeft < 8, r.scrollLeft > r.scrollWidth - r.clientWidth - 8]);
  };
  useEffect(() => {
    const raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, []);

  const step = (dir: 1 | -1) => {
    const r = rail.current;
    if (!r) return;
    const card = r.querySelector("li");
    r.scrollBy({ left: dir * (card ? card.offsetWidth + 16 : r.clientWidth * 0.8), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <section ref={section} aria-labelledby="results" className="relative z-10 bg-ndm-paper pt-[clamp(80px,9vw,140px)] pb-[clamp(40px,4vw,64px)]">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 px-[var(--gx)]">
        <div>
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="results"
            className="rv mt-4"
            lead={
              <>
                {copy.lead}
                <br />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".05s" }}
          />
          <p className="rv mt-4 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {copy.text}
          </p>
        </div>
        <div className="rv" style={{ transitionDelay: ".12s" }}>
          <Button href={pagePath("beforeAfter")} v="line">
            See all before &amp; after
          </Button>
        </div>
      </div>
      <div className="side-rail relative mt-[clamp(32px,4vw,52px)]">
        <ul ref={rail} onScroll={sync} role="list" className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gx)] pb-2" style={{ scrollPaddingInline: "var(--gx)" }}>
          {CASES.map((c, i) => (
            <li key={c.id} className="ba-slide shrink-0 snap-start">
              <figure className="m-0">
                <BaCompare c={c} i={i} nudge={i < 2} />
                <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="font-aeonik text-[18px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{`Model ${c.id}`}</span>
                  <span className="font-inter text-[13px] text-ndm-muted">{c.treat}</span>
                </figcaption>
              </figure>
            </li>
          ))}
          <li aria-hidden="true" className="w-px shrink-0" />
        </ul>
        <button type="button" onClick={() => step(-1)} disabled={edge[0]} aria-label="Previous cases" className="side-arrow is-l">
          <IconArrow className="rotate-180" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={edge[1]} aria-label="Next cases" className="side-arrow is-r">
          <IconArrow />
        </button>
      </div>
      <p className="mt-6 flex items-start gap-2.5 px-[var(--gx)] font-inter text-[13px] leading-[1.5] text-ndm-muted">
        <IconInfo className="mt-0.5 shrink-0" />
        {BA_DISCLAIMER}
      </p>
    </section>
  );
}
