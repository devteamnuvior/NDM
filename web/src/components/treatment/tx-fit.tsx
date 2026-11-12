import { IconInfoSmall, IconTick } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { RevealSection } from "@/components/ui/reveal-section";
import type { TreatmentPage } from "@/types/treatment";

function Row({ text, good }: { text: string; good: boolean }) {
  return (
    <li className="flex items-start gap-3 font-inter text-[15.5px] leading-[1.55] text-ndm-ink">
      <span aria-hidden="true" className={`mt-[2px] grid size-6 shrink-0 place-items-center rounded-full ${good ? "bg-ndm-deep text-white" : "bg-[#FFE7C2] text-[#8A5A12]"}`}>
        {good ? <IconTick size={11} /> : <IconInfoSmall size={13} />}
      </span>
      {text}
    </li>
  );
}

/** Good candidates: who it often suits and when we may advise waiting, beside a photo. */
export function TxFit({ fit: t, number }: { fit: TreatmentPage["fit"]; number: string }) {
  return (
    <RevealSection id="candidate" aria-labelledby="fit-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag={t.tag} headingId="fit-title" lead={t.lead} strong={t.strong} text={t.text} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-6`}>
        <div className="grid gap-3">
          <div className="rv rounded-[24px] bg-[#EEF7FC] p-6 ring-1 ring-ndm-blue/20 md:p-7">
            <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">
              <span aria-hidden="true" className="h-5 w-1 rounded-full bg-ndm-deep" />
              Often a good fit
            </p>
            <ul className="mt-4 grid gap-3" role="list">
              {t.yes.map((x) => (
                <Row key={x} text={x} good />
              ))}
            </ul>
          </div>
          <div className="rv rounded-[24px] bg-[#FFF6EA] p-6 ring-1 ring-[#FFA617]/25 md:p-7" style={{ transitionDelay: ".08s" }}>
            <p className="flex items-center gap-2.5 font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">
              <span aria-hidden="true" className="h-5 w-1 rounded-full bg-[#FFA617]" />
              We may advise waiting or another option
            </p>
            <ul className="mt-4 grid gap-3" role="list">
              {t.no.map((x) => (
                <Row key={x} text={x} good={false} />
              ))}
            </ul>
          </div>
        </div>
        <div className="rv peach relative min-h-[320px] overflow-hidden rounded-[24px] bg-ndm-mist" style={{ transitionDelay: ".12s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- photo served by nuvior.com, as in the prototype */}
          <img src={t.img} alt={t.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.position }} />
        </div>
      </div>
    </RevealSection>
  );
}
