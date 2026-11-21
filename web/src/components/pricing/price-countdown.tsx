"use client";

import { Fragment, useSyncExternalStore } from "react";
import { useBfClock } from "@/components/black-friday/bf-timer";
import { BF_SALE } from "@/config/black-friday";
import { withBase } from "@/lib/base-path";

const noop = () => () => {};

/**
 * The Black Friday countdown under the Pricing page's header (user, 2026-11-18: "so people buy sooner"):
 * a black card with the circling gold edge of the page's sale banner, the time left in four tiles and a link to
 * the sale. Before the sale it counts to the start, during it to the end, and it is left out once the sale is over.
 * Drawn in the browser only (it reads the clock).
 */
export function PriceCountdown() {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const t = useBfClock();
  if (!ready || t.over) return null;
  const cells: [number, string][] = [
    [t.d, "Days"],
    [t.h, "Hours"],
    [t.m, "Mins"],
    [t.s, "Secs"],
  ];
  return (
    <section aria-label="Black Friday countdown" className="pcd-wrap relative z-10 bg-ndm-paper px-[var(--gx)]">
      <div className="pcd mx-auto max-w-[1040px]">
        <div className="pcd-copy">
          <p className="pcd-tag">
            <i aria-hidden="true" />
            Black Friday {BF_SALE.when}
          </p>
          <p className="pcd-title font-aeonik">
            Black Friday <span className="tt-strong">{t.live ? "ends in" : "starts in"}</span>
          </p>
          <p className="pcd-text">{t.live ? "Offers end Dec 7 at 11:59 pm, Toronto time." : "Plan your treatments now and be ready when it starts."}</p>
        </div>
        <div className="pcd-time" role="timer" aria-label={`${t.d} days, ${t.h} hours and ${t.m} minutes`}>
          {cells.map(([n, label], k) => (
            <Fragment key={label}>
              {k > 0 && (
                <span className="pcd-sep font-aeonik" aria-hidden="true">
                  :
                </span>
              )}
              <span className="pcd-cell" aria-hidden="true">
                <span className="pcd-num font-aeonik">{String(n).padStart(2, "0")}</span>
                <span className="pcd-lab">{label}</span>
              </span>
            </Fragment>
          ))}
        </div>
        <a href={withBase("/black-friday")} className="btn pcd-btn">
          See Black Friday offers
        </a>
      </div>
    </section>
  );
}
