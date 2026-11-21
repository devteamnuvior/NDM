"use client";

import { useState, type MouseEvent } from "react";
import { SubNav } from "@/components/ui/sub-nav";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";

/** "On this page" for a legal document: marks the heading being read, and scrolls to one on a click. */
export function LegalToc({ toc }: { toc: [id: string, label: string][] }) {
  const [on, setOn] = useState(toc[0][0]);
  useOnScroll(() => {
    let current = toc[0][0];
    for (const [id] of toc) {
      const el = byId(id);
      if (el && el.getBoundingClientRect().top < 220) current = id;
    }
    setOn(current);
  });
  const go = (id: string, e: MouseEvent) => {
    e.preventDefault();
    const el = byId(id);
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 190);
  };
  const items = toc.map(([id, label], k) => ({
    key: id,
    label: (
      <>
        <span className={`tabular-nums ${on === id ? "text-white/70" : "text-ndm-muted"}`}>{k + 1}</span>
        {label}
      </>
    ),
  }));
  return <SubNav label="On this page" items={items} on={on} onPick={go} />;
}
