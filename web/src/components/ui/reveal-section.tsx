"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { useReveal } from "@/hooks/use-reveal";

/**
 * A <section> whose `.rv` elements appear as they scroll into view. Its content is rendered on the
 * server; this adds only the scroll watcher.
 */
export function RevealSection({ children, ...rest }: ComponentPropsWithoutRef<"section">) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section ref={ref} {...rest}>
      {children}
    </section>
  );
}
