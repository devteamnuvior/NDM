import { FactIcon, type FactIconName } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { RevealSection } from "@/components/ui/reveal-section";
import type { TreatmentPage } from "@/types/treatment";

/** Pre and post care: two cards with a numbered checklist each, read like a plan for the weeks around the visit. */
export function TxCare({ care: c, number }: { care: TreatmentPage["care"]; number: string }) {
  const cards: [title: string, sub: string, items: string[], icon: FactIconName][] = [
    ["Before your visit", "Getting ready", c.before, "cal"],
    ["After your visit", "While the area settles", c.after, "leaf"],
  ];
  return (
    <RevealSection id="care" aria-labelledby="care-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag="Pre & post care" headingId="care-title" lead={c.lead} strong={c.strong} text={c.text} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 md:grid-cols-2 md:gap-4`}>
        {cards.map(([title, sub, items, icon], i) => (
          <div key={title} className="rv rounded-[24px] bg-white p-6 shadow-[0_24px_50px_-42px_rgba(27,36,43,.4)] ring-1 ring-ndm-ink/[.06] md:p-8" style={{ transitionDelay: `${0.06 * i}s` }}>
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-linear-to-br/srgb from-ndm-sky to-ndm-deep text-white shadow-[0_10px_20px_-12px_rgba(15,128,195,.9)]">
                <FactIcon name={icon} size={22} />
              </span>
              <span>
                <span className="block font-aeonik text-[23px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">{title}</span>
                <span className="block font-inter text-[13.5px] text-ndm-muted">{sub}</span>
              </span>
            </div>
            <ol className="mt-5" role="list">
              {items.map((x, k) => (
                <li key={x} className="flex items-start gap-3.5 border-t border-ndm-ink/[.07] py-3.5 font-inter text-[15.5px] leading-[1.55] text-ndm-ink/90 first:border-0 first:pt-1">
                  <span aria-hidden="true" className="mt-[1px] grid size-6 shrink-0 place-items-center rounded-full bg-ndm-blue/10 font-inter text-[12px] font-semibold text-ndm-deep tabular-nums">
                    {k + 1}
                  </span>
                  {x}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
