"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BfTimer, useBfClock } from "@/components/black-friday/bf-timer";
import { BF_SALE } from "@/config/black-friday";
import { pageFromPathname, pagePath } from "@/lib/routes";

/**
 * The Black Friday tab at the bottom centre of every page; it opens a full-width panel with the countdown
 * and the link to the sale. Not shown on the sale page itself, or once the sale has ended. Browser only.
 */
export function BfDock() {
  const pathname = usePathname();
  const t = useBfClock(1000);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const tab = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setShown(true), 900);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => tab.current?.focus({ preventScroll: true }));
  };

  if (pageFromPathname(pathname) === "blackFridaySale" || t.over) return null;
  return (
    <>
      <div className={`bfd-scrim ${open ? "is-on" : ""}`} onClick={close} aria-hidden="true" />
      <button ref={tab} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="bfd-panel" className={`bfd-tab ${shown && !open ? "is-on" : ""}`}>
        <span aria-hidden="true" className="bfd-mark font-aeonik">
          %
        </span>
        <span className="bfd-label">
          Black Friday<span className="hidden sm:inline"> Sale</span>
        </span>
        <span className="bfd-badge">{BF_SALE.badge}</span>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>
      <section id="bfd-panel" role="dialog" aria-modal="false" aria-label="Black Friday sale" className={`bfd-panel ${open ? "is-open" : ""}`} inert={!open}>
        <span aria-hidden="true" className="bfd-tape" />
        <button type="button" onClick={close} aria-label="Close the Black Friday panel" className="bfd-close">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <div className="mx-auto grid max-w-[1180px] gap-8 px-[var(--gx)] pt-9 pb-[calc(28px+env(safe-area-inset-bottom))] lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-center lg:gap-14 lg:pt-12 lg:pb-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-3.5 py-1.5 font-inter text-[12px] font-semibold tracking-[.16em] text-white/85 uppercase">
              <i aria-hidden="true" className="bfd-dot" />
              Black Friday · {BF_SALE.when}
            </p>
            <h2 className="mt-4 font-aeonik text-[clamp(44px,6vw,84px)] leading-[.92] font-normal tracking-[-0.04em] text-white">
              Black Friday<span className="text-[#EE3A45]">.</span>
            </h2>
            <p className="mt-4 max-w-[46ch] font-inter text-[15.5px] leading-[1.6] text-white/75">
              <b className="font-semibold text-white">{BF_SALE.badge} selected treatments</b> at both Toronto clinics. Build your plan, then book a free consultation to claim it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href={pagePath("blackFridaySale")} className="btn bfd-cta">
                See the Black Friday deals
              </a>
            </div>
          </div>
          <div>
            <p className="mb-3 flex items-center justify-between gap-3 font-inter text-[12px] font-semibold tracking-[.16em] text-white/65 uppercase">
              <span>{t.live ? "Offers end in" : "Black Friday starts in"}</span>
              <span className="hidden text-white/45 sm:inline">{t.live ? "Nov 30, 11:59 pm" : "Nov 27, 12:00 am"}</span>
            </p>
            <BfTimer t={t} size="lg" />
            {t.live ? (
              <div className="mt-5">
                <div className="bft-bar">
                  <i style={{ width: `${(t.pct * 100).toFixed(1)}%` }} />
                </div>
                <p className="mt-2 font-inter text-[12.5px] text-white/55">{Math.round(t.pct * 100)}% of Black Friday has passed</p>
              </div>
            ) : (
              <p className="mt-5 font-inter text-[13px] text-white/55">Doors open Friday, November 27. Plan ahead now, the deals are live on the page.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
