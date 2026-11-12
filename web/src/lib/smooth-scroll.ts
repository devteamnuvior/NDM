import type Lenis from "lenis";

/**
 * The page's smooth-scroll instance (Lenis), when one is running. It is created by <SmoothScroll /> after
 * the page is interactive, and is absent with reduced motion: callers must work without it.
 */
let instance: Lenis | null = null;

export function setSmoothScroll(lenis: Lenis | null): void {
  instance = lenis;
}

export function getSmoothScroll(): Lenis | null {
  return instance;
}

/** Scrolls the page to `y`: with the smooth-scroll library when it runs, natively otherwise. */
export function scrollToY(y: number, immediate = false): void {
  if (instance) {
    instance.resize();
    instance.scrollTo(y, { duration: 1.4, immediate });
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: reduced || immediate ? "auto" : "smooth" });
}
