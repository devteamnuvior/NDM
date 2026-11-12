"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import reception from "@/assets/images/hero/clinic-reception.jpg";
import { Button } from "@/components/ui/button";
import { NO_OFFER_PAGES } from "@/config/navigation";
import { pageFromPathname, pagePath } from "@/lib/routes";

/** Records when the pop-up was last closed. */
const CLOSED_KEY = "ndm-offer-closed";
/** Add ?offer to the address to preview the pop-up at any time. */
const forced = () => /[?&]offer\b/.test(window.location.search);
const delayVar = (d: string) => ({ "--d": d }) as CSSProperties;

/**
 * First-time patient offer. It shows once on each page per visit, after real engagement: nine seconds on
 * the page, 45% scroll depth, or the pointer leaving through the top of the window on desktop, whichever
 * comes first. Never shown to automated browsers (search engines, tests), except with ?offer.
 */
export function OfferPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cta = useRef<HTMLElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const fired = useRef(false);
  const stop = useRef<() => void>(() => {});

  const show = useCallback((key: string) => {
    if (fired.current) return;
    fired.current = true;
    stop.current();
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked: it may show again on another page */
    }
    lastFocus.current = document.activeElement;
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }, []);

  useEffect(() => {
    const force = forced();
    /* the same per-page key the original pages use ("ndm-offer-index.html" for the home page) */
    const key = `ndm-offer-${pathname.split("/").pop() || "index.html"}`;
    let seen = false;
    try {
      seen = sessionStorage.getItem(key) === "1";
    } catch {
      /* storage blocked */
    }
    /* the legal pages never show the offer (as in the prototype), not even as a preview */
    const page = pageFromPathname(pathname);
    if (page && NO_OFFER_PAGES.includes(page)) return;
    if (!force && (fired.current || seen || navigator.webdriver)) return;
    const fire = () => show(key);
    const t = setTimeout(fire, force ? 1500 : 9000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.45) fire();
    };
    const armed = Date.now() + 6000;
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0 && Date.now() > armed) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    stop.current = () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
    return () => stop.current();
  }, [pathname, show]);

  const close = useCallback(() => {
    try {
      localStorage.setItem(CLOSED_KEY, String(Date.now()));
    } catch {
      /* storage blocked */
    }
    setOpen(false);
    setTimeout(() => {
      setMounted(false);
      (lastFocus.current as HTMLElement | null)?.focus?.();
    }, 450);
  }, []);

  useEffect(() => {
    if (!open) return;
    cta.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!mounted) return null;
  return (
    <div className={`offer-pop-root fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6 ${open ? "is-open" : ""}`}>
      <div aria-hidden="true" onClick={close} className="offer-scrim absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-title"
        aria-describedby="offer-desc"
        className="offer-card relative grid w-full max-w-[760px] overflow-hidden rounded-t-[24px] bg-ndm-paper shadow-[0_40px_90px_-30px_rgba(11,15,19,.55)] sm:grid-cols-[.9fr_1.1fr] sm:rounded-[24px]"
      >
        <figure className="relative m-0 hidden min-h-[340px] sm:block">
          <Image src={reception} alt="" fill sizes="340px" className="offer-pic object-cover" />
          <span className="absolute inset-0 bg-linear-to-t/srgb from-black/45 via-black/0 to-black/10" />
          <div className="absolute top-5 left-5 grid size-[112px] place-items-center">
            <svg viewBox="0 0 120 120" className="offer-badge absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <path id="offer-ring" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="rgba(255,255,255,.94)" />
              <text fontFamily="Montserrat, sans-serif" fontSize="9.5" fontWeight="600" fill="#1B242B" letterSpacing="1">
                <textPath href="#offer-ring" textLength="280" lengthAdjust="spacing">
                  NEW CLIENT OFFER • NEW CLIENT OFFER •
                </textPath>
              </text>
            </svg>
            <span className="relative font-aeonik text-[26px] leading-none tracking-[-0.04em] text-ndm-deep">10%</span>
          </div>
        </figure>
        <div className="relative p-6 pb-7 sm:p-8">
          <button type="button" onClick={close} aria-label="Close offer" className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-ndm-muted transition hover:bg-ndm-ink/5 hover:text-ndm-ink">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span aria-hidden="true" className="mx-auto mb-4 block h-1 w-10 rounded-full bg-ndm-ink/15 sm:hidden" />
          <p className="offer-in inline-flex items-center gap-2 rounded-full bg-ndm-amber/[.14] px-3 py-1.5 font-mont text-[11px] tracking-[.14em] text-[#9A5F00] uppercase" style={delayVar(".15s")}>
            <i className="promo-ping relative size-1.5 rounded-full bg-ndm-amber" />
            New to NewDermaMed?
          </p>
          <h2 id="offer-title" className="offer-in mt-4 font-aeonik text-[clamp(32px,4vw,44px)] leading-[1.02] font-normal tracking-[-0.035em] text-ndm-ink" style={delayVar(".22s")}>
            Enjoy <span className="text-ndm-deep">10% off</span>
            <br />
            your first treatment
          </h2>
          <p id="offer-desc" className="offer-in mt-3 max-w-[34ch] font-inter text-[15px] leading-[1.55] text-ndm-muted" style={delayVar(".3s")}>
            A welcome offer for first-time patients, on your first cosmetic treatment at either Toronto clinic.
          </p>
          <div className="offer-in mt-6 flex flex-col gap-2.5" style={delayVar(".38s")}>
            <Button ref={cta} href={pagePath("promotion")} onClick={close} v="ink" block>
              Claim my 10% off
            </Button>
            <button type="button" onClick={close} className="h-10 rounded-full font-inter text-[14px] text-ndm-muted transition hover:text-ndm-ink">
              No thanks, maybe later
            </button>
          </div>
          <p className="offer-in mt-3 font-inter text-[11.5px] leading-[1.45] text-ndm-muted/80" style={delayVar(".44s")}>
            Redeemable at all NewDermaMed Toronto locations.
          </p>
        </div>
      </div>
    </div>
  );
}
