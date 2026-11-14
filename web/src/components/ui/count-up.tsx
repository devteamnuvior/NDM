"use client";

import { useLayoutEffect, useRef } from "react";
import { easeOut } from "@/lib/math";

interface CountUpProps {
  to: number;
  /** Text before the number, inside the same element ("Up to "). */
  prefix?: string;
  suffix?: string;
  /** Element to render; a span unless told otherwise. */
  as?: "span" | "b";
  /** How much of the watched element must be on screen before the count starts (0 to 1). */
  threshold?: number;
  /** CSS selector of the ancestor to watch; the number itself when left out. */
  within?: string;
  className?: string;
}

const DURATION_MS = 1600;

/**
 * A number that counts up from zero the first time it scrolls into view. The server renders the final
 * value, so it is correct without JavaScript; the count is drawn straight into the element, with no
 * re-rendering. With reduced motion the final value simply stays.
 */
export function CountUp({ to, prefix = "", suffix = "", as: Tag = "span", threshold = 0.35, within, className }: CountUpProps) {
  const el = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const node = el.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const watched = (within && node.closest(within)) || node;
    let raf = 0;
    node.textContent = `${prefix}0${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let t0 = 0;
        const tick = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min(1, (t - t0) / DURATION_MS);
          node.textContent = `${prefix}${Math.round(to * easeOut(p))}${suffix}`;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold },
    );
    io.observe(watched);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = `${prefix}${to}${suffix}`;
    };
  }, [to, prefix, suffix, threshold, within]);

  return (
    <Tag ref={el as never} className={className} suppressHydrationWarning>
      {prefix}
      {to}
      {suffix}
    </Tag>
  );
}
