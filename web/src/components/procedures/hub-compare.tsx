"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { IconArrow } from "@/components/ui/icons";
import type { HubView } from "@/lib/procedures-hub";

/**
 * Treatments side by side: one tab per comparison. Every table stays in the page (the hidden ones carry
 * `hidden`), so all of them are readable without scripts and by search engines.
 */
export function HubCompare({ compare }: Pick<HubView, "compare">) {
  const [on, setOn] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const key = (e: KeyboardEvent, i: number) => {
    const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!k) return;
    e.preventDefault();
    const n = (i + k + compare.length) % compare.length;
    setOn(n);
    tabs.current[n]?.focus();
  };
  if (!compare.length) return null;
  return (
    <div className="rv mt-8" style={{ transitionDelay: ".1s" }}>
      <div role="tablist" aria-label="Comparisons" className="no-scrollbar flex gap-1 overflow-x-auto">
        {compare.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`cmp-t-${c.id}`}
            aria-selected={on === i}
            aria-controls={`cmp-${c.id}`}
            tabIndex={on === i ? 0 : -1}
            onClick={() => setOn(i)}
            onKeyDown={(e) => key(e, i)}
            className={`shrink-0 rounded-full px-4 py-2.5 font-inter text-[14px] whitespace-nowrap transition-colors ${on === i ? "bg-ndm-ink text-white" : "bg-white text-ndm-ink/80 ring-1 ring-ndm-ink/[.08] hover:text-ndm-ink"}`}
          >
            {c.title}
          </button>
        ))}
      </div>
      {compare.map((c, i) => (
        <div key={c.id} id={`cmp-${c.id}`} role="tabpanel" aria-labelledby={`cmp-t-${c.id}`} hidden={on !== i} className="mt-5">
          <p className="font-inter text-[15px] text-ndm-muted">{c.question}</p>
          <div className="no-scrollbar mt-4 overflow-x-auto rounded-[22px] bg-white ring-1 ring-ndm-ink/[.06]">
            <table className="w-full min-w-[720px] table-fixed border-collapse font-inter text-[14.5px]">
              <caption className="sr-only">{`${c.title}: ${c.cols.map((x) => x.title).join(", ")}`}</caption>
              <thead>
                <tr>
                  <td className="w-[160px]" />
                  {c.cols.map((col) => (
                    <th key={col.path} scope="col" className="px-5 pt-6 pb-4 text-left align-bottom font-aeonik text-[19px] font-normal tracking-[-0.01em] text-ndm-ink">
                      <Link href={col.path} className="group inline-flex items-center gap-1.5 hover:text-ndm-deep">
                        {col.title}
                        <IconArrow size={12} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.rows.map(([label, vals]) => (
                  <tr key={label} className="border-t border-ndm-ink/[.07]">
                    <th scope="row" className="px-5 py-4 text-left align-top text-[13px] font-semibold text-ndm-muted">
                      {label}
                    </th>
                    {vals.map((v, k) => (
                      <td key={k} className="px-5 py-4 align-top leading-[1.55] text-ndm-ink">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="mt-4 max-w-[80ch] font-inter text-[13px] leading-[1.55] text-ndm-muted">
        General information, not medical advice. Sessions, recovery and results vary from person to person; which option suits you is decided with a qualified provider at your consultation.
      </p>
    </div>
  );
}
