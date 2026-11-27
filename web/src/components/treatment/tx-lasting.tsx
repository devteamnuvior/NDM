"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { TX_WRAP } from "@/components/treatment/tx-head";
import { useInView } from "@/hooks/use-in-view";
import { useReveal } from "@/hooks/use-reveal";
import type { TreatmentPage } from "@/types/treatment";
import { withBase } from "@/lib/base-path";

/* the capsules of the first six months: where each one sits and how large it is */
const TOPS = [28, 62, 40, 70, 22, 55, 35, 66, 30, 48, 72, 26];
const SIZES = [10, 6, 12, 8, 11, 5, 9, 12, 6, 10, 7, 9];

/**
 * The lifeline of the card (user, 2026-11-17): a counter climbs to the card's own number of months, the lift line
 * runs from day 0 to that month with a mark at every quarter, and the HA capsules drift only over the first six
 * months, where the hyaluronic acid is released. Decorative: the card's words say the same.
 */
function TxLifeline({ months, run }: { months: number; run: boolean }) {
  /* the server and the first paint show the full number; the count starts once the card is in view */
  const [n, setN] = useState(months);
  useEffect(() => {
    if (!run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / 2600);
      setN(Math.round(months * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, months]);
  const marks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(months * f));
  const ha = Math.min(1, 6 / months);
  return (
    <div aria-hidden="true" className={`tx-life ${run ? "in" : ""}`}>
      <p className="flex items-end gap-3">
        <span className="tx-life-num font-aeonik leading-[.8] tracking-[-0.04em] tabular-nums">{n}</span>
        <span className="pb-1 font-inter text-[14px] leading-[1.35] text-white/75">
          months a lift
          <br />
          may last
        </span>
      </p>
      <div className="tx-thread relative mt-7 h-[96px]">
        <span className="tx-life-ha absolute top-[10%] bottom-[10%] left-0 rounded-[14px]" style={{ width: `${ha * 100}%` }} />
        <span className="tx-life-base absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" />
        <span className="tx-thread-line tx-life-fill absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full" />
        {TOPS.map((top, i) => (
          <i key={i} className="tx-bub absolute rounded-full" style={{ left: `${((i * 0.08 + 0.02) * ha * 100).toFixed(1)}%`, top: `${top}%`, width: `${SIZES[i]}px`, "--d": `${(i * 0.18).toFixed(2)}s` } as CSSProperties} />
        ))}
        {marks.map((m, i) => (
          <span key={i} className={`tx-life-mark absolute top-1/2 ${i === 4 ? "is-end" : ""}`} style={{ left: `${i * 25}%`, "--d": `${(i * 0.62).toFixed(2)}s` } as CSSProperties} />
        ))}
      </div>
      <div className="relative mt-2 h-4 font-inter text-[11.5px] tracking-[.12em] text-white/60 uppercase">
        {marks.map((m, i) => (
          <span key={i} className={`absolute top-0 whitespace-nowrap ${i === 0 ? "" : i === 4 ? "-translate-x-full text-white" : "-translate-x-1/2"}`} style={{ left: `${i * 25}%` }}>
            {i === 0 ? "Day 0" : i === 4 ? `${m} months` : m}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-inter text-[13px] text-white/75">
        <span className="inline-flex items-center gap-2">
          <i className="tx-life-key is-ha" />
          HA released, first 6 months
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="tx-life-key" />
          Lift held by your own collagen
        </span>
      </div>
    </div>
  );
}

/** How long it lasts: one wide purple card with the lifeline of the months beside its words. */
export function TxLasting({ duration: d, number }: { duration: TreatmentPage["duration"]; number: string }) {
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useReveal(section);
  const run = useInView(box);
  /* the card's own number ("24", "Up to 24"): the line runs to it */
  const lifeMonths = parseInt(String(d.stat).replace(/[^0-9]/g, ""), 10) || 24;
  return (
    <section ref={section} aria-labelledby="duration-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div ref={box} className={TX_WRAP}>
        <article id="duration" className="rv tx-lasts relative grid scroll-mt-[170px] gap-8 overflow-hidden rounded-[26px] p-6 text-white md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          {/* eslint-disable-next-line @next/next/no-img-element -- small SVG logo */}
          <img src={withBase(d.logo)} alt={d.logoAlt} width="106" height="23" className="absolute top-7 right-6 h-[18px] w-auto opacity-95 md:top-11 md:right-10 md:h-[24px]" />
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-inter text-[13px] font-medium">
              <span className="text-[#C9C2F4] tabular-nums">{number}</span>How long it lasts
            </p>
            <h2 id="duration-title" className="mt-5 font-aeonik text-[clamp(30px,3vw,44px)] leading-[1.08] font-normal tracking-[-0.03em]">
              {d.lead}
              <br />
              <span className="tt-strong text-[#C9C2F4]">{d.strong}</span>
            </h2>
            <p className="mt-4 max-w-[52ch] font-inter text-[16px] leading-[1.65] text-white/85">{d.text}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6">
              <p className="flex items-baseline gap-2">
                <span className="font-aeonik text-[clamp(28px,2.4vw,36px)] leading-none tracking-[-0.03em]">{d.stat}</span>
                <span className="font-inter text-[15px] text-white/75">{d.unit}</span>
              </p>
              <p className="max-w-[40ch] font-inter text-[13.5px] leading-[1.5] text-white/70">
                <span className="block text-white/90">{d.label}</span>
                {d.note}
              </p>
            </div>
          </div>
          <TxLifeline months={lifeMonths} run={run} />
        </article>
      </div>
    </section>
  );
}
