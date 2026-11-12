import { PriceGroup, type TxPriceGroup } from "@/components/treatment/price-group";
import { TxTag } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { pageLink, pagePath } from "@/lib/routes";

interface ProcPricesProps {
  lead: string;
  strong: string;
  /** Price-list category name (cart lines). */
  category: string;
  number: string;
  groups: TxPriceGroup[];
}

/** Prices of a product sold per unit: one folding group per product (the first starts open), each row with Add to cart. */
export function ProcPrices({ lead, strong, category, number, groups }: ProcPricesProps) {
  return (
    <RevealSection id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 scroll-mt-[150px] px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <div className="mx-auto max-w-[1040px]">
        <div className="text-center">
          <TxTag number={number}>Price list</TxTag>
          <TwoTone
            id="prices-title"
            className="rv mx-auto mt-5"
            lead={
              <>
                {lead}
                <br />
              </>
            }
            strong={strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mx-auto mt-5 max-w-[52ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            Prices per unit and per package, with current offers. Your plan and final price are confirmed at your free consultation.
          </p>
        </div>
        <ul className="pr-groups rv mt-[clamp(40px,4.5vw,64px)]" role="list" style={{ transitionDelay: ".14s" }}>
          {groups.map((g, i) => (
            <PriceGroup key={g.name} group={g} headId={`proc-pr-h${i}`} bodyId={`proc-pr${i}`} category={category} startOpen={i === 0} />
          ))}
        </ul>
        <div className="rv mt-10 flex flex-wrap justify-center gap-3" style={{ transitionDelay: ".18s" }}>
          <Button href={ACTIONS.book} v="book">
            Book Free Consultation
          </Button>
          <SiteLink to={{ ...pageLink("pricing"), href: `${pagePath("pricing")}#prices` }} className="btn btn-line">
            <span>All treatment prices</span>
          </SiteLink>
        </div>
        <p className="mt-8 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation.</p>
      </div>
    </RevealSection>
  );
}
