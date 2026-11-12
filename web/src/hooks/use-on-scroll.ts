import { useEffect, useEffectEvent } from "react";

/** Runs `fn` on mount and then at most once per frame while the page scrolls or resizes. */
export function useOnScroll(fn: () => void): void {
  const run = useEffectEvent(fn);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      run();
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    run();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);
}
