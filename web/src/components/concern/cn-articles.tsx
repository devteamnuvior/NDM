import { TX_WRAP } from "@/components/treatment/tx-head";
import { TxPhoto } from "@/components/treatment/tx-photo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { TwoTone } from "@/components/ui/two-tone";
import { contentLink, pageLink } from "@/lib/routes";
import type { ConcernPage } from "@/types/concern";

/** From the journal: articles about this concern (they open on the clinic's live blog). */
export function CnArticles({ articles, short }: { articles: ConcernPage["articles"]; short: string }) {
  if (!articles.length) return null;
  return (
    <RevealSection id="read" aria-labelledby="read-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <div className={`${TX_WRAP} flex flex-wrap items-end justify-between gap-x-10 gap-y-6`}>
        <div>
          <Eyebrow className="rv">From the journal</Eyebrow>
          <TwoTone
            id="read-title"
            className="rv mt-4"
            size="text-[clamp(32px,3.4vw,50px)]"
            lead={
              <>
                Read more about
                <br />
              </>
            }
            strong={short.toLowerCase()}
            style={{ transitionDelay: ".05s" }}
          />
        </div>
        <div className="rv" style={{ transitionDelay: ".12s" }}>
          <SiteLink to={pageLink("blog")} className="btn btn-line">
            <span>All articles</span>
          </SiteLink>
        </div>
      </div>
      <ul role="list" className={`${TX_WRAP} mt-[clamp(28px,3.4vw,44px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {articles.map((a, i) => (
          <li key={a.href} className="rv" style={{ transitionDelay: `${0.05 * i}s` }}>
            <SiteLink to={contentLink(a.href)} className="cn-card group flex h-full flex-col rounded-[22px] bg-white p-2.5 ring-1 ring-ndm-ink/[.06]">
              <span className="peach relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist">
                <TxPhoto src={a.img} alt="" sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" />
              </span>
              <span className="flex flex-1 flex-col px-2.5 pt-4 pb-2.5">
                <span className="font-inter text-[12.5px] text-ndm-muted">
                  {a.topic} · {a.date}
                </span>
                <span className="mt-1.5 block font-aeonik text-[clamp(19px,1.6vw,22px)] leading-[1.2] tracking-[-0.015em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{a.title}</span>
                <span className="mt-2 block flex-1 font-inter text-[14px] leading-[1.55] text-ndm-ink/75">{a.excerpt}</span>
              </span>
            </SiteLink>
          </li>
        ))}
      </ul>
    </RevealSection>
  );
}
