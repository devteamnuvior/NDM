"use client";

import { useState } from "react";
import { QtyControl } from "@/components/cart/qty-control";
import { Button } from "@/components/ui/button";
import { IconBag, IconCheckBadge } from "@/components/ui/icons";
import { ACTIONS } from "@/config/routes";
import { useCart } from "@/hooks/use-cart";
import { money, type CartLine } from "@/lib/cart";
import { pagePath } from "@/lib/routes";
import { CO_CARD, CO_WRAP, CartPairs, CoAlert, CoHead, FIELD, IconLock, RemovedNotice, SumRows, money2, totalsOf, useInBrowser } from "./shared";

/** A cart line on the cart page: what it is, the quantity, the line price. */
function Line({ l }: { l: CartLine }) {
  const cart = useCart();
  const label = `${l.name}, ${l.label}`;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(110px,auto)] sm:items-center sm:gap-x-8">
      <div className="min-w-0">
        <p className="font-inter text-[12px] tracking-[.12em] text-ndm-muted uppercase">{l.cat}</p>
        <p className="mt-1 font-aeonik text-[20px] leading-[1.25] tracking-[-0.01em] text-ndm-ink">{l.name}</p>
        <p className="mt-0.5 font-inter text-[14px] text-ndm-muted">
          {l.label} · {money(l.price)}
          {l.unit} each
        </p>
      </div>
      <p className="text-right sm:order-3">
        {l.was ? (
          <s className="pr-was block">
            <span className="sr-only">Regular price </span>
            {money(l.was * l.qty)}
          </s>
        ) : null}
        <span className={`block font-aeonik text-[22px] leading-tight tabular-nums ${l.was ? "text-ndm-deep" : "text-ndm-ink"}`}>{money(l.price * l.qty)}</span>
        {l.was ? <span className="co-save mt-1 inline-block">Save {money((l.was - l.price) * l.qty)}</span> : null}
      </p>
      <div className="col-span-2 flex items-center gap-5 sm:order-2 sm:col-span-1">
        <QtyControl line={l} label={label} />
        <button type="button" onClick={() => cart.setQty(l, 0)} className="font-inter text-[13.5px] text-ndm-muted underline-offset-4 hover:text-ndm-ink hover:underline">
          Remove<span className="sr-only"> {label}</span>
        </button>
      </div>
    </li>
  );
}

