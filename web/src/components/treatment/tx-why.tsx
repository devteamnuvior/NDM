import Image from "next/image";
import award from "@/assets/images/awards/top-choice-2026.png";
import teamAward from "@/assets/images/home/team-award.jpg";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { pageLink } from "@/lib/routes";
import type { TxWhyContent } from "@/types/treatment";

/** Why NewDermaMed: the team photo with the award badge in its corner, beside four proof points. */
export function TxWhy({ why: t, number }: { why: TxWhyContent; number: string }) {
  return (
    <RevealSection id="why" aria-labelledby="why-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag="Why NewDermaMed" headingId="why-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="rv relative aspect-[3/2] overflow-hidden rounded-[24px] bg-ndm-mist">
          <Image src={teamAward} alt={t.alt} sizes="(min-width: 1024px) 620px, 100vw" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.position }} />
          <span className="absolute bottom-3 left-3 flex items-center gap-3 rounded-[16px] bg-white/95 py-2 pr-4 pl-2 shadow-[0_18px_40px_-20px_rgba(27,36,43,.55)] backdrop-blur-[8px] sm:bottom-4 sm:left-4">
            <Image src={award} alt="" sizes="44px" className="size-11 object-contain" />
            <span>
              <span className="block font-inter text-[13.5px] font-semibold text-ndm-ink">Top Choice Award</span>
              <span className="block font-inter text-[12px] text-ndm-muted">8 consecutive years</span>
            </span>
          </span>
        </div>
        <div>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-6" role="list">
            {t.items.map(([figure, unit, text], i) => (
              <li key={unit} className="rv border-t border-ndm-ink/10 pt-4" style={{ transitionDelay: `${0.06 * i}s` }}>
                <span className="block font-aeonik text-[clamp(30px,2.8vw,40px)] leading-none tracking-[-0.03em] text-ndm-ink">{figure}</span>
                <span className="mt-1.5 block font-inter text-[13px] font-semibold tracking-[.12em] text-ndm-deep uppercase">{unit}</span>
                <span className="mt-2 block font-inter text-[14px] leading-[1.5] text-ndm-muted">{text}</span>
              </li>
            ))}
          </ul>
          <div className="rv mt-8 flex flex-wrap gap-3">
            <Button href={ACTIONS.book} v="book">
              Book Free Consultation
            </Button>
            <SiteLink to={pageLink("about")} className="btn btn-line">
              <span>About us</span>
            </SiteLink>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
