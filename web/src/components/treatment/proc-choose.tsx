import { TxTag } from "@/components/treatment/tx-head";
import { TxPhoto } from "@/components/treatment/tx-photo";
import { IconCheckBadge } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import type { ProcedurePage } from "@/types/treatment";

/** Why choose this treatment: the heading and the numbered benefits on the left, a tall photo that stays in view on the right. */
export function ProcChoose({ choose: c, number }: { choose: ProcedurePage["choose"]; number: string }) {
  return (
    <RevealSection id="why-choose" aria-labelledby="choose-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(72px,8vw,120px)]">
      <div className="mx-auto grid max-w-[1180px] items-start gap-[clamp(36px,4vw,56px)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,.88fr)] lg:gap-[clamp(48px,5vw,80px)]">
        {/* words: left */}
        <div className="min-w-0">
          <TxTag number={number}>{c.tag}</TxTag>
          <TwoTone
            id="choose-title"
            className="rv mt-5"
            lead={
              <>
                {c.lead}
                <br />
              </>
            }
            strong={c.strong}
            style={{ transitionDelay: ".06s" }}
          />
          {c.text && (
            <p className="rv mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
              {c.text}
            </p>
          )}
          <ol className="mt-[clamp(28px,3.2vw,44px)] grid gap-x-[clamp(24px,3vw,44px)] sm:grid-cols-2" role="list">
            {c.cards.map(([title, text], i) => (
              <li key={title} className="choose-item rv flex gap-4 border-t border-ndm-ink/10 py-[clamp(18px,2vw,24px)]" style={{ transitionDelay: `${0.05 * i + 0.1}s` }}>
                <span aria-hidden="true" className="choose-num mt-[3px] grid size-9 shrink-0 place-items-center rounded-full bg-white font-inter text-[12.5px] font-semibold text-ndm-deep tabular-nums ring-1 ring-ndm-blue/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-aeonik text-[clamp(19px,1.5vw,21px)] leading-[1.25] font-normal tracking-[-0.01em] text-ndm-ink">{title}</h3>
                  <p className="mt-1.5 font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {/* photo: right */}
        <figure className="rv rv-clip relative m-0 aspect-[4/5] overflow-hidden rounded-[28px] bg-ndm-line lg:sticky lg:top-[170px] lg:aspect-auto lg:h-[min(720px,calc(100vh-200px))] lg:min-h-[560px]" style={{ transitionDelay: ".08s" }}>
          <TxPhoto src={c.img} alt={c.alt} sizes="(min-width: 1024px) 520px, 100vw" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t/srgb from-ndm-night/45 to-transparent" />
          <figcaption className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-[18px] bg-white/85 p-3 pr-4 backdrop-blur-md sm:inset-x-5 sm:bottom-5">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
              <IconCheckBadge />
            </span>
            <span className="font-inter text-[13.5px] leading-[1.4] text-ndm-ink">
              Every plan starts with a <strong className="font-semibold">free consultation</strong> and VISIA® skin analysis.
            </span>
          </figcaption>
        </figure>
      </div>
    </RevealSection>
  );
}
