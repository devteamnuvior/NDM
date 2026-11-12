"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { IconClose, IconSearch } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { POPULAR_SEARCHES, SEARCH_ENTRIES } from "@/config/navigation";
import { ACTIONS } from "@/config/routes";
import { useDeferredOpen } from "@/hooks/use-deferred-open";
import { resolveLabel } from "@/lib/routes";

export interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Search over the treatments and concerns in the menu: a sheet that drops from the top of the window. */
export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const shown = useDeferredOpen(open);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setQ("");
      input.current?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const v = q.trim().toLowerCase();
  const hits = v ? SEARCH_ENTRIES.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(v)).slice(0, 8) : [];

  return (
    <div
      className={`fixed inset-0 z-[80] overflow-hidden ${shown ? "" : "pointer-events-none"}`}
      style={{ visibility: shown ? "visible" : "hidden", transition: `visibility 0s linear ${shown ? "0s" : ".5s"}` }}
      aria-hidden={!shown}
    >
      <div onClick={onClose} className={`absolute inset-0 bg-[#0B0F13]/45 backdrop-blur-[3px] transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search treatments"
        className="absolute inset-x-0 top-0 rounded-b-[28px] bg-white px-[var(--pad)] pt-6 pb-10 shadow-2xl transition-transform duration-500"
        style={{ transform: shown ? "none" : "translateY(-100%)", transitionTimingFunction: "var(--e-out)" }}
      >
        <div className="mx-auto max-w-[980px]">
          <div className="flex items-center gap-4 border-b border-ndm-line pb-4">
            <IconSearch className="shrink-0 text-ndm-muted" />
            <label htmlFor="site-search" className="sr-only">
              Search treatments and concerns
            </label>
            <input
              id="site-search"
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search treatments, e.g. acne scars"
              className="w-full bg-transparent font-aeonik text-[22px] text-ndm-ink outline-hidden placeholder:text-ndm-ink/35 sm:text-[30px]"
            />
            <button type="button" onClick={onClose} aria-label="Close search" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-ndm-mist">
              <IconClose />
            </button>
          </div>
          {!v && (
            <div className="mt-6">
              <p className="font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">Popular</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((p) => (
                  <button key={p} type="button" onClick={() => setQ(p.replace(/[®™]/g, ""))} className="rounded-full border border-ndm-line px-4 py-2 font-mont text-[13px] transition-colors hover:border-ndm-blue hover:text-ndm-blue">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {v && (
            <ul className="mt-4 divide-y divide-ndm-line" role="list">
              {hits.length === 0 && (
                <li className="py-4 text-[15px] text-ndm-muted">
                  No match yet,{" "}
                  <a href={ACTIONS.book} className="text-ndm-blue underline underline-offset-4">
                    book a free consultation
                  </a>{" "}
                  and we’ll guide you.
                </li>
              )}
              {hits.map((h) => (
                <li key={`${h.category}:${h.name}`}>
                  <SiteLink to={resolveLabel(h.name)} onClick={onClose} className="group flex items-center justify-between py-3.5">
                    <span className="font-mont text-[15px] group-hover:text-ndm-blue">{h.name}</span>
                    <span className="font-mont text-[12px] text-ndm-muted">{h.category}</span>
                  </SiteLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
