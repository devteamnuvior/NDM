"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import careTeam from "@/assets/images/faq/care-team.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { CLINICS } from "@/config/site";
import { useReveal } from "@/hooks/use-reveal";
import { tel } from "@/lib/routes";

interface FaqProps {
  items: [question: string, answer: string][];
  lead?: ReactNode;
  strong?: string;
  intro?: string;
  /** The tag above the heading. */
  eyebrow?: string;
}

/**
 * Questions and answers: the heading and a "talk to our care team" card on the left (sticky on wide
 * screens), the questions on the right. One answer is open at a time; the first one starts open.
 */
export function Faq({ items, lead = "Questions,", strong = "answered honestly", intro = "The things people ask us most before their first visit.", eyebrow = "Questions & answers" }: FaqProps) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const [open, setOpen] = useState(0);
  const [uptown, downtown] = CLINICS;

  return (
    <section ref={section} aria-labelledby="faq" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,516px)_1fr] lg:gap-[clamp(48px,6vw,110px)]">
        <div className="lg:sticky lg:top-36 lg:self-start">
          <Eyebrow className="rv">{eyebrow}</Eyebrow>
          <TwoTone id="faq" className="rv mt-5" lead={lead} strong={strong} style={{ transitionDelay: ".06s" }} />
          <p className="rv mt-4 font-inter text-[15px] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {intro}
          </p>
          <div className="rv mt-8 rounded-[20px] border border-ndm-ink/[.08] bg-white p-6 shadow-[0_24px_50px_-38px_rgba(27,36,43,.35)]" style={{ transitionDelay: ".14s" }}>
            <div className="flex items-center gap-3">
              <Image src={careTeam} alt="" sizes="44px" className="size-11 shrink-0 rounded-full object-cover object-top" />
              <span>
                <span className="block font-inter text-[19px] font-medium tracking-[-0.02em] text-ndm-ink">Still unsure?</span>
                <span className="block font-inter text-[13px] text-ndm-muted">Talk to our care team</span>
              </span>
            </div>
            <p className="mt-4 font-inter text-[14px] text-ndm-muted">A free consultation, no pressure, no obligation.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={tel(uptown.phone)} v="ink" sm>
                Call Uptown
              </Button>
              <Button href={tel(downtown.phone)} v="line" sm>
                Call Downtown
              </Button>
            </div>
          </div>
        </div>
        <ul className="rv border-t border-ndm-ink/10" role="list" style={{ transitionDelay: ".1s" }}>
          {items.map(([q, a], i) => {
            const on = open === i;
            return (
              <li key={q} onClick={() => setOpen(on ? -1 : i)} className="group cursor-pointer border-b border-ndm-ink/10">
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`faq-${i}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-inter text-[18px] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep md:text-[21px]"
                  >
                    {q}
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${on ? "rotate-45 border-ndm-ink bg-ndm-ink text-white" : "border-ndm-ink/20"}`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: on ? "1fr" : "0fr", transitionTimingFunction: "var(--e-out)" }}>
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pr-12 pb-6 font-inter text-[15px] leading-[1.6] text-ndm-muted">{a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
