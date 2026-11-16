"use client";

import { useState } from "react";
import { QtyControl } from "@/components/cart/qty-control";
import { FromPrice, OfferTag } from "@/components/pricing/sale-tags";
import { OptionRow } from "@/components/pricing/option-row";
import type { PriceSource } from "@/lib/price-book";

/** One row of a price table, with its amounts already written out ("$2500"). */
export interface TxPriceRow {
  label: string;
  /** What the row shows as its name ("Per unit" for the unit price). */
  shown?: string;
  price: number;
  priceText: string;
  /** " / unit" after the price of the per-unit row. */
  unit?: string;
  /** Regular price before the offer; 0 when there is none. */
  regular: number;
  regularText: string;
  tag?: string;
  /** While a sale runs, on a package its checkout code applies to: "Extra 30% off with code PLUS30: $720.30". */
  codeText?: string;
  /** While a sale runs: the price with the checkout code, its name and percentage. */
  code?: number;
  codeName?: string;
  codePercent?: number;
}

export interface TxPriceGroup {
  /** Cart line name. */
  name: string;
  /** Price-list category name of this group (cart lines), when the groups of one table come from several categories. */
  category?: string;
  title: string;
  blurb: string;
  rows: TxPriceRow[];
  /** Lowest price in the table (per unit, syringe, zone or session, as on the Pricing page), written out. */
  from: string;
  /** " / unit" after the lowest price, for tables priced per unit. */
  fromUnit?: string;
  /** Largest percentage offer in the table, 0 when there is none. */
  percent: number;
  /** The offer badge of the group, as its row on the Pricing page shows it ("Up to 30% off", "Save $1000 Off"); "" when there is none. */
  offer?: string;
  /** Where the "from" price is read from (the option, its price and count); null when unknown. */
  fromSource?: PriceSource | null;
  /** The offer as the sale pill shows it, and whether the checkout code applies to any row. */
  badge?: string[];
  coded?: boolean;
}

interface PriceGroupProps {
  group: TxPriceGroup;
  /** Ids of the heading button and of the folding body. */
  headId: string;
  bodyId: string;
  /** Price-list category name (cart lines). */
  category: string;
  startOpen: boolean;
  /** "1 option" for a single row (the Aptos page); the Botox page always says "options". */
  singular?: boolean;
}

/** One folding group of a treatment page's price table, in the Pricing page's look; every row can go into the cart. */
export function PriceGroup({ group: g, headId, bodyId, category, startOpen, singular }: PriceGroupProps) {
  const [open, setOpen] = useState(startOpen);
  return (
    <li className={`pr-group ${open ? "is-open" : ""}`}>
      <h3 className="pr-ghead m-0">
        <button
          type="button"
          id={headId}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
          className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-[22px] text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6"
        >
          <span className="min-w-0">
            <span className="block font-inter text-[12.5px] text-ndm-muted tabular-nums">
              {g.rows.length} {singular && g.rows.length === 1 ? "option" : "options"}
            </span>
            <span className="mt-1.5 block font-aeonik text-[clamp(24px,2.2vw,32px)] leading-[1.1] tracking-[-0.025em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{g.title}</span>
          </span>
          <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
            <OfferTag offer={g.offer || (g.percent > 0 ? `Up to ${g.percent}% off` : "")} badge={g.badge ?? []} coded={!!g.coded} />
            <FromPrice from={g.from} unit={g.fromUnit} source={g.rows.length > 1 ? g.fromSource : g.fromSource && { ...g.fromSource, label: "", count: 1 }} />
          </span>
          <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
            <i />
            <i />
          </span>
        </button>
      </h3>
      <div id={bodyId} role="region" aria-labelledby={headId} className="pr-body" inert={!open}>
        <div>
          <p className="pr-gintro max-w-[60ch] pb-2 font-inter text-[15px] leading-[1.55] text-ndm-muted">{g.blurb}</p>
          <ul className="pr-sub grid gap-2 py-4" role="list">
            {g.rows.map((r) => (
              <OptionRow
                key={r.label}
                label={r.shown ?? r.label}
                price={r.price}
                was={r.regular}
                code={r.code}
                codeName={r.codeName}
                codePercent={r.codePercent}
                mark={g.rows.length > 1 && !!g.fromSource && (r.label === g.fromSource.label || r.shown === g.fromSource.label)}
                tag={r.tag}
                unit={r.unit}
                action={<QtyControl line={{ key: `${g.name}|${r.label}`, cat: category, name: g.name, label: r.label, price: r.price, was: r.regular, unit: r.unit ?? "" }} label={`${g.name}, ${r.label}`} />}
              />
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
