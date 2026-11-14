"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Turns on smooth wheel scrolling for the whole site (same library and settings as the prototype).
 * The library is loaded after the page is interactive, and never with reduced motion. Renders nothing.
 * The management screens (/manage) scroll natively: boxes are dragged there, and the page must follow
 * the pointer without easing.
 */
export function SmoothScroll() {
  const native = usePathname().startsWith("/manage");
  useEffect(() => {
    if (native || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let cancelled = false;
    let destroy = () => {};
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
      setSmoothScroll(lenis);
      const tick = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      destroy = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
        setSmoothScroll(null);
      };
    });
    return () => {
      cancelled = true;
      destroy();
    };
  }, [native]);
  return null;
}
