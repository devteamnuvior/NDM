"use client";

import { useRef } from "react";
import { PriceGroup, type TxPriceGroup } from "@/components/treatment/price-group";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { PayPlans } from "@/components/ui/pay-plans";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { useReveal } from "@/hooks/use-reveal";
import { pageLink, pagePath } from "@/lib/routes";
import type { TreatmentPage } from "@/types/treatment";

interface TxPricesProps {
  prices: Pick<TreatmentPage["prices"], "lead" | "strong" | "intro" | "category">;
  /** "How many you need"; left out when the page has none. */
  sessions?: TreatmentPage["sessions"];
  number: string;
  /** The price list: one folding group per product, each with its rows from the price list. */
  groups: TxPriceGroup[];
}

/** Price and plan: the rows of each picked product from the price list in a folding group (with Add to cart, the first one open), then how many sessions. */
export function TxPrices({ prices: pr, sessions, number, groups }: TxPricesProps) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  return (
    <section ref={section} id="prices" aria-labelledby="prices-title" className="proc-peach relative z-10 scroll-mt-[170px] px-[var(--gx)] py-[clamp(64px,7vw,110px)]">
      <TxHead number={number} tag="Price list" headingId="prices-title" lead={pr.lead} strong={pr.strong} text={pr.intro} />
      <div className={TX_WRAP}>
        <ul className="pr-groups rv mx-auto mt-[clamp(40px,4.5vw,64px)] max-w-[1040px]" role="list" style={{ transitionDelay: ".14s" }}>
          {groups.map((g, i) => (
            <PriceGroup key={g.name} group={g} headId={i ? `tx-pr-h-${i + 1}` : "tx-pr-h"} bodyId={i ? `tx-pr-${i + 1}` : "tx-pr"} category={g.category ?? pr.category} startOpen={i === 0} singular />
          ))}
        </ul>
        {sessions && (
          <div id="sessions" className="rv mx-auto mt-6 grid max-w-[1040px] scroll-mt-[170px] gap-4 rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-7 sm:p-6" style={{ transitionDelay: ".16s" }}>
            <p className="flex items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0.5">
              <span className="font-inter text-[12px] font-semibold tracking-[.14em] text-ndm-muted uppercase">How many you need</span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-aeonik text-[34px] leading-none tracking-[-0.03em] text-ndm-ink">{sessions.stat}</span>
                <span className="font-inter text-[15px] text-ndm-muted">{sessions.unit}</span>
              </span>
            </p>
            <div>
              <p className="font-inter text-[15px] leading-[1.6] text-ndm-ink/85">{sessions.text}</p>
              <ul className="mt-3 flex flex-wrap gap-2" role="list">
                {sessions.chips.map((c) => (
                  <li key={c} className="rounded-full bg-ndm-paper px-3 py-1 font-inter text-[13px] text-ndm-ink ring-1 ring-ndm-ink/10">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="rv mt-10 flex flex-wrap justify-center gap-3" style={{ transitionDelay: ".18s" }}>
          <Button href={ACTIONS.book} v="book">
            Book Free Consultation
          </Button>
          <SiteLink to={{ ...pageLink("pricing"), href: `${pagePath("pricing")}#prices` }} className="btn btn-line">
            <span>All treatment prices</span>
          </SiteLink>
        </div>
        <div className="mt-6 flex justify-center">
          <PayPlans />
        </div>
        <p className="mt-6 text-center font-inter text-[12.5px] leading-[1.6] text-ndm-muted">Prices in CAD from the current NewDermaMed price list and subject to change. Your final price is confirmed at your free consultation.</p>
      </div>
    </section>
  );
}
