"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import type { TreatmentTab } from "@/config/home-treatments";
import { useReveal } from "@/hooks/use-reveal";
import type { HomeCopy } from "@/types/home";

/**
 * The treatments carousel: category tabs on the right of the heading, a rail of cards that scrolls
 * sideways (swipe, trackpad, or the arrows on both sides), and a link to the whole category.
 */
export function TreatMenuView({ tabs, copy }: { tabs: TreatmentTab[]; copy: HomeCopy["treatments"] }) {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  useReveal(section);
  const [active, setActive] = useState(0);
  /* whether the rail is at its start / end: the matching arrow hides */
  const [edge, setEdge] = useState<[atStart: boolean, atEnd: boolean]>([true, false]);
  const tab = tabs[active];

  const sync = () => {
    const r = rail.current;
    if (!r) return;
    setEdge([r.scrollLeft < 8, r.scrollLeft > r.scrollWidth - r.clientWidth - 8]);
  };

  /* a new category starts from its first card */
  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    r.scrollLeft = 0;
    setEdge([r.scrollLeft < 8, r.scrollLeft > r.scrollWidth - r.clientWidth - 8]);
  }, [active]);

  const step = (dir: 1 | -1) => {
    const r = rail.current;
    if (!r) return;
    const card = r.querySelector("article");
    r.scrollBy({ left: dir * (card ? card.offsetWidth + 16 : r.clientWidth * 0.8), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + tabs.length) % tabs.length;
    setActive(n);
    tabButtons.current[n]?.focus();
  };

  return (
    <section ref={section} id="treatments" aria-labelledby="menu-title" className="relative z-10 bg-ndm-paper pt-[clamp(32px,3.5vw,56px)] pb-[clamp(64px,7vw,110px)]">
      <div className="grid gap-5 px-[var(--gx)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="menu-title"
            className="rv mt-4"
            lead={
              <>
                {copy.lead}
                <br />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mt-4 font-inter text-[15.5px] leading-[1.6] text-ndm-muted lg:whitespace-nowrap" style={{ transitionDelay: ".1s" }}>
            {copy.text}
          </p>
        </div>
        <div className="rv min-w-0 lg:justify-self-end" style={{ transitionDelay: ".14s" }}>
          <div className="tm-tabs no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-ndm-mist p-1" role="tablist" aria-label="Treatment categories">
            {tabs.map((m, i) => (
              <button
                key={m.id}
                ref={(el) => {
                  tabButtons.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tm-t-${m.id}`}
                aria-controls="tm-panel"
                aria-selected={i === active}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`shrink-0 rounded-full px-4 py-2.5 font-inter text-[14px] transition-colors ${i === active ? "bg-white font-medium text-ndm-deep shadow-[0_6px_16px_-10px_rgba(27,36,43,.45)]" : "text-ndm-muted hover:text-ndm-ink"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="side-rail relative mt-8">
        <div
          ref={rail}
          onScroll={sync}
          id="tm-panel"
          role="tabpanel"
          aria-labelledby={`tm-t-${tab.id}`}
          className="no-scrollbar -mb-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gx)] pt-2 pb-14"
          style={{ scrollPaddingInline: "var(--gx)" }}
        >
          {tab.cards.map((c, i) => (
            <article key={`${tab.id}-${c.name}`} className="tm-card2 tm-in group flex shrink-0 snap-start flex-col rounded-[22px] bg-white p-3 ring-1 ring-ndm-ink/[.06]" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}>
              <a href={c.href} className="peach relative block aspect-[4/3.2] overflow-hidden rounded-[16px] bg-ndm-mist">
                {/* eslint-disable-next-line @next/next/no-img-element -- hand-made WebP sizes, used as they are */}
                <img
                  src={c.image.src}
                  srcSet={c.image.srcSet}
                  sizes="(max-width: 640px) 78vw, 320px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                  style={{ transitionTimingFunction: "var(--e-out)" }}
                />
                <span className="absolute top-3 left-3 z-[1] rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[8px]">{c.tag}</span>
              </a>
              <div className="flex flex-1 flex-col px-2 pt-4 pb-1.5">
                <h3 className="font-aeonik text-[clamp(21px,1.6vw,25px)] leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink">
                  <a href={c.href} className="hover:text-ndm-deep">
                    {c.name}
                  </a>
                </h3>
                <p className="mt-2 line-clamp-3 font-inter text-[14px] leading-[1.55] text-ndm-muted">{c.text}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="font-inter text-[14px] font-medium text-ndm-ink">{c.price}</span>
                  <Button href={ACTIONS.book} v="ink" sm>
                    Book
                  </Button>
                </div>
              </div>
            </article>
          ))}
          <span aria-hidden="true" className="w-px shrink-0" />
        </div>
        <button type="button" onClick={() => step(-1)} disabled={edge[0]} aria-label="Previous treatments" className="side-arrow is-l">
          <IconArrow className="rotate-180" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={edge[1]} aria-label="Next treatments" className="side-arrow is-r">
          <IconArrow />
        </button>
      </div>
      <div className="px-[var(--gx)]">
        <Button href={tab.all.href} v="line" sm>
          {tab.all.label}
        </Button>
      </div>
    </section>
  );
}
