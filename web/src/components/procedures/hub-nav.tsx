"use client";

import { useState, type MouseEvent } from "react";
import { SubNav } from "@/components/ui/sub-nav";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { byId } from "@/lib/dom";
import { scrollToY } from "@/lib/smooth-scroll";

/** The hub's section bar (the site's one sub-menu): marks the section being read and scrolls to one on a click. */
export function HubNav({ items }: { items: [id: string, label: string][] }) {
  const [on, setOn] = useState(items[0][0]);
  useOnScroll(() => {
    let current = items[0][0];
    for (const [id] of items) {
      const el = byId(id);
      if (el && el.getBoundingClientRect().top < 240) current = id;
    }
    setOn(current);
  });
  const go = (id: string, e: MouseEvent) => {
    e.preventDefault();
    const el = byId(id);
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 170);
  };
  return <SubNav label="On this page" items={items.map(([key, label]) => ({ key, label }))} on={on} onPick={go} />;
}
