"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { ACTIONS } from "@/config/routes";
import type { StartConcern, StartPanel } from "@/config/home-start";
import { useMedia } from "@/hooks/use-media";

const IconPlus = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

/* "From $200" -> a small "From" label above the amount; anything else is shown as a plain note */
const priceParts = (p: string): [label: string | null, value: string] => (/^From /.test(p) ? ["From", p.slice(5)] : [null, p]);

interface Fit {
  /** Height for the whole row (wide screens), when an options card needs more room than the row has. */
  row: number | null;
  /** Height for the open panel (phones), so the options card fits inside it. */
  panel: number | null;
}

/** The options card that opens over a panel's photo when a concern is picked. */
function ConcernSheet({ concern, panelTitle, onBack, sheetRef }: { concern: StartConcern; panelTitle: string; onBack: () => void; sheetRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={sheetRef} id={concern.id} role="region" aria-labelledby={`${concern.id}-h`} className="st-o">
      <button
        type="button"
        onClick={onBack}
        aria-label={`Back to ${panelTitle.toLowerCase()} concerns`}
        className="-ml-2 inline-flex min-h-[34px] items-center gap-1.5 rounded-full pr-3 pl-2 font-inter text-[13.5px] font-semibold text-ndm-ink transition-colors hover:bg-ndm-mist"
      >
        <IconArrow className="rotate-180" />
        {panelTitle}
      </button>
      <h4 id={`${concern.id}-h`} tabIndex={-1} className="mt-1.5 font-aeonik text-[clamp(26px,2.2vw,32px)] leading-[1.08] font-normal tracking-[-0.02em] text-ndm-ink">
        {concern.title}
      </h4>
      <p className="mt-2 max-w-[60ch] font-inter text-[14.5px] leading-[1.5] text-ndm-muted">{concern.lede}</p>
      <p className="mt-4 font-inter text-[11.5px] font-semibold tracking-[.09em] text-ndm-soft uppercase">Options that may help</p>
      <ul className="st-o-list mt-1.5" role="list">
        {concern.options.map((o) => {
          const [label, value] = priceParts(o.price);
          return (
            <li key={o.name}>
              <a href={o.href} className="flex items-center gap-4 py-[11px] pr-0.5 pl-0.5 text-ndm-ink">
                <span className="grid min-w-0 flex-1 gap-[3px]">
                  <b className="font-inter text-[15px] leading-[1.3] font-semibold transition-colors">{o.name}</b>
                  <small className="font-inter text-[13px] leading-[1.4] text-ndm-muted">{o.what}</small>
                </span>
                <span className="grid shrink-0 gap-[3px] text-right font-inter text-[11.5px] leading-[1.2] text-ndm-soft">
                  {label}
                  <b className={`font-semibold text-ndm-ink tabular-nums ${label ? "text-[15px]" : "text-[13px] font-medium text-ndm-muted"}`}>{value}</b>
                </span>
                <IconArrow className="shrink-0 text-ndm-deep" />
              </a>
            </li>
          );
        })}
      </ul>
      {concern.facts.length > 0 && (
        <dl className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          {concern.facts.map((f) => (
            <div key={f.term} className="rounded-[14px] bg-ndm-mist px-3.5 py-3">
              <dt className="font-inter text-[11px] font-semibold tracking-[.08em] text-ndm-soft uppercase">{f.term}</dt>
              <dd className="mt-1.5 font-inter text-[13.5px] leading-[1.4] text-ndm-ink">{f.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {concern.note && <p className="mt-2.5 font-inter text-[12.5px] leading-[1.45] text-ndm-muted">{concern.note}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <Button href={ACTIONS.book} v="book" hot>
          Book Free Consultation
        </Button>
        {concern.more.label && (
          <a href={concern.more.href} className="inline-flex items-center gap-2 font-inter text-[14px] font-semibold text-ndm-deep hover:underline">
            {concern.more.label} <IconArrow />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * The row of expanding photo panels. Hovering (with a mouse) or tapping a panel opens it; picking a
 * concern opens its options in place over the photo. Escape, or the back button, returns to the concerns.
 */
export function StartPanels({ panels }: { panels: StartPanel[] }) {
  const row = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const lastChip = useRef<HTMLElement | null>(null);
  const fine = useMedia("(pointer: fine)");
  const narrow = useMedia("(max-width: 899px)");
  const [open, setOpen] = useState(0);
  const [sheet, setSheet] = useState<string | null>(null);
  const [fit, setFit] = useState<Fit>({ row: null, panel: null });
  const [resized, setResized] = useState(0);
  const concern = sheet ? panels[open].concerns.find((c) => c.id === sheet) : undefined;

  /* make room for an open options card: the open panel grows on phones, the panel row on wider screens */
  useLayoutEffect(() => {
    const o = sheetRef.current;
    let next: Fit = { row: null, panel: null };
    if (concern && o) {
      if (narrow) {
        next = { row: null, panel: o.offsetTop + o.offsetHeight + 8 };
      } else {
        const base = Math.min(620, Math.max(520, window.innerWidth * 0.42));
        const need = o.scrollHeight + 12 + 56;
        next = { row: need > base ? need : null, panel: null };
      }
    }
    /* the card has to be measured in the page before its room can be set */
    setFit((f) => (f.row === next.row && f.panel === next.panel ? f : next));
  }, [concern, narrow, resized]);

  useEffect(() => {
    const on = () => setResized((t) => t + 1);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  /* when a card opens: move focus to its title, and on phones bring the panel back under the header */
  useEffect(() => {
    const o = sheetRef.current;
    if (!sheet || !o) return;
    o.querySelector("h4")?.focus({ preventScroll: true });
    const panel = o.parentElement;
    if (window.matchMedia("(max-width: 899px)").matches && panel && panel.getBoundingClientRect().top < 80) {
      panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }, [sheet]);

  const close = (refocus: boolean) => {
    setSheet(null);
    if (refocus && lastChip.current) setTimeout(() => lastChip.current?.focus({ preventScroll: true }), 40);
  };

  /* Escape anywhere in the section closes the open card */
  useEffect(() => {
    const section = row.current?.closest("section");
    if (!section || !sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheet(null);
        setTimeout(() => lastChip.current?.focus({ preventScroll: true }), 40);
      }
    };
    section.addEventListener("keydown", onKey);
    return () => section.removeEventListener("keydown", onKey);
  }, [sheet]);

  const openPanel = (i: number) => {
    if (i === open) return;
    setSheet(null);
    setOpen(i);
  };
  const pickConcern = (e: MouseEvent<HTMLAnchorElement>, c: StartConcern) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; /* a new tab still works */
    e.preventDefault();
    lastChip.current = e.currentTarget;
    setSheet(c.id);
  };

  return (
    <div ref={row} className="rv st" style={{ height: !narrow && fit.row ? fit.row : undefined, transitionDelay: ".12s" }}>
      {panels.map((p, i) => {
        const on = i === open;
        const shown = on ? concern : undefined;
        const style = { "--pos": p.image.position, "--pos-o": p.image.positionOpen, height: on && narrow && fit.panel ? fit.panel : undefined } as CSSProperties;
        return (
          <div
            key={p.id}
            className={`st-p ${on ? "is-open" : ""} ${shown ? "is-sheet" : ""}`}
            style={style}
            onMouseEnter={() => {
              if (fine && !sheet) openPanel(i);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- hand-made WebP sizes, used as they are */}
            <img src={p.image.src} srcSet={p.image.srcSet} sizes="(max-width: 899px) 100vw, 52vw" alt="" loading="lazy" decoding="async" />
            <button type="button" className="st-h" aria-expanded={on} aria-controls={`stc-${p.id}`} onClick={() => openPanel(i)} tabIndex={on ? -1 : 0}>
              <span className="st-plus" aria-hidden="true">
                <IconPlus />
              </span>
              <span className="st-t font-aeonik">
                {p.title}
                <small className="font-inter">{p.sub}</small>
              </span>
            </button>
            <div id={`stc-${p.id}`} className="st-c" inert={!on || !!shown}>
              <h3 className="font-aeonik text-[clamp(32px,2.8vw,42px)] leading-[1.08] font-normal tracking-[-0.02em] text-white">{p.heading}</h3>
              <p className="mt-2 max-w-[46ch] font-inter text-[15.5px] leading-[1.5] text-white/85">{p.text}</p>
              {p.concerns.length ? (
                <ul className="st-chips mt-[18px] flex flex-wrap gap-2 font-inter" role="list">
                  {p.concerns.map((c) => (
                    <li key={c.id}>
                      <a href={c.more.href} onClick={(e) => pickConcern(e, c)} aria-controls={c.id} aria-expanded={sheet === c.id}>
                        {c.label}
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button href={ACTIONS.book} v="book" hot>
                    Book Free Consultation
                  </Button>
                  <a href={p.analysisHref} className="inline-flex items-center gap-2 font-inter text-[14.5px] font-medium text-white hover:underline">
                    {p.analysisLabel || "About the skin analysis"} <IconArrow />
                  </a>
                </div>
              )}
            </div>
            {shown && <ConcernSheet concern={shown} panelTitle={p.title} onBack={() => close(true)} sheetRef={sheetRef} />}
          </div>
        );
      })}
    </div>
  );
}
