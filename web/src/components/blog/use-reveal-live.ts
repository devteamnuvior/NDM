import { useEffect, type RefObject } from "react";

/** Like useReveal, but also picks up `.rv` elements added later (a filter, "Load more"): it runs again when `key` changes. */
export function useRevealLive(root: RefObject<HTMLElement | null>, key: string | number): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll(".rv:not(.in)");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [root, key]);
}
