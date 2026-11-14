"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { withBase } from "@/lib/base-path";

interface SubNavProps {
  /** Accessible name of the bar. */
  label: string;
  items: { key: string; label: ReactNode }[];
  /** The active item. */
  on: string;
  onPick: (key: string, e: MouseEvent) => void;
}

/**
 * The site's one sub-menu: sticky under the header, pill links, the active one in brand blue. It scrolls
 * sideways on phones and keeps the active pill in view.
 */
export function SubNav({ label, items, on, onPick }: SubNavProps) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = box.current;
    const pill = row?.querySelector<HTMLElement>(`[data-k="${on}"]`);
    if (row && pill) row.scrollTo({ left: pill.offsetLeft - row.clientWidth / 2 + pill.offsetWidth / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [on]);
  return (
    <nav aria-label={label} className="tx-nav sticky top-[100px] z-30 bg-ndm-paper/85 backdrop-blur-[10px] xl:top-[120px]">
      <div ref={box} className="no-scrollbar relative overflow-x-auto px-[var(--gx)] py-2.5">
        <ul className="relative mx-auto flex w-max gap-1" role="list">
          {items.map((it) => (
            <li key={it.key} data-k={it.key} className="shrink-0">
              <a
                href={withBase(`#${it.key}`)}
                onClick={(e) => onPick(it.key, e)}
                aria-current={on === it.key ? "true" : undefined}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 font-inter text-[14px] whitespace-nowrap transition-colors ${on === it.key ? "bg-ndm-deep font-medium text-white" : "text-ndm-ink/80 hover:bg-white hover:text-ndm-ink"}`}
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
