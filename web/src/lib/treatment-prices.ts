import type { TxPriceGroup } from "@/components/treatment/price-group";
import type { PriceOption } from "@/config/prices";
import { formatPrice, rowsFrom, rowsPercent } from "@/lib/prices";

/**
 * One group of a treatment page's price table, from price-list options, with every amount written out.
 * `unitLabel` is the option that is the price of one unit ("Regular"), for products priced per unit.
 * Server-side: the page passes the result down, the price list itself is not sent to the browser.
 */
export function priceGroup(head: Pick<TxPriceGroup, "name" | "title" | "blurb">, options: PriceOption[], unitLabel?: string): TxPriceGroup {
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
    })),
    from: formatPrice(rowsFrom(options, !!unitLabel)),
    fromUnit: unitLabel ? " / unit" : undefined,
    percent: rowsPercent(options),
  };
}
