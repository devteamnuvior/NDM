"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrow, IconSearch } from "@/components/ui/icons";
import { byId } from "@/lib/dom";
import { scrollToY } from "@/lib/smooth-scroll";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { money } from "@/lib/cart";
import { jumpToPriceGroup, priceJumpOffset } from "@/lib/price-jump";
import type { PriceCategoryView } from "@/lib/pricing-view";

/**
 * "Jump to a treatment" above the price list (user, 2026-11-20): the categories as the Black Friday page's filter tabs
 * (white pills, the chosen one black), in one row that slides like a carousel: arrows from 640px up, a swipe on phones.
 * A tap opens that category and scrolls to it, as before.
 * The row and its arrows stay under the header for as long as the price list is on screen (user, 2026-11-20): it is
 * sticky inside the list's own container, so it lets go where the list ends; a tap from anywhere in the list scrolls to that
 * category with the bar's height kept clear above its heading. The label above it scrolls away.
 */
export function JumpMenu({ categories }: { categories: PriceCategoryView[] }) {
  const row = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  const [ends, setEnds] = useState({ start: true, end: false });
  const [picked, setPicked] = useState<string | null>(null);

  const measure = useCallback(() => {
    const el = row.current;
    if (!el) return;
    setEnds({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  /* the bar's height, handed to the list as --pcm-h: an open category's title sticks under the bar, never behind it
     (user, 2026-11-25: on phones the title slid under the bar while its category was scrolled) */
  useEffect(() => {
    const el = bar.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const put = () => box.style.setProperty("--pcm-h", `${el.offsetHeight}px`);
    put();
    const ro = new ResizeObserver(put);
    ro.observe(el);
    return () => {
      ro.disconnect();
      box.style.removeProperty("--pcm-h");
    };
  }, []);

  /* the bar gets its background and line only while it is stuck under the header */
  useOnScroll(() => {
    const el = bar.current;
    if (!el) return;
    const top = parseFloat(getComputedStyle(el).top) || 0;
    /* stuck = sitting exactly at its sticky top (not yet reached, or carried up by the end of the list, it is not) */
    setStuck(Math.abs(el.getBoundingClientRect().top - top) < 1.5);
  });


  /* phones (user, 2026-11-25): the floating search button is gone from this page, so the bar carries one; it brings the
     price list's own search box into view and puts the cursor in it */
  const find = () => {
    const input = byId("prices-search") as HTMLInputElement | null;
    if (!input) return;
    scrollToY(input.getBoundingClientRect().top + window.scrollY - 140);
    window.setTimeout(() => input.focus({ preventScroll: true }), 650);
  };

  const slide = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <p className="pcm-label rv">Jump to a treatment</p>
      <nav ref={bar} aria-label="Price list categories" className={`pcm ${stuck ? "is-stuck" : ""}`}>
        <button type="button" className="pcm-find" onClick={find} aria-label="Search treatments">
          <IconSearch size={18} />
        </button>
        <ul ref={row} className="pcm-list" role="list" data-lenis-prevent-horizontal="">
          {categories.map((c) => (
            <li key={c.id}>
              <a
                href={`#pg-${c.id}-h`}
                aria-current={picked === c.id || undefined}
                onClick={(e) => {
                  setPicked(c.id);
                  if (jumpToPriceGroup(`pg-${c.id}-h`, false, priceJumpOffset())) e.preventDefault();
                }}
                className="pcm-chip"
              >
                <span className="pcm-name">{c.name}</span>
                <span className="pcm-from">
                  From {money(c.from)}
                  {c.fromUnit}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="pcm-arrows">
          <button type="button" className="pcm-arrow" onClick={() => slide(-1)} disabled={ends.start} aria-label="Previous treatments">
            <IconArrow size={16} className="rotate-180" />
          </button>
          <button type="button" className="pcm-arrow" onClick={() => slide(1)} disabled={ends.end} aria-label="More treatments">
            <IconArrow size={16} />
          </button>
        </div>
      </nav>
    </>
  );
}
