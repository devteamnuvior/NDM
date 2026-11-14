"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { FactIcon, factIcon } from "@/components/treatment/icons";
import { TX_WRAP } from "@/components/treatment/tx-head";
import { IconPhone } from "@/components/ui/icons";
import { CLINICS } from "@/config/site";
import { tel } from "@/lib/routes";
import { withBase } from "@/lib/base-path";

/* Downtown first, as in the prototype */
const CALLS = [...CLINICS].reverse();

/**
 * Treatment at a glance: a white strip that sits half over the bottom of the header photo, an icon per
 * fact and both phone numbers. Its own height is measured so the overlap stays at half on every screen,
 * and the header gets the same extra room at its bottom, so the card never covers its text.
 */
export function TxGlance({ facts }: { facts: [label: string, value: string][] }) {
  const card = useRef<HTMLDivElement>(null);
  const [half, setHalf] = useState(48);
  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const fit = () => setHalf(Math.round(el.offsetHeight / 2));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    /* measure again once styles and fonts have settled, in case the observer is throttled (background tabs) */
    window.addEventListener("load", fit);
    void document.fonts?.ready.then(fit);
    const t = setTimeout(fit, 900);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", fit);
      clearTimeout(t);
    };
  }, []);
  return (
    <div role="region" aria-labelledby="glance-title" className="tx-glance relative z-20 px-[var(--gx)]" style={{ marginTop: -half }}>
      <style>{`section[aria-labelledby="proc-title"]>.grid{padding-bottom:calc(${half}px + clamp(28px,4.5vw,64px))}`}</style>
      <h2 id="glance-title" className="sr-only">
        Treatment at a glance
      </h2>
      <div ref={card} className={`${TX_WRAP} grid gap-4 rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-36px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/[.06] sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-7`}>
        <dl className={`grid grid-cols-2 gap-x-3 gap-y-4 ${facts.length > 3 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {facts.map(([label, value], i) => (
            <div key={label} className={`flex items-center gap-3 ${i ? "md:border-l md:border-ndm-ink/10 md:pl-5" : ""}`}>
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-linear-to-br/srgb from-ndm-sky to-ndm-deep text-white shadow-[0_10px_20px_-12px_rgba(15,128,195,.9)]">
                <FactIcon name={factIcon(label)} size={21} />
              </span>
              <div className="min-w-0">
                <dt className="font-inter text-[12px] leading-[1.3] text-ndm-muted">{label}</dt>
                <dd className="font-inter text-[15px] leading-[1.3] font-semibold text-ndm-ink sm:text-[16px]">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-2 lg:w-[230px] lg:grid-cols-1">
          {CALLS.map((c) => (
            <a key={c.id} href={withBase(tel(c.phone))} aria-label={`Call the ${c.name} clinic at ${c.phone}`} className="btn btn-buy h-11 gap-2 px-3 text-[13.5px]">
              <IconPhone className="shrink-0" />
              <span className="truncate">
                <span className="lg:hidden">{c.name}</span>
                <span className="hidden lg:inline">
                  {c.phone} {c.name}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
