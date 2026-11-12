"use client";

import { useRef, type CSSProperties } from "react";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { useInView } from "@/hooks/use-in-view";
import { useReveal } from "@/hooks/use-reveal";
import type { TreatmentPage } from "@/types/treatment";

/** How it works: four steps joined by a line that draws itself as the row scrolls into view. */
export function TxSteps({ steps: t, number }: { steps: TreatmentPage["steps"]; number: string }) {
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useReveal(section);
  const on = useInView(list, 0.3);
  return (
    <section ref={section} id="how" aria-labelledby="steps-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag={t.tag} headingId="steps-title" lead={t.lead} strong={t.strong} text={t.text} />
      <ol ref={list} className={`tx-steps ${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${on ? "in" : ""}`} role="list">
        {t.items.map(([h, d], i) => (
          <li key={h} className="tx-step relative rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] md:p-6" style={{ "--d": `${(i * 0.12).toFixed(2)}s` } as CSSProperties}>
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-ndm-deep font-inter text-[13px] font-semibold text-white">
                {i + 1}
              </span>
              <span aria-hidden="true" className="tx-line h-px flex-1 bg-ndm-ink/10">
                <i className="block h-px origin-left bg-ndm-deep" />
              </span>
            </span>
            <h3 className="mt-5 font-aeonik text-[21px] leading-[1.2] font-normal tracking-[-0.01em] text-ndm-ink">{h}</h3>
            <p className="mt-2 font-inter text-[15px] leading-[1.6] text-ndm-ink/75">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
