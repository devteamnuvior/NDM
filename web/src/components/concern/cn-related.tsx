import { TX_WRAP } from "@/components/treatment/tx-head";
import { TxPhoto } from "@/components/treatment/tx-photo";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { pageLink, resolveLabel } from "@/lib/routes";
import type { ConcernPage } from "@/types/concern";

/** Related treatments as photo cards, each linking to the treatment's own page. */
export function CnRelated({ related }: { related: ConcernPage["related"] }) {
  return (
    <RevealSection id="related" aria-labelledby="related-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pb-[clamp(56px,6vw,96px)]">
      <nav aria-labelledby="related-title" className={TX_WRAP}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="related-title" className="rv font-aeonik text-[clamp(26px,2.4vw,36px)] leading-[1.1] font-normal tracking-[-0.02em] text-ndm-ink">
            Related <span className="tt-strong text-ndm-deep">treatments</span>
          </h2>
          <SiteLink to={pageLink("pricing")} className="rv group inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep">
            All treatments and prices
            <IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" />
          </SiteLink>
        </div>
        <ul className="no-scrollbar -mx-[var(--gx)] mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gx)] pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-6" role="list" style={{ scrollPaddingInline: "var(--gx)" }}>
          {related.map((r, i) => (
            <li key={r.name} className="rv w-[62%] shrink-0 snap-start sm:w-auto" style={{ transitionDelay: `${0.04 * i}s` }}>
              <SiteLink to={resolveLabel(r.menu)} className="guide-rel group relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-ndm-mist text-white">
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
