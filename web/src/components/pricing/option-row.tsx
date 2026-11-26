"use client";

import type { ReactNode } from "react";
import { money } from "@/lib/cart";
import { PillPart, useSaleTags, useSaleWords, useWithBestDeal } from "@/components/pricing/sale-tags";

/** How many units, syringes, zones or sessions an option's label covers, and what one is called ("Package of 3" -> 3 sessions). */
function countOf(label: string): { n: number; one: string; many: string } | null {
  const m = /(\d+)\s*(unit|syringe|session|vial|treatment|zone)s?\b/i.exec(label);
  if (m) return { n: Number(m[1]), one: m[2].toLowerCase(), many: `${m[2].toLowerCase()}s` };
  const p = /package of (\d+)/i.exec(label);
  return p ? { n: Number(p[1]), one: "session", many: "sessions" } : null;
}

/** A clinic tag in the pill's words: "SALE 30% OFF" -> "VIP 30% OFF" in the VIP Sale, "Save $1000 Off" -> "SAVE $1,000". */
function pillWords(tag: string, look: string): string[] {
  const t = tag
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/^SALE\s+/, look === "vip" ? "VIP " : "")
    .replace(/^SAVE \$(\d+)(?: OFF)?$/, (_, n: string) => `SAVE $${Number(n).toLocaleString("en-CA")}`);
  const buy = /^(BUY \d+)\s+(GET .+)$/.exec(t);
  return buy ? [buy[1], buy[2]] : [t];
}

export interface OptionRowProps {
  label: string;
  price: number;
  /** Regular price before the offer; 0 when there is none. */
  was: number;
  /** While a sale runs: the price with the checkout code, on the packages it applies to. */
  code?: number;
  codeName?: string;
  codePercent?: number;
  tag?: string;
  /** " / unit" after the price of the per-unit row. */
  unit?: string;
  /** The Add to cart control. */
  action: ReactNode;
  data?: Record<string, string | number | undefined>;
  /** The blue dot: the "from" price above is read from this option. */
  mark?: boolean;
}

/**
 * One option of a treatment, in the stacked-discount layout: its name, how many it covers and the price of
 * one, the offer pill; on the right the earlier prices struck through, the price to pay large, and the saving.
 */
export function OptionRow({ label, price, was, code, codePercent, tag, unit, action, data, mark }: OptionRowProps) {
  const sale = useSaleTags();
  const words = useSaleWords();
  const withBest = useWithBestDeal();
  const coded = !!(sale && code && code < price);
  const final = coded ? (code as number) : price;
  const cnt = countOf(label);
  const struck = [was > final ? was : 0, coded ? price : 0].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  const save = Math.round(((was || price) - final) * 100) / 100;
  const pct = codePercent ?? sale?.percent;
  const found = tag && sale ? pillWords(tag, sale.look) : [];
  if (found.length === 1 && coded && pct) found.push(`+ EXTRA ${pct}%`);
  const pill = withBest(found);
  return (
    <li {...data} className={`pr-opt pr-opt2 ${struck.length || tag ? "is-featured" : ""}`}>
      <span className="pr-opt2-info">
        <span className="pr-opt2-name">{label}</span>
        {cnt && cnt.n > 1 && (
          <span className="pr-opt2-meta">
            {cnt.n} {cnt.many} ·{" "}
            {/* the price of one stands out in bold (user, 2026-11-25) */}
            <b className="pr-opt2-per">
              {money(Math.round((final / cnt.n) * 100) / 100)} per {cnt.one}
            </b>
          </span>
        )}
        {tag &&
          (sale ? (
            <span data-look={sale.look} className={`sb sb-sm pr-opt2-offer ${pill.length > 1 ? "sb-split" : ""}`}>
              {pill.map((t, i) => (
                <PillPart key={i} text={t} second={i > 0} words={words} />
              ))}
            </span>
          ) : (
            <span className="pr-tag pr-opt2-offer">{tag}</span>
          ))}
      </span>
      <span className={`pr-opt2-price ${struck.length ? "" : "is-single"}`}>
        {struck.length > 0 && (
          <span className="pr-opt2-was">
            {struck.map((v, i) => (
              <s key={i}>
                <span className="sr-only">{i ? "Sale price " : "Regular price "}</span>
                {money(v)}
              </s>
            ))}
          </span>
        )}
        <span data-look={sale?.look} className="pr-opt2-now">
          {mark && <i className="pr-dot" aria-hidden="true" title="The lowest price" />}
          {struck.length ? <span className="sr-only">now </span> : null}
          {money(final)}
          {unit && <span className="pr-opt2-unit">{unit}</span>}
        </span>
        {struck.length > 0 && (
          <span className="pr-opt2-with">
            {coded && (
              <>
                <span className="pr-opt2-tick" aria-hidden="true">
                  &#10003;
                </span>
                <span>
                  Extra {pct}% applied
                </span>
                <span className="pr-opt2-sep"> · </span>
              </>
            )}
            {save > 0 && <span className="pr-opt2-save">You save {money(save)}</span>}
          </span>
        )}
      </span>
      <span className="pr-opt2-act">{action}</span>
    </li>
  );
}
