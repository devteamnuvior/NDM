"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { IconSearch } from "@/components/ui/icons";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { overControl } from "@/lib/over-control";

export interface FloatSearchProps {
  onOpen: () => void;
  hidden: boolean;
  /** Extra space to keep below the button, in px. */
  lift?: number;
}

/**
 * Phones: search floats at the bottom right (the header has no room for it) and steps up above any
 * button already sitting there (elements marked `data-float-avoid`, or `lift` from the page). While it lies
 * over a button or short link of the page it fades out, so it never blocks one; it is back once it is clear.
 */
export function FloatSearch({ onOpen, hidden, lift = 0 }: FloatSearchProps) {
  const [avoid, setAvoid] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const [covers, setCovers] = useState(false);

  const measure = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    let top = vh;
    document.querySelectorAll("[data-float-avoid]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.top < vh && r.bottom > vh - 120 && r.right > vw - 90) top = Math.min(top, r.top);
    });
    setAvoid(top < vh ? vh - top + 12 : 0);
    setCovers(vw < 768 && overControl(btn.current, 9, 9));
  };
  useOnScroll(measure);
  /* also twice a second: the page under the button can change without a scroll (a slider turning, a panel opening) */
  const remeasure = useEffectEvent(measure);
  useEffect(() => {
    const t = setInterval(remeasure, 500);
    return () => clearInterval(t);
  }, []);

  const bottom = Math.max(16, avoid, lift);
  const off = hidden || covers;
  return (
    <button
      ref={btn}
      type="button"
      onClick={onOpen}
      tabIndex={off ? -1 : 0}
      aria-hidden={off}
      aria-label="Search treatments"
      className={`float-search fixed right-4 z-[55] grid size-[52px] place-items-center rounded-full bg-ndm-deep text-white shadow-[0_18px_40px_-16px_rgba(11,15,19,.6)] ring-1 ring-white/10 md:hidden ${off ? "is-off" : ""}`}
      style={{ bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}
    >
      <IconSearch size={22} />
    </button>
  );
}
