import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { resolveLabel } from "@/lib/routes";
import type { TreatmentPage } from "@/types/treatment";

/** Elevate your results: what may pair at the same visit beside what is usually planned later, then photo cards of those treatments. */
export function TxPair({ pair: t, number }: { pair: TreatmentPage["pair"]; number: string }) {
  return (
    <RevealSection id="combinations" aria-labelledby="pair-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag={t.tag} headingId="pair-title" lead={t.lead} strong={t.strong} text={t.text} />
      <ol role="list" className={`${TX_WRAP} rv tx-when relative mt-[clamp(28px,3.4vw,44px)] grid gap-3 rounded-[26px] p-3 md:grid-cols-2 md:gap-0 md:p-2`}>
        {t.groups.map(([when, items], i) => (
          <li key={when} className={`relative rounded-[20px] p-5 md:p-7 ${i ? "bg-white/70" : "bg-white shadow-[0_18px_40px_-30px_rgba(15,60,95,.45)]"}`}>
            <p className="flex items-center gap-3 font-aeonik text-[clamp(19px,1.6vw,22px)] leading-[1.2] tracking-[-0.01em] text-ndm-ink">
              <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full font-inter text-[13px] font-semibold ${i ? "bg-ndm-sky/15 text-ndm-deep" : "bg-ndm-deep text-white"}`}>
                {i + 1}
              </span>
              {when}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2" role="list">
              {items.map((x) => (
                <li key={x} className="rounded-full bg-ndm-paper px-3.5 py-1.5 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/[.08]">
                  {x}
                </li>
              ))}
            </ul>
            {i === 0 && (
              <span aria-hidden="true" className="tx-when-arrow absolute top-1/2 -right-5 z-[2] hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-ndm-deep text-white md:grid">
                <IconArrow />
              </span>
            )}
          </li>
        ))}
      </ol>
      <ul role="list" className={`${TX_WRAP} mt-5 grid gap-4 sm:grid-cols-3`}>
        {t.links.map((l, i) => (
          <li key={l.name} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
            <SiteLink to={resolveLabel(l.menu)} className="tx-pair-card group flex h-full flex-col rounded-[22px] bg-white p-2.5 ring-1 ring-ndm-ink/[.06]">
              <span className="peach relative block aspect-[16/11] overflow-hidden rounded-[16px] bg-ndm-mist">
                {/* eslint-disable-next-line @next/next/no-img-element -- the home menu's own photo file */}
                <img src={l.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" style={{ transitionTimingFunction: "var(--e-out)" }} />
                <span className="absolute top-3 left-3 z-[1] rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[8px]">{l.tag}</span>
              </span>
              <span className="flex flex-1 items-start justify-between gap-3 px-2 pt-4 pb-2">
                <span className="min-w-0">
                  <span className="block font-aeonik text-[clamp(20px,1.7vw,23px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{l.name}</span>
                  <span className="mt-1 block font-inter text-[13.5px] leading-[1.45] text-ndm-muted">{l.line}</span>
                </span>
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center self-end rounded-full bg-ndm-blue/10 text-ndm-deep transition-colors group-hover:bg-ndm-deep group-hover:text-white">
                  <IconArrow />
                </span>
              </span>
              <span className="sr-only">Explore {l.name}</span>
            </SiteLink>
          </li>
        ))}
      </ul>
    </RevealSection>
  );
}
