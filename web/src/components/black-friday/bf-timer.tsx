"use client";

import { Fragment, useEffect, useState } from "react";
import { BF_SALE } from "@/config/black-friday";

export interface BfClock {
  /** The sale has started. */
  live: boolean;
  /** The sale has ended. */
  over: boolean;
  /** Share of the sale that has passed (0 to 1). */
  pct: number;
  d: number;
  h: number;
  m: number;
  s: number;
}

/** Time left until the sale starts, or, once it has, until it ends. Browser only: it reads the clock. */
export function useBfClock(step = 1000): BfClock {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), step);
    return () => clearInterval(t);
  }, [step]);
  const start = new Date(BF_SALE.start).getTime();
  const end = new Date(BF_SALE.end).getTime();
  const live = now >= start;
  const ms = Math.max(0, (live ? end : start) - now);
  return {
    live,
    over: now > end,
    pct: live ? Math.min(1, (now - start) / (end - start)) : 0,
    d: Math.floor(ms / 864e5),
    h: Math.floor((ms % 864e5) / 36e5),
    m: Math.floor((ms % 36e5) / 6e4),
    s: Math.floor((ms % 6e4) / 1e3),
  };
}

function Digits({ v }: { v: number }) {
  return (
    <span className="bft-num font-aeonik">
      {String(v)
        .padStart(2, "0")
        .split("")
        .map((c, i) => (
          /* keyed by its value, so a changed digit is a new element and rolls in */
          <span key={`${i}-${c}`} className="bft-dig">
            {c}
          </span>
        ))}
    </span>
  );
}

/** The countdown: four dark tiles with rolling digits. */
export function BfTimer({ t, size = "md" }: { t: BfClock; size?: "md" | "lg" }) {
  const cells: [number, string][] = [
    [t.d, "Days"],
    [t.h, "Hours"],
    [t.m, "Mins"],
    [t.s, "Secs"],
  ];
  return (
    <div className={`bft bft-${size}`} role="timer" aria-label={`${t.live ? "Offers end in" : "Black Friday starts in"} ${t.d} days, ${t.h} hours and ${t.m} minutes`}>
      {cells.map(([n, label], k) => (
        <Fragment key={label}>
          {k > 0 && (
            <span className="bft-sep font-aeonik" aria-hidden="true">
              :
            </span>
          )}
          <span className="bft-cell" aria-hidden="true">
            <span className="bft-tile">
              <Digits v={n} />
            </span>
            <span className="bft-lab">{label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
