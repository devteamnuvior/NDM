import { getSmoothScroll } from "@/lib/smooth-scroll";

/**
 * Stops the page scrolling behind an open overlay. Keeps the page width when the scrollbar goes away,
 * so nothing shifts under the panel.
 */
export function lockScroll(on: boolean): void {
  const root = document.documentElement;
  const gap = on ? window.innerWidth - root.clientWidth : 0;
  const lenis = getSmoothScroll();
  if (lenis) {
    if (on) lenis.stop();
    else lenis.start();
  }
  root.style.overflow = on ? "hidden" : "";
  root.style.paddingRight = gap > 0 ? `${gap}px` : "";
}
