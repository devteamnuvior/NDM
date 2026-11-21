import type { CSSProperties } from "react";
import { tagWords } from "@/lib/pricing-view";

/** An offer in the pill's words, in one or two parts: "Up to 30% off" -> UP TO | 30% OFF, "Buy 1 get 1 free" -> BUY 1 | GET 1 FREE. */
export function dealParts(deal: string): string[] {
  const t = tagWords(deal);
  const m = /^(UP TO|BUY \d+)\s+(.+)$/.exec(t);
  return m ? [m[1], m[2]] : t ? [t] : [];
}

/**
 * The offer of a specials card (the offers wheel, the Promotion page's cards, the Pricing page's Monthly specials) as a
 * pill in the price tables' split pattern, in black and gold. `small`: on a scaled-down wheel card.
 */
export function DealPill({ deal, className = "", small, style }: { deal: string; className?: string; small?: boolean; style?: CSSProperties }) {
  const parts = dealParts(deal);
  if (!parts.length) return null;
  return (
    <span className={`dp ${parts.length > 1 ? "dp-split" : ""} ${small ? "dp-sm" : ""} ${className}`} style={style}>
      {parts.map((t, i) => (
        <span key={i} className={i ? "dp-b" : "dp-a"}>
          {t}
        </span>
      ))}
    </span>
  );
}
