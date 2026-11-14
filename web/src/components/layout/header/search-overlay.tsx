"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { IconClose, IconSearch } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { POPULAR_SEARCHES } from "@/config/navigation";
import { ACTIONS } from "@/config/routes";
import { useDeferredOpen } from "@/hooks/use-deferred-open";
import { jumpToPriceGroup, PRICE_GROUP_HASH } from "@/lib/price-jump";
import { pageFromPathname } from "@/lib/routes";
import { menuHits, mergeHits, searchKey } from "@/lib/search-match";
import type { ResolvedLink } from "@/types/navigation";
import type { PopularAnswer, SearchAnswer, SearchHit } from "@/types/search";
import { withBase, withoutBase } from "@/lib/base-path";

/** How long after the last key the price list is asked. */
const ASK_DELAY_MS = 160;
/** A search left standing this long on one clear result counts as a search for it. */
const SETTLE_MS = 2000;

const linkOf = (hit: SearchHit): ResolvedLink => (hit.href.startsWith("/") ? { href: hit.href, page: pageFromPathname(hit.href.split("#")[0]) } : { href: hit.href });

export interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Site search: a sheet that drops from the top of the window. It finds the menu's treatments and
 * concerns at once, and the price list in WooCommerce a moment later (GET /api/search). The Popular
 * chips come from the searches WordPress has counted (GET /api/search/popular); choosing a result
 * counts one (POST /api/search/log).
 */
export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const shown = useDeferredOpen(open);
  const [q, setQ] = useState("");
  const [popular, setPopular] = useState<string[]>(POPULAR_SEARCHES);
  /* the price list's answer, and the search it answers */
  const [remote, setRemote] = useState<{ q: string; hits: SearchHit[] } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  /* typed by hand (a Popular chip is not a new search by itself) */
  const typed = useRef(false);
  const counted = useRef(new Set<string>());
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

  /* the Popular chips, fresh each time the sheet opens; the built-in list stays when the server cannot answer */
  useEffect(() => {
    if (!open) return;
    const stop = new AbortController();
    fetch(withBase("/api/search/popular"), { signal: stop.signal })
      .then((r) => (r.ok ? (r.json() as Promise<PopularAnswer>) : null))
      .then((a) => {
        if (a && Array.isArray(a.terms) && a.terms.length) setPopular(a.terms.filter((t) => typeof t === "string"));
      })
      .catch(() => {});
    return () => stop.abort();
  }, [open]);

  const v = q.trim().toLowerCase();
  const key = searchKey(v);

  useEffect(() => {
    if (key.length < 2) return;
    const stop = new AbortController();
    const t = setTimeout(() => {
      fetch(withBase(`/api/search?q=${encodeURIComponent(key)}`), { signal: stop.signal })
        .then((r) => (r.ok ? (r.json() as Promise<SearchAnswer>) : { hits: [] }))
        .then((a) => setRemote({ q: key, hits: Array.isArray(a.hits) ? a.hits : [] }))
        .catch(() => {
          if (!stop.signal.aborted) setRemote({ q: key, hits: [] });
        });
    }, ASK_DELAY_MS);
    return () => {
      clearTimeout(t);
      stop.abort();
    };
  }, [key]);

  /* while the answer for these exact letters is on its way, the last answer narrowed to them stands in */
  const answered = key.length < 2 || remote?.q === key;
  const fromPrices = remote && key.length >= 2 ? remote.hits.filter((h) => searchKey(h.name).includes(key)) : [];
  const hits = v ? mergeHits(menuHits(v), fromPrices) : [];

  const count = (picked: string) => {
    const id = `${key}|${picked}`;
    if (key.length < 2 || counted.current.has(id)) return;
    counted.current.add(id);
    fetch(withBase("/api/search/log"), { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: key, picked }) }).catch(() => {});
  };
  const countSettled = useEffectEvent(() => {
    if (!typed.current || !answered) return;
    const clear = hits.length === 1 ? hits[0] : hits.find((h) => searchKey(h.name) === key);
    if (clear) count(clear.name);
  });
  useEffect(() => {
    if (!open || key.length < 2 || !answered) return;
    const t = setTimeout(countSettled, SETTLE_MS);
    return () => clearTimeout(t);
  }, [open, key, answered]);

  const choose = (hit: SearchHit) => {
    count(hit.name);
    onClose();
    /* a price category on the page that is already open: the link alone would not unfold it */
    const hash = hit.href.slice(hit.href.indexOf("#"));
    if (hit.href.includes("#") && PRICE_GROUP_HASH.test(hash) && withoutBase(window.location.pathname) === hit.href.split("#")[0]) {
      setTimeout(() => jumpToPriceGroup(hash.slice(1)), 350);
    }
  };

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
              onChange={(e) => {
                typed.current = true;
                setQ(e.target.value);
              }}
              maxLength={60}
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
                {popular.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      typed.current = false;
                      setQ(p.replace(/[®™]/g, ""));
                    }}
                    className="rounded-full border border-ndm-line px-4 py-2 font-mont text-[13px] transition-colors hover:border-ndm-blue hover:text-ndm-blue"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {v && (
            <ul className="mt-4 divide-y divide-ndm-line" role="list">
              {hits.length === 0 && answered && (
                <li className="py-4 text-[15px] text-ndm-muted">
                  No match yet,{" "}
                  <a href={withBase(ACTIONS.book)} className="text-ndm-blue underline underline-offset-4">
                    book a free consultation
                  </a>{" "}
                  and we’ll guide you.
                </li>
              )}
              {hits.map((h) => (
                <li key={`${h.category}:${h.name}`}>
                  <SiteLink to={linkOf(h)} onClick={() => choose(h)} className="group flex items-center justify-between py-3.5">
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
