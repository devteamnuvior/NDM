"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { GalleryPhoto } from "@/components/about/gallery-photo";
import type { GalleryPhoto as Photo } from "@/config/about";

interface LightboxProps {
  items: Photo[];
  index: number;
  onClose: () => void;
  onStep: (d: number) => void;
  onPick: (i: number) => void;
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The gallery viewer: the bare photo on the dimmed page with small thumbnails underneath. Arrow keys and a
 * swipe change the photo; Escape or a click anywhere off the photo and thumbnails closes it.
 */
export function Lightbox({ items, index, onClose, onStep, onPick }: LightboxProps) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const placed = useRef(false);
  const [on, setOn] = useState(false);

  const close = useCallback(() => {
    setOn(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(onClose, reduced() ? 0 : 420);
  }, [onClose]);

  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setOn(true));
    });
    const t = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 140);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(t);
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onStep, close]);

  /* keep the current thumbnail centred (a jump on open, a glide after) */
  useEffect(() => {
    const el = strip.current;
    const b = el?.children[index] as HTMLElement | undefined;
    if (el && b) el.scrollTo({ left: b.offsetLeft - el.clientWidth / 2 + b.offsetWidth / 2, behavior: reduced() || !placed.current ? "auto" : "smooth" });
    placed.current = true;
  }, [index]);

  const it = items[index];
  const start = (e: TouchEvent) => {
    touch.current = e.touches[0].clientX;
  };
  const end = (e: TouchEvent) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
  };

  return createPortal(
    <div className={`book-pop fixed inset-0 z-[95] ${on ? "is-on" : ""}`}>
      <div className="book-scrim absolute inset-0 bg-[#0B0F13]/55 backdrop-blur-[6px]" onClick={close} />
      <div role="dialog" aria-modal="true" aria-label="Clinic gallery" data-lenis-prevent="" className="gal-view pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-[var(--gx)] py-6 md:gap-5">
        <button ref={closeBtn} type="button" onClick={close} className="sr-only">
          Close gallery
        </button>
        <p className="sr-only" aria-live="polite">
          Photo {index + 1} of {items.length}: {it.title}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- shown at its own size, whatever its shape */}
        <img
          key={it.src}
          src={it.src}
          alt={it.alt}
          onTouchStart={start}
          onTouchEnd={end}
          className="gal-img pointer-events-auto block h-auto max-h-[min(72dvh,760px)] w-auto max-w-full rounded-[14px] object-contain shadow-[0_40px_80px_-30px_rgba(11,15,19,.6)] md:max-w-[min(1100px,100%)] md:rounded-[18px]"
        />
        <div ref={strip} className="no-scrollbar pointer-events-auto relative flex max-w-full gap-2 overflow-x-auto p-1" role="group" aria-label="Choose a photo">
          {items.map((g, k) => (
            <button
              key={g.src}
              type="button"
              onClick={() => onPick(k)}
              aria-label={`Photo ${k + 1}: ${g.title}`}
              aria-current={k === index ? "true" : undefined}
              className={`gal-thumb relative h-11 w-[60px] shrink-0 overflow-hidden rounded-[8px] md:h-14 md:w-20 ${k === index ? "is-on" : ""}`}
            >
              <GalleryPhoto src={g.src} alt="" sizes="80px" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
