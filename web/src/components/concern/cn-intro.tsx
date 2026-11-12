import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { contentLink, pageLink } from "@/lib/routes";
import type { ConcernPage } from "@/types/concern";

const ROW = "group flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 font-inter text-[15px] text-ndm-ink transition-colors hover:bg-ndm-mist";
const Arrow = () => <IconArrow size={12} className="shrink-0 text-ndm-deep transition-transform group-hover:translate-x-0.5" />;

/** Overview: the concern in plain words, beside a card with the short answer and the pages on the site that cover it. */
export function CnIntro({ page: p, number }: { page: ConcernPage; number: string }) {
  const count = p.facts[0][1].replace(" to compare", "");
  const from = /^From/.test(p.facts[3][1]) ? `, ${p.facts[3][1].replace("From", "from")}` : "";
  return (
    <RevealSection id="about" aria-labelledby="about-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pt-[clamp(40px,5vw,72px)] pb-[clamp(24px,3vw,40px)]">
      <div className={`${TX_WRAP} grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] lg:gap-[clamp(40px,5vw,80px)]`}>
        <div>
          <TxTag number={number} className="rv mb-6">
            Overview
          </TxTag>
          <h2 id="about-title" className="sr-only">
            About this concern
          </h2>
          {p.lede.map((x, i) => (
            <p key={x} className="rv max-w-[62ch] font-inter text-[clamp(17px,1.35vw,20px)] leading-[1.7] text-ndm-ink/90 [&+p]:mt-5" style={{ transitionDelay: `${0.04 * i}s` }}>
              {x}
            </p>
          ))}
        </div>
        <aside className="rv self-start rounded-[22px] bg-white p-5 shadow-[0_18px_40px_-34px_rgba(27,36,43,.35)] ring-1 ring-ndm-ink/[.06] md:p-6" style={{ transitionDelay: ".1s" }}>
          <p className="font-inter text-[11.5px] font-semibold tracking-[.14em] text-ndm-muted uppercase">In short</p>
          <p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-ink/85">
            {p.short} at NewDermaMed Toronto: {count} treatment options{from}, chosen at a free consultation with a VISIA® skin analysis. Uptown and Downtown clinics.
          </p>
          <p className="mt-5 font-inter text-[11.5px] font-semibold tracking-[.14em] text-ndm-muted uppercase">On our site</p>
          <ul className="mt-3 grid gap-1.5" role="list">
            {p.pages.map((x) => (
              <li key={x.href}>
                <SiteLink to={contentLink(x.href)} className={ROW}>
                  <span>{x.name}</span>
                  <Arrow />
                </SiteLink>
              </li>
            ))}
            {p.gallery && (
              <li>
                <SiteLink to={pageLink("beforeAfter")} className={ROW}>
                  <span>Before &amp; after gallery</span>
                  <Arrow />
                </SiteLink>
              </li>
            )}
          </ul>
          <div className="mt-4 border-t border-ndm-line pt-4">
            <Button href={ACTIONS.book} v="book" hot block>
              Book Free Consultation
            </Button>
          </div>
        </aside>
      </div>
    </RevealSection>
  );
}
