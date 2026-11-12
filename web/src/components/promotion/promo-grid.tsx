"use client";

import { useRef, useState } from "react";
import { OfferImg } from "@/components/specials/offer-photo";
import type { Offer } from "@/components/specials/offers";
import { SpecialIcon } from "@/components/specials/special-icon";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { FINANCING_URL } from "@/config/specials";
import { useReveal } from "@/hooks/use-reveal";

const FILTERS = ["All", "Face", "Body"] as const;
type Filter = (typeof FILTERS)[number];

/** All current offers: every special as a card, filtered by Face or Body. */
export function PromoGrid({ offers }: { offers: Offer[] }) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const [pick, setPick] = useState<Filter>("All");
  const list = pick === "All" ? offers : offers.filter((s) => s.area === pick);

  return (
    <section ref={section} aria-labelledby="offers" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,128px)]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <Eyebrow className="rv">Promotions</Eyebrow>
          <TwoTone
            id="offers"
            className="rv mt-5"
            lead={
              <>
                All current
                <br />
              </>
            }
            strong="offers"
            style={{ transitionDelay: ".06s" }}
          />
        </div>
        <div className="lg:justify-self-end">
          <p className="rv max-w-[44ch] font-inter text-[16px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            Professional service, exclusive pricing, and financing that fits your lifestyle.
          </p>
          <div className="rv mt-4 flex gap-2" role="group" aria-label="Filter offers" style={{ transitionDelay: ".14s" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPick(f)}
                aria-pressed={pick === f}
                className={`h-9 rounded-full border px-4 font-inter text-[13.5px] transition-colors ${pick === f ? "border-ndm-ink bg-ndm-ink text-white" : "border-ndm-ink/15 text-ndm-ink hover:border-ndm-ink"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ul key={pick} role="list" className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
        {list.map((s, i) => (
          <li key={s.id} className="promo-in" style={{ animationDelay: `${0.05 * i}s` }}>
            <article className="promo-card group relative flex h-full flex-col overflow-hidden rounded-[22px] p-3 pb-6">
              <span aria-hidden="true" className="sw-ring pointer-events-none absolute -right-20 -bottom-20 size-48 rounded-full" />
              <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist">
                <OfferImg
                  photo={s.photo}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                  style={{ transitionTimingFunction: "var(--e-out)", objectPosition: s.position }}
                />
                {s.deal && (
                  <span className="deal-badge absolute top-3 left-3">
                    <i aria-hidden="true">%</i>
                    {s.deal}
                  </span>
                )}
              </div>
              <div className="relative mt-5 flex items-center justify-between gap-2 px-3">
                <span className="promo-badge grid size-12 shrink-0 place-items-center rounded-full">
                  <SpecialIcon name={s.icon} />
                </span>
                <span className="promo-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] tracking-[.12em] uppercase">{s.tag}</span>
              </div>
              <h3 className="relative mt-5 px-3 font-aeonik text-[clamp(24px,2vw,28px)] leading-[1.1] font-normal tracking-[-0.025em] text-ndm-ink">{s.name}</h3>
              <p className="relative mt-2 px-3 font-inter text-[15px] leading-[1.55] text-ndm-muted">{s.text}</p>
              <div className="relative mt-auto flex items-end justify-between gap-3 px-3 pt-7">
                <span>
                  <span className="block font-inter text-[11px] tracking-[.18em] text-ndm-muted uppercase">From</span>
                  <span className="mt-1 block font-aeonik text-[38px] leading-none tracking-[-0.035em] whitespace-nowrap text-ndm-deep">
                    <span className="sw-cur">$</span>
                    {s.price}
                  </span>
                  <span className="mt-1.5 block font-inter text-[12.5px] text-ndm-muted">{s.unit}</span>
                </span>
                <Button href={s.href} v="ink" sm className="btn-buy">
                  Buy now
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <p className="rv mt-10 flex flex-col items-center justify-center gap-3 text-center font-inter text-[13px] tracking-[.16em] text-ndm-muted uppercase">
        Save on cosmetic treatment{" "}
        <span className="tracking-normal normal-case">
          <Button href={FINANCING_URL} v="line" sm>
            Apply for financing now
          </Button>
        </span>
      </p>
    </section>
  );
}
