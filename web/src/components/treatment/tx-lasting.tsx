"use client";

import { useRef, type CSSProperties } from "react";
import { TX_WRAP } from "@/components/treatment/tx-head";
import { useInView } from "@/hooks/use-in-view";
import { useReveal } from "@/hooks/use-reveal";
import type { TreatmentPage } from "@/types/treatment";

/* the capsules along the thread: where each one sits and how large it is */
const TOPS = [28, 62, 40, 70, 22, 55, 35, 66, 30, 48, 72, 26, 58, 38, 64, 44, 30, 56];
const SIZES = [10, 6, 14, 8, 12, 5, 9, 13, 6, 11, 7, 10, 5, 12, 8, 6, 9, 7];

/** How long it lasts: one wide purple card; capsules drift along the thread and open over the months. */
export function TxLasting({ duration: d, number }: { duration: TreatmentPage["duration"]; number: string }) {
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useReveal(section);
  const run = useInView(box);
  return (
    <section ref={section} aria-labelledby="duration-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div ref={box} className={TX_WRAP}>
        <article id="duration" className="rv tx-lasts relative grid scroll-mt-[170px] gap-8 overflow-hidden rounded-[26px] p-6 text-white md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          {/* eslint-disable-next-line @next/next/no-img-element -- small SVG logo */}
          <img src={d.logo} alt={d.logoAlt} width="106" height="23" className="absolute top-7 right-6 h-[18px] w-auto opacity-95 md:top-11 md:right-10 md:h-[24px]" />
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
          <div>
            <div aria-hidden="true" className={`tx-thread relative h-[150px] ${run ? "in" : ""}`}>
              <span className="tx-thread-line absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full" />
              {TOPS.map((top, i) => (
                <i key={i} className="tx-bub absolute rounded-full" style={{ left: `${(i * 5.6 + 2).toFixed(1)}%`, top: `${top}%`, width: `${SIZES[i]}px`, "--d": `${(i * 0.14).toFixed(2)}s` } as CSSProperties} />
              ))}
            </div>
            <div aria-hidden="true" className="mt-2 flex justify-between font-inter text-[12px] tracking-[.12em] text-white/65 uppercase">
              <span>Day 0</span>
              <span>Months 1 to 3</span>
              <span>Up to 6 months</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
