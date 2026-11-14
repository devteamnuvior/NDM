import { IconTick } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { RevealSection } from "@/components/ui/reveal-section";

/** The concern: what you may notice, and why it happens. */
export function CnUnderstand({ notice, cause, number }: { notice: string[]; cause: string[]; number: string }) {
  return (
    <RevealSection id="understand" aria-labelledby="understand-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(48px,5.5vw,88px)]">
      <TxHead number={number} tag="The concern" headingId="understand-title" lead="What you may notice," strong="and why it happens" />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid gap-4 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-6`}>
        <div className="rv rounded-[24px] bg-[#EEF7FC] p-6 ring-1 ring-ndm-blue/20 md:p-7">
          <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">
            <span aria-hidden="true" className="h-5 w-1 rounded-full bg-ndm-deep" />
            You may notice
          </p>
          <ul className="mt-4 grid gap-3" role="list">
            {notice.map((x) => (
              <li key={x} className="flex items-start gap-3 font-inter text-[15.5px] leading-[1.55] text-ndm-ink">
                <span aria-hidden="true" className="mt-[2px] grid size-6 shrink-0 place-items-center rounded-full bg-ndm-deep text-white">
                  <IconTick size={11} />
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8" style={{ transitionDelay: ".08s" }}>
          <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">
            <span aria-hidden="true" className="h-5 w-1 rounded-full bg-[#FFA617]" />
            Why it happens
          </p>
          {cause.map((x) => (
            <p key={x} className="mt-4 font-inter text-[16px] leading-[1.7] text-ndm-ink/85">
              {x}
            </p>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