/** 1. Cart: the lines, the estimate, and the way to checkout. Prices are WooCommerce's, checked when the cart loads. */
export function CartPage({ pairs }: { pairs: Omit<CartLine, "qty">[] }) {
  const cart = useCart();
  const ready = useInBrowser();
  const t = totalsOf(cart.lines);
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState<["warn" | "err", string] | null>(null);
  const empty = cart.lines.length === 0;
  return (
    <section aria-labelledby="co-title" className={`co-band ${CO_WRAP}`}>
      <CoHead at={0} lead="Your" strong="cart" text={empty ? null : "Check your treatments, then continue to checkout. Nothing is charged online: you pay at the clinic."} />
      <RemovedNotice />
      {!ready ? null : empty ? (
        <div className={`${CO_CARD} mt-10 flex flex-col items-center px-6 py-14 text-center`}>
          <span className="grid size-16 place-items-center rounded-full bg-ndm-mist text-ndm-deep">
            <IconBag size={26} />
          </span>
          <p className="mt-5 font-inter text-[12px] font-semibold tracking-[.14em] text-ndm-muted uppercase">Your cart</p>
          <h2 className="mt-2 font-aeonik text-[clamp(28px,2.8vw,38px)] leading-[1.1] font-normal tracking-[-0.02em] text-ndm-ink">Your cart is empty</h2>
          <p className="mt-3 max-w-[44ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">Browse treatment packages and prices, or book a free consultation and we’ll recommend a plan for you.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href={`${pagePath("pricing")}#prices`} v="ink">
              Browse prices
            </Button>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
          </div>
          <div className="mt-12 w-full max-w-[760px] text-left">
            <CartPairs pairs={pairs} title="Popular treatments" kicker="Most chosen" />
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start">
          <div>
            <div className={`${CO_CARD} px-[clamp(18px,2.4vw,32px)]`}>
              <div className="flex items-baseline justify-between border-b border-ndm-ink/10 py-5">
                <h2 className="font-aeonik text-[22px] font-normal tracking-[-0.01em] text-ndm-ink">Treatments in your cart</h2>
                <span className="font-inter text-[13.5px] text-ndm-muted">
                  {cart.count} {cart.count === 1 ? "item" : "items"}
                </span>
              </div>
              <ul className="divide-y divide-ndm-ink/10" role="list">
                {cart.lines.map((l) => (
                  <Line key={l.key} l={l} />
                ))}
              </ul>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <CoAlert tone="ok" title="Free consultation included">
                Every treatment starts with an in-person consultation and VISIA® skin analysis, at no charge.
              </CoAlert>
              <CoAlert tone="warn" title="Prices are estimates">
                HST is estimated. Your provider confirms your plan and final price at the clinic.
              </CoAlert>
            </div>
          </div>
          {/* the summary and the suggestions stay together; on wide screens the column sticks and scrolls on its own when it is taller than the window */}
          <div className="co-side grid gap-4" data-lenis-prevent="">
            <aside className={`${CO_CARD} co-sumcard overflow-hidden p-[clamp(20px,2.4vw,28px)]`} aria-label="Cart summary">
              <h2 className="font-aeonik text-[22px] font-normal tracking-[-0.01em] text-ndm-ink">Summary</h2>
              <div className="mt-3">
                <SumRows t={t} />
              </div>
              <details className="co-code mt-4 rounded-[14px] bg-ndm-mist px-4 py-3">
                <summary className="cursor-pointer font-inter text-[14px] font-medium text-ndm-ink">Have a promo code?</summary>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCodeMsg(code.trim() ? ["warn", "Thanks. Our team checks promo codes before you pay at the clinic."] : ["err", "Please enter a promo code first."]);
                  }}
                >
                  <input value={code} onChange={(e) => setCode(e.target.value)} aria-label="Promo code" placeholder="Promo code" className={`${FIELD} h-11`} />
                  <Button as="button" type="submit" v="line" sm>
                    Apply
                  </Button>
                </form>
                {codeMsg && (
                  <CoAlert tone={codeMsg[0]} className="mt-3">
                    {codeMsg[1]}
                  </CoAlert>
                )}
              </details>
              <Button href={pagePath("checkout")} v="ink" block className="mt-5">
                Proceed to checkout
              </Button>
              <p className="mt-2.5 flex items-center justify-center gap-2 font-inter text-[12.5px] text-ndm-muted">
                <IconLock />
                Nothing is charged online
              </p>
              <p className="mt-4 flex items-start gap-2 border-t border-ndm-ink/10 pt-4 font-inter text-[12.5px] leading-[1.45] text-ndm-muted">
                <IconCheckBadge className="mt-0.5 shrink-0 text-ndm-deep" />
                Every treatment starts with a free, in-person consultation. You pay at the clinic once your plan is confirmed.
              </p>
            </aside>
            <div className={`${CO_CARD} p-[clamp(18px,2.2vw,24px)]`}>
              <CartPairs pairs={pairs} compact max={2} kicker="Before you finish" title="Pairs well with your treatment" />
            </div>
          </div>
        </div>
      )}
      {/* phones: the total and the next step stay in reach */}
      {ready && !empty && (
        <div data-float-avoid="" className="co-bar fixed inset-x-0 bottom-0 z-[58] flex items-center justify-between gap-4 border-t border-ndm-ink/10 bg-white/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <span>
            <span className="block font-inter text-[12px] text-ndm-muted">Estimated total</span>
            <span className="font-aeonik text-[22px] leading-none tabular-nums">{money2(t.total)}</span>
          </span>
          <Button href={pagePath("checkout")} v="ink">
            Checkout
          </Button>
        </div>
      )}
    </section>
  );
}
