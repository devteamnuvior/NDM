"use client";

import { useState } from "react";
import { QtyControl } from "@/components/cart/qty-control";

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
}

export interface TxPriceGroup {
  /** Cart line name. */
  name: string;
  title: string;
  blurb: string;
  rows: TxPriceRow[];
  /** Lowest price in the table, written out. */
  from: string;
  /** " / unit" after the lowest price, for tables priced per unit. */
  fromUnit?: string;
  /** Largest percentage offer in the table, 0 when there is none. */
  percent: number;
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
            {g.percent > 0 && <span className="pr-badge">Up to {g.percent}%&nbsp;off</span>}
            <span className="font-inter text-[13px] whitespace-nowrap text-ndm-muted">
              From <span className="font-aeonik text-[20px] tracking-[-0.02em] text-ndm-ink">{g.from}</span>
              {g.fromUnit}
            </span>
          </span>
          <span aria-hidden="true" className="pr-plus pr-gplus col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
            <i />
            <i />
          </span>
        </button>
      </h3>
      <div id={bodyId} role="region" aria-labelledby={headId} className="pr-body" inert={!open}>
        <div>
          <p className="max-w-[60ch] pb-2 font-inter text-[15px] leading-[1.55] text-ndm-muted">{g.blurb}</p>
          <ul className="pr-sub grid gap-2 py-4" role="list">
            {g.rows.map((r) => (
              <li key={r.label} className="pr-opt grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-[14px] py-3 pr-3 pl-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-6 sm:pl-5">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="font-inter text-[15px] text-ndm-ink">{r.shown ?? r.label}</span>
                  {r.tag && <span className="pr-tag">{r.tag}</span>}
                </span>
                <span className="col-start-1 row-start-2 flex items-baseline gap-2.5 sm:col-start-2 sm:row-start-1 sm:justify-end">
                  {r.regular ? (
                    <s className="pr-was">
                      <span className="sr-only">Regular price </span>
                      {r.regularText}
                    </s>
                  ) : null}
                  <span className={`font-aeonik text-[22px] leading-none tracking-[-0.02em] ${r.regular ? "text-ndm-deep" : "text-ndm-ink"}`}>
                    {r.regular ? <span className="sr-only">now </span> : null}
                    {r.priceText}
                    {r.unit && <span className="font-inter text-[13px] tracking-normal text-ndm-muted">{r.unit}</span>}
                  </span>
                </span>
                <span className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
                  <QtyControl line={{ key: `${g.name}|${r.label}`, cat: category, name: g.name, label: r.label, price: r.price, was: r.regular, unit: r.unit ?? "" }} label={`${g.name}, ${r.label}`} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
