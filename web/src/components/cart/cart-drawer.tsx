"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef } from "react";
import { QtyControl } from "@/components/cart/qty-control";
import { Button } from "@/components/ui/button";
import { IconBag, IconClose } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { useCart } from "@/hooks/use-cart";
import { useDeferredOpen } from "@/hooks/use-deferred-open";
import { money } from "@/lib/cart";
import { pageLink, pagePath } from "@/lib/routes";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** The cart, in a panel from the right: its lines with quantity steppers, the subtotal, and the way to checkout. */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const cart = useCart();
  const router = useRouter();
  const shown = useDeferredOpen(open);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const n = cart.count;
  return (
    <div
      className={`fixed inset-0 z-[76] overflow-hidden ${shown ? "" : "pointer-events-none"}`}
      style={{ visibility: shown ? "visible" : "hidden", transition: `visibility 0s linear ${shown ? "0s" : ".5s"}` }}
      aria-hidden={!shown}
    >
      <div onClick={onClose} className={`absolute inset-0 bg-[#0B0F13]/50 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute top-0 right-0 flex h-[100dvh] w-full flex-col bg-ndm-paper text-ndm-ink transition-transform duration-500 sm:w-[480px]"
        style={{ transform: shown ? "none" : "translateX(100%)", transitionTimingFunction: "var(--e-out)" }}
      >
        <div className="flex items-center justify-between border-b border-ndm-ink/10 px-6 py-5">
          <h2 id="cart-title" className="font-aeonik text-[28px] leading-none font-normal tracking-[-0.02em]">
            Your cart{" "}
            <span className="ml-1 font-inter text-[14px] tracking-normal text-ndm-muted">
              {n} {n === 1 ? "item" : "items"}
            </span>
          </h2>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close cart" className="grid size-11 place-items-center rounded-full hover:bg-ndm-mist">
            <IconClose />
          </button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-white text-ndm-deep ring-1 ring-ndm-ink/10">
              <IconBag size={26} />
            </span>
            <p className="mt-5 font-aeonik text-[24px]">Your cart is empty</p>
            <p className="mt-2 max-w-[30ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">Open any treatment in the price list and choose Add to cart.</p>
            <Button
              v="line"
              sm
              className="mt-6"
              onClick={() => {
                onClose();
                router.push(`${pagePath("pricing")}#prices`);
              }}
            >
              Browse prices
            </Button>
          </div>
        ) : (
          <>
            <ul data-lenis-prevent="" className="flex-1 divide-y divide-ndm-ink/10 overflow-y-auto overscroll-contain px-6" role="list">
              {cart.lines.map((l) => (
                <li key={l.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-4">
                  <div className="min-w-0">
                    <p className="font-inter text-[12px] tracking-[.12em] text-ndm-muted uppercase">{l.cat}</p>
                    <p className="mt-1 font-aeonik text-[18px] leading-[1.25] tracking-[-0.01em]">{l.name}</p>
                    <p className="mt-0.5 font-inter text-[14px] text-ndm-muted">
                      {l.label} · {money(l.price)}
                      {l.unit}
                    </p>
                  </div>
                  <p className="text-right">
                    {l.was ? (
                      <s className="pr-was block">
                        <span className="sr-only">Regular price </span>
                        {money(l.was * l.qty)}
                      </s>
                    ) : null}
                    <span className={`block font-aeonik text-[20px] leading-tight ${l.was ? "text-ndm-deep" : ""}`}>{money(l.price * l.qty)}</span>
                  </p>
                  <div className="col-span-2 flex items-center justify-between">
                    <QtyControl line={l} label={`${l.name}, ${l.label}`} />
                    <button type="button" onClick={() => cart.setQty(l, 0)} className="font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:text-ndm-ink hover:underline">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="shrink-0 border-t border-ndm-ink/10 bg-white px-6 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              {cart.saved > 0 && (
                <p className="flex items-baseline justify-between font-inter text-[13.5px] text-ndm-deep">
                  <span>You save</span>
                  <span className="font-semibold tabular-nums">{money(cart.saved)}</span>
                </p>
              )}
              <p className="mt-0.5 flex items-baseline justify-between">
                <span className="font-inter text-[14.5px]">Subtotal</span>
                <span className="font-aeonik text-[22px] tracking-[-0.02em] tabular-nums">{money(cart.total)}</span>
              </p>
              <p className="mt-1.5 font-inter text-[12px] leading-[1.45] text-ndm-muted">Taxes added at checkout. Your plan is confirmed at a free consultation. Affirm payments available on orders of $500 or more (Canadian citizens and residents, 19+).</p>
              <div className="mt-3.5 grid grid-cols-[1fr_auto] items-center gap-3">
                <Button href={pagePath("checkout")} v="ink" block className="btn-buy">
                  Checkout
                </Button>
                <SiteLink to={pageLink("cart")} className="px-2 font-inter text-[14px] font-medium text-ndm-deep underline-offset-4 hover:underline">
                  View cart
                </SiteLink>
              </div>
              <button type="button" onClick={onClose} className="mt-2 w-full py-1.5 text-center font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:underline">
                Continue browsing
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
