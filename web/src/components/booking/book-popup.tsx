"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconClose } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { lockScroll } from "@/lib/scroll-lock";

/* the form's code is fetched the first time the pop-up opens (the home page already has it for its booking section) */
const BookForm = dynamic(() => import("@/components/booking/book-form").then((m) => m.BookForm), { ssr: false });

/**
 * Booking pop-up: any "Book Free Consultation" link (href "#/book") on any page opens the booking form.
 * A centred card on desktop, a bottom sheet on phones; Escape, the dimmed page or the close button shut
 * it, and focus returns to the link that opened it.
 */
export function BookPopup() {
  const [open, setOpen] = useState(false);
  const [run, setRun] = useState(0); /* a fresh form every time the pop-up opens */
  const box = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    const b = opener.current;
    requestAnimationFrame(() => {
      if (b && b.isConnected) b.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.<HTMLElement>(`a[href="${ACTIONS.book}"]`);
      if (!a) return;
      e.preventDefault();
      opener.current = a;
      setRun((x) => x + 1);
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const t = setTimeout(() => box.current?.querySelector("input")?.focus({ preventScroll: true }), 140);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [open, close]);

  return (
    <div className={`book-pop fixed inset-0 z-[95] ${open ? "is-on" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="book-scrim absolute inset-0 bg-[#0B0F13]/55 backdrop-blur-[6px]" onClick={close} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center sm:inset-0 sm:items-center sm:p-6">
        <div
          ref={box}
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-pop-title"
          data-lenis-prevent=""
          className="book-card pointer-events-auto relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[24px] bg-white px-[clamp(20px,2.4vw,32px)] pt-6 pb-[max(22px,env(safe-area-inset-bottom))] shadow-[0_40px_80px_-30px_rgba(11,15,19,.6)] sm:max-w-[680px] sm:rounded-[20px] sm:pt-[clamp(20px,2.4vw,32px)]"
        >
          <span aria-hidden="true" className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ndm-ink/15 sm:hidden" />
          {/* above the tag line, which on a phone is wide enough to lie over this button (in the prototype it swallowed the tap) */}
          <button type="button" onClick={close} aria-label="Close booking form" className="absolute top-3 right-3 z-[1] grid size-10 place-items-center rounded-full text-ndm-ink transition-colors hover:bg-ndm-mist sm:top-4 sm:right-4">
            <IconClose />
          </button>
          <Eyebrow amber>Book now at our two Toronto locations</Eyebrow>
          <TwoTone
            id="book-pop-title"
            className="mt-4 pr-8"
            size="text-[clamp(26px,2.6vw,36px)]"
            lead={
              <>
                Book a free consultation
                <br />
              </>
            }
            strong="in a few short steps"
          />
          <div className="mt-6 flex">{run > 0 && <BookForm key={run} thanksId="book-pop-title" />}</div>
        </div>
      </div>
    </div>
  );
}
