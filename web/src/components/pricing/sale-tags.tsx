"use client";

import { createContext, useContext, type ReactNode } from "react";
import { money } from "@/lib/cart";
import type { PriceSource } from "@/lib/price-book";

/**
 * The sale that is running, as every price table shows it: its look (the colours of the offer tags and of
 * the sale price) and the checkout code's percentage ("+ EXTRA 30%"). Null outside a sale.
 * Set once for the whole site (site layout), so the Pricing page and the treatment pages' price tables agree.
 */
export type SaleLook = "vip" | "bf" | "holiday" | "newyear";
export interface SaleTagsValue {
  look: SaleLook;
  percent: number;
}
const SaleTagsContext = createContext<SaleTagsValue | null>(null);

export function SaleTagsProvider({ value, children }: { value: SaleTagsValue | null; children: ReactNode }) {
  return <SaleTagsContext value={value}>{children}</SaleTagsContext>;
}
export const useSaleTags = () => useContext(SaleTagsContext);

/**
 * The offer tag of a price table row. Outside a sale it is the plain red tag ("Up to 30% off"); during a
 * sale it is the pill in the sale's look, in two halves when the offer has two parts
 * ("30% OFF" | "+ EXTRA 30%", "BUY 1" | "GET 1 FREE").
 */
export function OfferTag({ offer, badge, coded, small, plain = "pr-badge" }: { offer: string; badge: string[]; coded: boolean; small?: boolean; plain?: string }) {
  const sale = useSaleTags();
  if (!sale) return offer ? <span className={plain}>{offer}</span> : null;
  const parts =
    badge.length === 1 && coded && /%\s*OFF$/.test(badge[0])
      ? [badge[0], `+ EXTRA ${sale.percent}%`]
      : badge.length
        ? badge
        : coded
          ? [`+ EXTRA ${sale.percent}%`]
          : [];
  if (!parts.length) return null;
  return (
    <span data-look={sale.look} className={`sb ${small ? "sb-sm" : ""} ${parts.length > 1 ? "sb-split" : ""}`}>
      {parts.map((t, i) => (
        <span key={i} className={i ? "sb-b" : "sb-a"}>
          {t}
        </span>
      ))}
    </span>
  );
}

/**
 * Where a lowest price is read from, in a few words: "Skin Booster, 2 Syringes". `withItem` puts the treatment's
 * name first (a category's price, read from one of its treatments).
 */
export function sourceWords(s: PriceSource | null | undefined, withItem: boolean): string {
  if (!s) return "";
  const what = [withItem ? s.item : "", s.label === "Price" ? "" : s.label].filter(Boolean).join(", ");
  return what;
}

/**
 * "From $343 / session": during a sale in the sale's colour with the regular price struck through; under it,
 * marked with a small blue dot, where the price is read from ("Microneedling-Face, Package of 3").
 */
export function FromPrice({ from, unit, source, withItem, big, mark }: { from: number | string; unit?: string; source?: PriceSource | null; withItem?: boolean; big?: boolean; /** the blue dot: this is the price the category's "from" is read from */ mark?: boolean }) {
  const sale = useSaleTags();
  const value = typeof from === "number" ? money(from) : from;
  const cut = sale && source && source.was > 0;
  const words = sourceWords(source, !!withItem);
  return (
    <span className="flex flex-col items-start sm:items-end">
      <span className="font-inter text-[13px] whitespace-nowrap text-ndm-muted">
        {mark && <i className="pr-dot" aria-hidden="true" title="The category's lowest price" />}
        From{" "}
        {cut ? (
          <s className="pr-was mr-1">
            <span className="sr-only">Regular price </span>
            {money(source.was)}
          </s>
        ) : null}
        <span data-look={sale?.look} className={`pr-from font-aeonik tracking-[-0.02em] ${big ? "text-[22px]" : "text-[20px]"} ${cut ? "is-sale" : "text-ndm-ink"}`}>
          {value}
        </span>
        {unit}
      </span>
      {words && (
        <span className="pr-src mt-1 font-inter text-[11.5px] leading-[1.35] text-ndm-muted">
          <i aria-hidden="true" />
          <span className="sr-only">Lowest price, from </span>
          {words}
        </span>
      )}
    </span>
  );
}

/** The small blue marker next to the treatment or option a "from" price is read from. */
export function SourceMark({ children }: { children: ReactNode }) {
  return (
    <span className="pr-src-tag">
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
