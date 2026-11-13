"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { NavIcon, navIcon } from "@/components/treatment/icons";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";
import { withBase } from "@/lib/base-path";

/**
 * The section bar: a sticky row of links under the header that marks the section in view. Like the header,
 * it turns dark glass while it sits over a dark section.
 */
export function TxNav({ nav }: { nav: [id: string, label: string][] }) {
  const [on, setOn] = useState(nav[0][0]);
  const [dark, setDark] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setOn(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const [id] of nav) {
      const el = byId(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [nav]);

  /* keep the current link in the middle of the row */
  useEffect(() => {
    const link = bar.current?.querySelector<HTMLElement>(`[data-k="${on}"]`);
    const row = bar.current?.querySelector<HTMLElement>(".tx-nav-scroll");
    if (!link || !row) return;
    row.scrollTo({ left: link.offsetLeft - row.clientWidth / 2 + link.offsetWidth / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [on]);

  useOnScroll(() => {
    const b = bar.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const y = r.top + r.height / 2;
    setDark(
      Array.from(document.querySelectorAll('[data-nav="dark"]')).some((el) => {
        const q = el.getBoundingClientRect();
        return q.top <= y && q.bottom >= y;
      }),
    );
  });

  const go = (e: MouseEvent, id: string) => {
    const el = byId(id);
    if (!el) return;
    e.preventDefault();
    scrollToY(el.getBoundingClientRect().top + window.scrollY - 160);
  };

  return (
    <nav
      ref={bar}
      aria-label="On this page"
      className={`tx-nav sticky top-[100px] z-30 mt-8 backdrop-blur-[14px] transition-colors duration-300 xl:top-[120px] ${dark ? "bg-[rgba(10,13,16,.42)] shadow-[inset_0_-1px_0_rgba(255,255,255,.08)]" : "bg-ndm-paper/85"}`}
    >
      <div className="tx-nav-scroll no-scrollbar relative overflow-x-auto px-[var(--gx)] py-2.5">
        <ul className="relative mx-auto flex w-max gap-1" role="list">
          <li className="shrink-0">
            <a
              href="#top"
              aria-label="Back to top"
              onClick={(e) => {
                e.preventDefault();
                scrollToY(0);
              }}
              className={`flex items-center rounded-full px-2.5 py-2 whitespace-nowrap transition-colors ${dark ? "text-white hover:bg-white/10" : "text-ndm-deep hover:bg-white hover:text-ndm-ink"}`}
            >
              <NavIcon name="home" />
            </a>
          </li>
          {nav.map(([id, label]) => (
            <li key={id} data-k={id} className="shrink-0">
              <a
                href={withBase(`#${id}`)}
                onClick={(e) => go(e, id)}
                aria-current={on === id ? "true" : undefined}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 font-inter text-[14px] whitespace-nowrap transition-colors ${on === id ? "bg-ndm-deep font-medium text-white" : dark ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ndm-ink/80 hover:bg-white hover:text-ndm-ink"}`}
              >
                <NavIcon name={navIcon(id, label)} className={on === id ? "text-white" : dark ? "text-ndm-sky" : "text-ndm-deep"} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
