"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { FACT_ICONS, NAV_ICONS } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { contentLink } from "@/lib/routes";
import type { ConcernOption } from "@/types/concern";

type Column = "visit" | "course" | "down" | "res";
const COLUMNS: [key: Column | "from", label: string, icon: ReactNode][] = [
  ["visit", "Typical visit", FACT_ICONS.clock],
  ["course", "Typical course", FACT_ICONS.cal],
  ["down", "Downtime", FACT_ICONS.leaf],
  ["res", "Changes may appear", NAV_ICONS.star],
  ["from", "From", NAV_ICONS.tag],
];

const Icon = ({ size, className, children }: { size: number; className?: string; children: ReactNode }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

/** A treatment's small photo: a file under /assets (optimised), or a photo of WordPress's media library, shown as it is. */
function Thumb({ src, size, className }: { src: string; size: number; className: string }) {
  if (!src) return null;
  if (src.startsWith("/")) return <Image src={src} alt="" width={size} height={size} className={className} />;
  /* eslint-disable-next-line @next/next/no-img-element -- served by WordPress */
  return <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className={className} />;
}

/** The price pill: "From" as a small label when the price starts with it. */
function From({ r, className = "", stop }: { r: ConcernOption; className?: string; stop?: boolean }) {
  if (!r.price) return null;
  const isFrom = /^from/i.test(r.price);
  return (
    <SiteLink to={contentLink(r.priceHref)} onClick={stop ? (e) => e.stopPropagation() : undefined} className={`cn-from ${className}`}>
      {isFrom && <span className="cn-fl">From</span>}
      {isFrom ? r.price.replace(/^from\s*/i, "") : r.price}
    </SiteLink>
  );
}

/** Side by side: every option in one table (thumbnails, icon headers, price pills); on phones a list that opens each option's details. */
export function CnCompare({ rows, number }: { rows: ConcernOption[]; number: string }) {
  if (!rows.length) return null;
  return (
    <RevealSection id="compare" aria-labelledby="compare-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
      <TxHead
        number={number}
        tag="Side by side"
        headingId="compare-title"
        lead="Compare"
        strong="the options"
        text="Typical figures from each treatment page. Your plan, timing and final price are confirmed at your free consultation. Individual results may vary."
      />
      <div className={`${TX_WRAP} rv mt-[clamp(28px,3.4vw,44px)] hidden overflow-hidden rounded-[24px] bg-white shadow-[0_30px_60px_-50px_rgba(27,36,43,.4)] ring-1 ring-ndm-ink/[.06] md:block`}>
        <div className="cn-scroll">
          <table className="cn-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="cn-th">Treatment</span>
                </th>
                {COLUMNS.map(([k, label, icon]) => (
                  <th key={k} scope="col">
                    <span className="cn-th">
                      <Icon size={14}>{icon}</Icon>
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>
                    <SiteLink to={contentLink(r.href)} className="cn-name">
                      <Thumb src={r.img} size={42} className="cn-thumb" />
                      <span className="min-w-0">
                        <span className="cn-nm">{r.name}</span>
                        <span className="cn-sub">{r.role}</span>
                      </span>
                    </SiteLink>
                  </td>
                  {COLUMNS.map(([k]) => (
                    <td key={k}>{k === "from" ? <From r={r} /> : r[k] || "At your consultation"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ul role="list" className={`${TX_WRAP} rv mt-[clamp(28px,3.4vw,44px)] grid gap-2.5 md:hidden`}>
        {rows.map((r) => (
          <li key={r.key}>
            <details className="cn-m overflow-hidden rounded-[18px] bg-white ring-1 ring-ndm-ink/[.06]">
              <summary className="flex cursor-pointer items-center gap-3 p-4">
                <Thumb src={r.img} size={44} className="size-11 shrink-0 rounded-[12px] object-cover ring-1 ring-ndm-ink/[.06]" />
                <span className="min-w-0 flex-1">
                  <span className="block font-aeonik text-[16.5px] leading-[1.15] tracking-[-0.01em] text-ndm-ink">{r.name}</span>
                  <From r={r} className="mt-1.5" stop />
                </span>
                <svg aria-hidden="true" className="cn-chev shrink-0 text-ndm-muted transition-transform duration-200" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="border-t border-ndm-line px-4 pt-3 pb-4">
                <p className="font-inter text-[11px] font-semibold tracking-[.1em] text-ndm-deep uppercase">{r.role}</p>
                <dl className="mt-2.5 grid grid-cols-2 gap-2.5">
                  {COLUMNS.map(([k, label, icon]) =>
                    k === "from" ? null : (
                      <div key={k} className="rounded-[13px] bg-ndm-paper p-3 ring-1 ring-ndm-ink/[.05]">
                        <dt className="flex items-center gap-1.5 font-inter text-[10px] font-semibold tracking-[.1em] text-ndm-muted uppercase">
                          <Icon size={13} className="shrink-0 text-ndm-deep">
                            {icon}
                          </Icon>
                          <span className="min-w-0">{label}</span>
                        </dt>
                        <dd className="mt-1.5 font-inter text-[13px] leading-[1.45] text-ndm-ink/85">{r[k] || "At your consultation"}</dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <p className="cn-hint hidden md:flex xl:hidden" aria-hidden="true">
        <IconArrow className="rotate-180 opacity-60" />
        Swipe to see every column
        <IconArrow className="opacity-60" />
      </p>
    </RevealSection>
  );
}
