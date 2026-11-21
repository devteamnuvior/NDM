import { IconTick } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { RevealSection } from "@/components/ui/reveal-section";
import { NAMICA_SPHERE_SRC } from "@/config/site";
import type { TreatmentPage } from "@/types/treatment";
import { withBase } from "@/lib/base-path";

/** Is it safe: the honest answer and the safeguards, beside the licensed product on its purple card. */
export function TxSafety({ safety: t, number }: { safety: TreatmentPage["safety"]; number: string }) {
  return (
    <RevealSection id="safety" aria-labelledby="safety-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag={t.tag} headingId="safety-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]`}>
        <div className="rv rounded-[24px] bg-white p-6 ring-1 ring-ndm-ink/[.06] md:p-8">
          {t.text.map((x) => (
            <p key={x} className="font-inter text-[16px] leading-[1.7] text-ndm-ink/85 [&+p]:mt-4">
              {x}
            </p>
          ))}
          <p className="mt-6 font-inter text-[12.5px] font-semibold tracking-[.14em] text-ndm-deep uppercase">Our safeguards</p>
          <ul className="mt-3 grid gap-2.5" role="list">
            {t.safeguards.map((x) => (
              <li key={x} className="flex items-start gap-2.5 font-inter text-[15px] leading-[1.55] text-ndm-ink/85">
                <span aria-hidden="true" className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
                  <IconTick size={10} />
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <figure className="rv tx-product relative m-0 flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[24px] p-6 text-white md:p-8" style={{ transitionDelay: ".08s" }}>
          {/* centred with a transform, not the translate utility: the float animation on this image moves `translate` */}
          {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by nuvior.com, as in the prototype */}
          <img src={withBase(t.product.img)} alt={t.product.alt} loading="lazy" className="tx-product-img absolute top-[12%] left-1/2 w-[82%] max-w-[420px] [transform:translateX(-50%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- the NAMICA badge, served by nuvior.com */}
          <img src={withBase(NAMICA_SPHERE_SRC)} alt="" aria-hidden="true" className="namica-sphere pointer-events-none absolute -right-8 -bottom-8 w-[150px] opacity-90" />
          <figcaption className="relative">
            <span className="block font-inter text-[12px] tracking-[.14em] text-[#C9C2F4] uppercase">{t.product.tag}</span>
            <span className="mt-1.5 block font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.15]">{t.product.name}</span>
            <span className="mt-1 block max-w-[36ch] font-inter text-[14px] leading-[1.5] text-white/80">{t.product.note}</span>
          </figcaption>
        </figure>
      </div>
    </RevealSection>
  );
}
