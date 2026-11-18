import type { TxPriceGroup } from "@/components/treatment/price-group";
import type { PriceOption } from "@/config/prices";
import { createPriceBook, formatPrice, rowsPercent } from "@/lib/prices";
import { badgeCoded, bestOffer, saleBadge } from "@/lib/pricing-view";

/**
 * One group of a treatment page's price table, from price-list options, with every amount written out.
 * `unitLabel` is the option that is the price of one unit ("Regular"), for products priced per unit.
 * It reads exactly as the treatment's row on the Pricing page does: the same "From" price (the lowest per
 * unit, syringe, zone or session), the same offer badge, and, on the packages the sale's checkout code
 * applies to, the same line with the price after the code.
 * Server-side: the page passes the result down, the price list itself is not sent to the browser.
 */
export function priceGroup(head: Pick<TxPriceGroup, "name" | "title" | "blurb">, options: PriceOption[], unitLabel?: string): TxPriceGroup {
  /* the Pricing page's own sum, over this one treatment */
  const low = createPriceBook([{ id: "group", name: "", perUnit: !!unitLabel, blurb: "", items: [{ name: head.name, note: "", options }] }]).lowestPrice("group", undefined, true);
  return {
    ...head,
    rows: options.map((o) => ({
      label: o.label,
      shown: o.label === unitLabel ? "Per unit" : undefined,
      price: o.price,
      priceText: formatPrice(o.price),
      unit: o.label === unitLabel ? " / unit" : undefined,
      regular: o.regular,
      regularText: o.regular ? formatPrice(o.regular) : "",
      tag: o.tag,
      ...(o.code && o.codeName ? { code: o.code, codeName: o.codeName, codePercent: o.codePercent } : {}),
      codeText: o.code && o.codeName && o.codePercent ? `Extra ${o.codePercent}%\u00a0off with code ${o.codeName}: ${formatPrice(o.code)}` : undefined,
    })),
    from: formatPrice(low ? low.value : Math.min(...options.map((o) => o.price))),
    fromUnit: unitLabel ? " / unit" : undefined,
    percent: rowsPercent(options),
    offer: bestOffer(options),
    fromSource: low ? { ...low.source, label: low.source.label === unitLabel ? "Per unit" : low.source.label } : null,
    badge: saleBadge(options),
    coded: badgeCoded(options),
  };
}
