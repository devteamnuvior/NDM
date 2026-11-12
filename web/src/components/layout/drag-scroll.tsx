"use client";

import { useEffect } from "react";

/**
 * Mouse users can grab and drag any sideways-scrolling row on the site (card rows, tabs). Compare
 * sliders, form fields and the offers wheel's buttons keep their own behaviour. Renders nothing.
 */
export function DragScroll() {
  useEffect(() => {
    let el: HTMLElement | null = null;
    let x0 = 0;
    let s0 = 0;
    let moved = false;
    const scroller = (target: EventTarget | null): HTMLElement | null => {
      for (let n = target as HTMLElement | null; n && n !== document.body; n = n.parentElement) {
        if (n.matches?.(".ba-box,input,textarea,select,button.sw-ctrl,[data-no-drag]")) return null;
        const cs = getComputedStyle(n);
        if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && n.scrollWidth > n.clientWidth + 4) return n;
      }
      return null;
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      el = scroller(e.target);
      if (!el) return;
      x0 = e.clientX;
      s0 = el.scrollLeft;
      moved = false;
    };
    const move = (e: PointerEvent) => {
      if (!el) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.classList.add("is-grab");
      }
      if (moved) el.scrollLeft = s0 - dx;
    };
    const up = () => {
      if (!el) return;
      const t = el;
      el = null;
      t.classList.remove("is-grab");
      if (moved) {
        /* the click that ends a drag must not follow a link in the row */
        const stop = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        t.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => t.removeEventListener("click", stop, true), 60);
      }
    };
    const dragStart = (e: DragEvent) => {
      if ((e.target as Element | null)?.closest?.(".overflow-x-auto")) e.preventDefault();
    };
    document.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    document.addEventListener("dragstart", dragStart);
    return () => {
      document.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("dragstart", dragStart);
    };
  }, []);
  return null;
}
