"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { useReveal } from "@/hooks/use-reveal";
import type { ProcedurePage } from "@/types/treatment";
import { withBase } from "@/lib/base-path";

interface ProcOverviewProps {
  overview: ProcedurePage["overview"];
  facts: ProcedurePage["facts"];
  number: string;
}

/**
 * About the treatment: five tabs on a dark glass panel, one panel shown at a time with its key number beside it.
 * Every panel stays in the page (the hidden ones `hidden`), so all the text is there for search engines.
 */
export function ProcOverview({ overview: o, facts, number }: ProcOverviewProps) {
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useReveal(section);
  const [act, setAct] = useState(0);
  const key = (e: KeyboardEvent, i: number) => {
    const k = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const m = (i + k + o.tabs.length) % o.tabs.length;
    setAct(m);
    tabs.current[m]?.focus();
  };
  return (
    <section ref={section} id="overview" aria-labelledby="overview-title" data-nav="dark" className="ov2 relative z-10 overflow-hidden px-[var(--gx)] py-[clamp(44px,5vw,68px)] text-white">
      <span aria-hidden="true" className="ov2-orb ov2-orb-a" />
      <span aria-hidden="true" className="ov2-orb ov2-orb-b" />
      <span aria-hidden="true" className="ov2-orb ov2-orb-c" />
      <svg aria-hidden="true" viewBox="0 0 400 400" className="ov2-ring">
        <circle cx="200" cy="200" r="190" />
        <circle cx="200" cy="200" r="150" />
      </svg>
      <div className={`${TX_WRAP} relative`}>
        <div className="text-center">
          <TxTag number={number} dark>
            {o.tag}
          </TxTag>
          <TwoTone
            id="overview-title"
            dark
            className="rv mx-auto mt-3"
            size="text-[clamp(26px,min(2.8vw,4.6vh),40px)]"
            lead={
              <>
                {o.lead}
                <br />
              </>
            }
            strong={o.strong}
            style={{ transitionDelay: ".06s" }}
          />
        </div>
        <div className="rv ov2-panel relative mt-[clamp(16px,2.6vh,28px)] overflow-hidden rounded-[26px]" style={{ transitionDelay: ".1s" }}>
          <div role="tablist" aria-label="About the treatment" className="ov2-tabs no-scrollbar flex gap-1 overflow-x-auto p-2">
            {o.tabs.map((x, i) => (
              <button
                key={x.label}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`ov-t-${i}`}
                aria-controls={`ov-panel-${i}`}
                aria-selected={i === act}
                tabIndex={i === act ? 0 : -1}
                onClick={() => setAct(i)}
                onKeyDown={(e) => key(e, i)}
                className={`ov2-tab shrink-0 sm:flex-1 ${i === act ? "is-on" : ""}`}
              >
                <span className="ov2-num font-aeonik tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {x.label}
              </button>
            ))}
          </div>
          {o.tabs.map((t, i) => (
            <div
              key={t.label}
              id={`ov-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`ov-t-${i}`}
              hidden={i !== act}
              className={`${i === act ? "ov-in grid" : "hidden"} gap-6 px-[clamp(20px,2.8vw,40px)] pt-[clamp(14px,2.4vh,24px)] pb-[clamp(18px,2.8vh,30px)] md:grid-cols-[minmax(0,1fr)_230px] md:items-center md:gap-[clamp(28px,4vw,56px)]`}
            >
              <div>
                <h3 className="font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.1] font-normal tracking-[-0.025em] text-white">{t.label}</h3>
                {t.text.map((x) => (
                  <p key={x} className="mt-2.5 max-w-[72ch] font-inter text-[14.5px] leading-[1.6] text-white/80">
                    {x}
                  </p>
                ))}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Button href={ACTIONS.book} v="book" hot>
                    Book Free Consultation
                  </Button>
                  {t.link && (
                    <a href={withBase(t.link[0])} className="group inline-flex items-center gap-2 font-inter text-[15px] font-semibold text-ndm-sky">
                      {t.link[1]}
                      <IconArrow className="transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              </div>
              <aside className="hidden md:block">
                <div className="ov2-stat relative mx-auto grid aspect-square w-[128px] place-items-center">
                  <svg aria-hidden="true" viewBox="0 0 100 100" className="ov2-stat-ring absolute inset-0">
                    <circle cx="50" cy="50" r="46" />
                  </svg>
                  <span className="relative px-4 text-center">
                    <span className="block font-aeonik text-[32px] leading-none tracking-[-0.03em] text-white tabular-nums">{t.stat[0]}</span>
                    <span className="mt-1 block font-inter text-[11px] leading-[1.3] text-white/70">{t.stat[1]}</span>
                  </span>
                </div>
                <dl className="mt-3 grid gap-1 border-t border-white/10 pt-2.5">
                  {facts.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-3 font-inter text-[12.5px]">
                      <dt className="text-white/55">{k}</dt>
                      <dd className="text-right font-medium text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
