import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { TxPhoto } from "@/components/treatment/tx-photo";
import { Button } from "@/components/ui/button";
import { IconArrow, IconCheckBadge } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { CLINICS } from "@/config/site";
import { resolveLabel, tel } from "@/lib/routes";
import type { ProcedurePage } from "@/types/treatment";
import { withBase } from "@/lib/base-path";

const BOOK_POINTS = ["Free consultation and VISIA® skin analysis", "Uptown or Downtown Toronto", "No pressure, just a clear plan"];

/**
 * Good to know: a sticky column with the heading, a short intro and a Book card; beside it the questions
 * people search for as numbered cards; then the related treatments as photo cards.
 */
export function ProcGuide({ guide: g, number }: { guide: ProcedurePage["guide"]; number: string }) {
  const uptown = CLINICS[0].phone;
  return (
    <RevealSection id="guide" aria-labelledby="guide-title" className="relative z-10 scroll-mt-[150px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid gap-8 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="lg:sticky lg:top-[200px] lg:self-start">
          <TxTag number={number}>{g.tag}</TxTag>
          <TwoTone
            id="guide-title"
            className="rv mt-5"
            size="text-[clamp(32px,3.4vw,50px)]"
            lead={
              <>
                {g.lead}
                <br />
              </>
            }
            strong={g.strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mt-4 max-w-[44ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {g.intro}
          </p>
          <div className="rv guide-book relative mt-7 overflow-hidden rounded-[26px] p-6 text-white" style={{ transitionDelay: ".14s" }}>
            <span aria-hidden="true" className="guide-book-glow" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-inter text-[12px] font-medium text-white/90 ring-1 ring-white/20">
              <i aria-hidden="true" className="size-1.5 rounded-full bg-ndm-amber" />
              Free consultation
            </span>
            <p className="relative mt-4 font-aeonik text-[clamp(26px,2.2vw,32px)] leading-[1.08] font-normal tracking-[-0.02em]">
              Talk it through
              <br />
              <span className="tt-strong text-ndm-sky">with our team</span>
            </p>
            <ul className="relative mt-4 grid gap-2" role="list">
              {BOOK_POINTS.map((x) => (
                <li key={x} className="flex items-start gap-2.5 font-inter text-[14.5px] leading-[1.45] text-white/85">
                  <IconCheckBadge className="mt-[2px] shrink-0 text-ndm-sky" />
                  {x}
                </li>
              ))}
            </ul>
            <div className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button href={ACTIONS.book} v="book" hot>
                Book Free Consultation
              </Button>
              <a href={withBase(tel(uptown))} className="font-inter text-[14px] text-white/80 underline-offset-4 hover:text-white hover:underline">
                or call {uptown}
              </a>
            </div>
          </div>
          <p className="rv mt-4 flex items-center gap-2 font-inter text-[12.5px] text-ndm-muted" style={{ transitionDelay: ".16s" }}>
            <IconCheckBadge size={14} className="shrink-0 text-ndm-deep" />
            Page updated <time dateTime={g.updated[0]}>{g.updated[1]}</time>
          </p>
        </div>
        <ol className="grid gap-3" role="list">
          {g.items.map((it, i) => (
            <li key={it.q} className="rv guide-q relative overflow-hidden rounded-[22px] bg-white p-[clamp(20px,2.2vw,28px)] pl-[clamp(64px,5.2vw,80px)] ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.04 * i}s` }}>
              <span aria-hidden="true" className="guide-num absolute top-[clamp(20px,2.2vw,28px)] left-[clamp(18px,1.8vw,26px)] grid size-9 place-items-center rounded-full font-inter text-[13px] font-semibold text-white tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-aeonik text-[clamp(20px,1.6vw,24px)] leading-[1.2] font-normal tracking-[-0.015em] text-ndm-ink">{it.q}</h3>
              {it.a.map((x) => (
                <p key={x} className="mt-2.5 font-inter text-[15px] leading-[1.7] text-ndm-ink/80">
                  {x}
                </p>
              ))}
              {it.list && (
                <ul className="mt-3 grid gap-2 rounded-[16px] bg-ndm-mist/70 p-4 sm:grid-cols-2" role="list">
                  {it.list.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 font-inter text-[14px] leading-[1.55] text-ndm-ink/85">
                      <IconCheckBadge className="mt-[2px] shrink-0 text-ndm-deep" />
                      {x}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
      <nav aria-labelledby="related-title" className={`${TX_WRAP} mt-[clamp(48px,5vw,72px)]`}>
        <div className="flex items-end justify-between gap-4">
          <h3 id="related-title" className="rv font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink">
            Related <span className="tt-strong text-ndm-deep">treatments</span>
          </h3>
        </div>
        <ul className="no-scrollbar -mx-[var(--gx)] mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gx)] pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-6" role="list" style={{ scrollPaddingInline: "var(--gx)" }}>
          {g.related.map((r, i) => (
            <li key={r.name} className="rv w-[62%] shrink-0 snap-start sm:w-auto" style={{ transitionDelay: `${0.04 * i}s` }}>
              <SiteLink to={resolveLabel(r.name)} className="guide-rel group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-ndm-mist text-white">
                <TxPhoto src={r.img} alt="" sizes="(min-width: 1280px) 190px, (min-width: 640px) 33vw, 62vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]" />
                <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t/srgb from-[#0B0F13]/85 via-[#0B0F13]/20 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-white/85 px-2.5 py-1 font-inter text-[11.5px] font-medium text-ndm-ink backdrop-blur-[6px]">{r.kind}</span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                  <span className="font-aeonik text-[18px] leading-[1.15]">{r.name}</span>
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ndm-deep transition-transform duration-500 group-hover:-rotate-45">
                    <IconArrow size={12} />
                  </span>
                </span>
              </SiteLink>
            </li>
          ))}
        </ul>
      </nav>
    </RevealSection>
  );
}
