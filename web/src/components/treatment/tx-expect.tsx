"use client";

import { useRef, useState } from "react";
import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import type { TreatmentPage } from "@/types/treatment";

/** What to expect: a sticky heading on the left; on the right the line fills and each step lights up as it passes. */
export function TxExpect({ expect: t, number }: { expect: TreatmentPage["expect"]; number: string }) {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLElement>(null);
  useReveal(section);
  const [act, setAct] = useState(0);
  useOnScroll(() => {
    const el = list.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const progress = clamp01((mid - r.top) / Math.max(1, r.height));
    if (fill.current) fill.current.style.transform = `scaleY(${window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : progress.toFixed(3)})`;
    let k = 0;
    el.querySelectorAll("[data-step]").forEach((li, i) => {
      if (li.getBoundingClientRect().top < mid) k = i;
    });
    setAct(k);
  });
  return (
    <section ref={section} id="expect" aria-labelledby="expect-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(48px,6vw,96px)]`}>
        <div className="lg:sticky lg:top-[200px] lg:self-start">
          <TxTag number={number}>{t.tag ?? "What to expect"}</TxTag>
          <TwoTone
            id="expect-title"
            className="rv mt-5"
            size="text-[clamp(32px,3.4vw,50px)]"
            lead={
              <>
                {t.lead}
                <br />
              </>
            }
            strong={t.strong}
            style={{ transitionDelay: ".06s" }}
          />
          {t.text && <p className="rv mt-4 max-w-[44ch] font-inter text-[16px] leading-[1.65] text-ndm-muted">{t.text}</p>}
          <div className="rv mt-8 hidden items-center gap-4 lg:flex" aria-hidden="true">
            <span className="font-aeonik text-[44px] leading-none tracking-[-0.04em] text-ndm-deep tabular-nums">0{act + 1}</span>
            <span className="font-inter text-[14px] leading-[1.4] text-ndm-muted">
              of 0{t.items.length}
              <br />
              <span className="text-ndm-ink">{t.items[act][0]}</span>
            </span>
          </div>
          <div className="rv mt-8">
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
          </div>
        </div>
        <ol ref={list} className="relative grid gap-4" role="list">
          <span aria-hidden="true" className="absolute top-6 bottom-6 left-[19px] w-[2px] rounded-full bg-ndm-ink/[.08]">
            <i ref={fill} className="block h-full w-full origin-top rounded-full bg-linear-to-b/srgb from-ndm-sky to-ndm-deep" style={{ transform: "scaleY(0)" }} />
          </span>
          {t.items.map(([when, title, text], i) => (
            <li key={when} data-step="" className="rv relative pl-14" style={{ transitionDelay: `${0.06 * i}s` }}>
              <span
                aria-hidden="true"
                className={`absolute top-5 left-0 grid size-10 place-items-center rounded-full font-inter text-[13px] font-semibold tabular-nums transition-colors duration-500 ${i <= act ? "bg-ndm-deep text-white shadow-[0_10px_22px_-10px_rgba(15,128,195,.9)]" : "bg-white text-ndm-muted ring-1 ring-ndm-ink/10"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`rounded-[22px] bg-white p-5 transition-[box-shadow,transform] duration-500 md:p-6 ${i === act ? "shadow-[0_24px_50px_-30px_rgba(15,128,195,.45)] ring-1 ring-ndm-blue/25" : "ring-1 ring-ndm-ink/[.06]"}`}>
                <span className="inline-flex rounded-full bg-ndm-blue/10 px-3 py-1 font-inter text-[12.5px] font-semibold text-ndm-deep">{when}</span>
                <h3 className="mt-3 font-aeonik text-[clamp(21px,1.8vw,25px)] leading-[1.2] font-normal tracking-[-0.01em] text-ndm-ink">{title}</h3>
                <p className="mt-2 font-inter text-[15.5px] leading-[1.6] text-ndm-ink/75">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
