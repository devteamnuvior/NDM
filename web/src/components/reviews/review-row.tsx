"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { REVIEW_COPIES } from "@/config/reviews";


interface ReviewRowProps {
  /** The cards, already repeated REVIEW_COPIES times. */
  children: ReactNode;
  /** 1 drifts left, -1 right. */
  dir?: 1 | -1;
  /** Seconds for one full pass of the cards. */
  dur?: number;
  /** A second, decorative row: hidden from assistive tech. */
  hidden?: boolean;
}

/**
 * One testimonials row: it drifts on its own and loops for ever; it can be dragged with a mouse or finger
 * and pushed sideways with a trackpad swipe, then carries on drifting. Still with reduced motion.
 */
export function ReviewRow({ children, dir = 1, dur = 28, hidden }: ReviewRowProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const el = track.current;
    if (!w || !el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    let last = 0;
    let raf = 0;
    let period = 0;
    let drag: { x0: number; s: number; moved: boolean } | null = null;
    let on = true;
    let idle = 0;
    const measure = () => {
      period = el.scrollWidth / REVIEW_COPIES;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
    });
    io.observe(w);
    const tick = (t: number) => {
      const dt = last ? Math.min(64, t - last) : 0;
      last = t;
      if (on && !drag && !reduced && period && t > idle) x += dir * (period / (dur * 1000)) * dt;
      if (period) x = ((x % period) + period) % period;
      el.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    /* trackpad: a mostly sideways swipe moves the row; vertical scrolling still scrolls the page */
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation(); /* keep the smooth-scroll library from also acting on it */
      x += e.deltaX;
      idle = performance.now() + 900;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag = { x0: e.clientX, s: x, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        w.classList.add("is-dragging");
      }
      if (drag.moved) x = drag.s - dx;
    };
    const up = () => {
      if (!drag) return;
      if (drag.moved) {
        /* the click that ends a drag must not follow a link in a card */
        const stop = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        w.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => w.removeEventListener("click", stop, true), 60);
      }
      drag = null;
      idle = performance.now() + 600;
      w.classList.remove("is-dragging");
    };
    w.addEventListener("wheel", wheel, { passive: false });
    w.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      w.removeEventListener("wheel", wheel);
      w.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dir, dur]);

  return (
    <div ref={wrap} className="promo-rev-row overflow-hidden" onDragStart={(e) => e.preventDefault()}>
      {/* the right padding equals the gap, so one copy plus its gap is exactly a third of the track and the loop has no jump */}
      <ul ref={track} role="list" aria-hidden={hidden} className="flex w-max items-stretch gap-4 pr-4 will-change-transform">
        {children}
      </ul>
    </div>
  );
}
