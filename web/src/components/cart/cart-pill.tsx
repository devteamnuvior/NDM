"use client";

import { useState } from "react";
import { IconBag } from "@/components/ui/icons";
import { useCart } from "@/hooks/use-cart";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { money } from "@/lib/cart";

interface CartPillProps {
  onOpen: () => void;
  /** An overlay is open: the bar steps out of the way. */
  hidden: boolean;
}

/**
 * The floating cart bar, on every page once the cart holds something. Hidden on the first screen and over
 * areas marked `data-pill-avoid` (`data-pill-avoid="mobile"` only under 768px); the floating search button
 * steps above it.
 */
export function CartPill({ onOpen, hidden }: CartPillProps) {
  const cart = useCart();
  const [away, setAway] = useState(true);
  /* the count badge bumps each time an item is added */
  const [seen, setSeen] = useState({ count: cart.count, bump: 0 });
  if (cart.count !== seen.count) setSeen({ count: cart.count, bump: cart.count > seen.count ? seen.bump + 1 : seen.bump });

  useOnScroll(() => {
    const vh = window.innerHeight;
    let a = window.scrollY < vh * 0.5;
    document.querySelectorAll<HTMLElement>("[data-pill-avoid]").forEach((el) => {
      if (el.dataset.pillAvoid === "mobile" && window.innerWidth >= 768) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh - 20 && r.bottom > vh - 90) a = true;
    });
    setAway(a);
  });

  const show = cart.count > 0 && !hidden && !away;
  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      data-float-avoid=""
      /* once the bar has slid in or out, the floating search button re-reads where it may sit */
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform") window.dispatchEvent(new Event("scroll"));
      }}
      aria-label={`View cart, ${cart.count} ${cart.count === 1 ? "item" : "items"}, ${money(cart.total)}`}
      className={`cart-pill fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-full bg-ndm-deep py-2 pr-2 pl-2 text-left text-white shadow-[0_24px_50px_-20px_rgba(11,15,19,.6)] sm:inset-x-auto sm:right-6 sm:bottom-6 ${show ? "" : "is-off"}`}
    >
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
        <IconBag size={20} />
        <span key={seen.bump} className="cart-bump absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ndm-sky px-1 font-inter text-[11px] leading-none font-semibold text-white">
          {cart.count}
        </span>
      </span>
      <span className="min-w-0 flex-1 sm:flex-none">
        <span className="block font-inter text-[12px] leading-none text-white/60">
          {cart.count} {cart.count === 1 ? "item" : "items"}
        </span>
        <span className="mt-1 block font-inter text-[16px] leading-none font-semibold tabular-nums">{money(cart.total)}</span>
      </span>
      <span className="ml-1 rounded-full bg-white px-4 py-2.5 font-inter text-[14px] font-medium text-ndm-ink">View cart</span>
    </button>
  );
}
