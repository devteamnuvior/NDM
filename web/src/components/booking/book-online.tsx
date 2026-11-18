"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/ui/icons";
import { BOOK_ONLINE_URL } from "@/config/booking";
import { getSmoothScroll } from "@/lib/smooth-scroll";

/**
 * The clinic's online booking calendar (AestheticsPro, the frame of the earlier site's "online booking"
 * page) in a panel over the page: a sheet on phones, a 1000px card on desktop. Every booking form opens
 * it from "Book a time now". The frame is only loaded the first time the panel opens and then stays, so
 * closing and opening again keeps what was already chosen. It is drawn at the end of <body>, because the
 * forms sit inside cards that move (a moved card would hold a fixed panel inside itself).
 */
export function BookOnline({ open, onClose }: { open: boolean; onClose: () => void }) {
  const title = useId();
  const close = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(false);
  if (open && !seen) setSeen(true);

  useEffect(() => {
    if (!open) return;
    /* the page may already be held still by the booking pop-up this panel was opened from: then leave it to the pop-up */
    const root = document.documentElement;
    const held = root.style.overflow === "hidden";
    if (!held) {
      const gap = window.innerWidth - root.clientWidth;
      getSmoothScroll()?.stop();
      root.style.overflow = "hidden";
      root.style.paddingRight = gap > 0 ? `${gap}px` : "";
    }
    const before = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => close.current?.focus({ preventScroll: true }), 60);
    /* first in line, so Escape closes this panel only and not the pop-up under it */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
      if (!held) {
        getSmoothScroll()?.start();
        root.style.overflow = "";
        root.style.paddingRight = "";
      }
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!seen) return null;
  return createPortal(
    <div className={`fixed inset-0 z-[97] ${open ? "" : "hidden"}`} aria-hidden={!open} inert={!open}>
      <div className="absolute inset-0 bg-[#0B0F13]/60 backdrop-blur-[6px]" onClick={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title}
          data-lenis-prevent=""
          className="pointer-events-auto flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_40px_80px_-30px_rgba(11,15,19,.6)] sm:h-[min(84vh,900px)] sm:max-w-[1000px] sm:rounded-[20px]"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ndm-ink/10 py-2.5 pr-3 pl-5">
            <p className="min-w-0">
              <span id={title} className="block font-aeonik text-[19px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">
                Choose your time
              </span>
              <span className="block font-inter text-[12.5px] leading-[1.4] text-ndm-muted">Free consultation. Pick your clinic, day and time.</span>
            </p>
            <button ref={close} type="button" onClick={onClose} aria-label="Close booking calendar" className="grid size-10 shrink-0 place-items-center rounded-full text-ndm-ink transition-colors hover:bg-ndm-mist">
              <IconClose />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <p aria-hidden="true" className="absolute inset-x-0 top-[38%] text-center font-inter text-[13.5px] text-ndm-muted">
              Loading the booking calendar
            </p>
            <iframe src={BOOK_ONLINE_URL} title="NewDermaMed online booking calendar" allowFullScreen className="relative block size-full border-0" />
          </div>
          <p className="shrink-0 border-t border-ndm-ink/10 px-5 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] text-center font-inter text-[12px] text-ndm-muted">
            Calendar not loading?{" "}
            <a href={BOOK_ONLINE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ndm-deep hover:underline">
              Open it in a new tab
            </a>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
