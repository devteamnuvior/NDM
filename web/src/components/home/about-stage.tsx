"use client";

import { useRef, type ReactNode } from "react";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";

/**
 * The About section's moving parts; everything inside it is rendered on the server.
 *   - `.rv` elements appear as they scroll into view
 *   - the statement's words (`[data-w]` inside `[data-about-copy]`) light up one after another
 *   - the floating photo pairs (`[data-drift]`) drift against the scroll
 */
export function AboutStage({ children, className, labelledBy }: { children: ReactNode; className: string; labelledBy: string }) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  useOnScroll(() => {
    const root = section.current;
    const copy = root?.querySelector<HTMLElement>("[data-about-copy]");
    if (!root || !copy) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vh = window.innerHeight;
    const r = copy.getBoundingClientRect();
    const p = reduced ? 1 : clamp01((vh * 0.9 - r.top) / (vh * 0.45 + r.height * 0.5));
    const words = copy.querySelectorAll<HTMLElement>("[data-w]");
    const n = words.length;
    words.forEach((w, i) => {
      w.style.opacity = (0.22 + 0.78 * clamp01(p * n * 1.05 - i)).toFixed(3);
    });
    if (reduced) return;
    const through = clamp01((vh - root.getBoundingClientRect().top) / (vh + root.offsetHeight));
    root.querySelectorAll<HTMLElement>("[data-drift]").forEach((d) => {
      d.style.translate = `0 ${((0.5 - through) * Number(d.dataset.drift)).toFixed(1)}px`;
    });
  });

  return (
    <section ref={section} aria-labelledby={labelledBy} className={className}>
      {children}
    </section>
  );
}
