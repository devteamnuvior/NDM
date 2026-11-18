"use client";

import { useSyncExternalStore } from "react";
import { BF_SALE } from "@/config/black-friday";
import { withBase } from "@/lib/base-path";

const noop = () => () => {};

/** The offer line on this badge (user, 2026-11-18: "Up to 60% off" on the form, in both the prototype and the site; the bottom tab keeps BF_SALE.badge). */
const BADGE = "Up to 60% off";

/**
 * The Black Friday sale as a small badge on the treatment pages' booking form (user, 2026-11-18): the bottom
 * tab's look (black, the red % mark) with "Black Friday Sale" and its offer line, linking to the sale page.
 * Shown in the browser only (it reads the clock) and left out once the sale is over.
 */
export function BfFormBadge() {
  /* the time of the first browser render; null on the server */
  const now = useSyncExternalStore(noop, () => Date.now(), () => null);
  if (now === null || now > new Date(BF_SALE.end).getTime()) return null;
  return (
    <a href={withBase("/black-friday")} className="bfb" aria-label={`Black Friday Sale, ${BADGE}. See the offers`}>
      <span aria-hidden="true" className="bfb-mark font-aeonik">
        %
      </span>
      <span className="bfb-text" aria-hidden="true">
        <span className="bfb-label">Black Friday Sale</span>
        <span className="bfb-badge">{BADGE}</span>
      </span>
    </a>
  );
}
