"use client";

import { Fragment, useState, useSyncExternalStore, type ReactNode } from "react";
import { QtyControl } from "@/components/cart/qty-control";
import { IconChevron } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { CHECKOUT_STEPS } from "@/config/checkout";
import { useCart } from "@/hooks/use-cart";
import { getCartTax, getSaleCode, getServerCartTax, getServerSaleCode, getServerTypedCode, getTypedCode, money, setTypedCode, subscribeCart, type CartLine, type CartTax } from "@/lib/cart";
import { pagePath } from "@/lib/routes";
import { withBase } from "@/lib/base-path";

/** The pieces the cart, checkout and confirmation pages share. Ported from the prototype's src/cart-ui.jsx. */

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface Totals {
  sub: number;
  saved: number;
  tax: number;
  /** "HST (13%)", WooCommerce's own tax; null when it adds none; left out while it is not known yet. */
  taxLabel?: string | null;
  total: number;
  /** The checkout code that was counted in, and what it takes off; left out without one. */
  code?: string;
  discount?: number;
}

/**
 * Totals of the lines on screen; with a checkout code, the eligible lines count at their price with the
 * code. Tax is WooCommerce's own rate (never typed here): `rate` is what the last cart check said, null
 * when WooCommerce adds none, undefined while it is not known. The order itself is priced and taxed by
 * WooCommerce, which applies the code itself.
 */
export function totalsOf(lines: CartLine[], code = "", rate?: CartTax | null): Totals {
  const listed = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const discount = code ? lines.reduce((n, l) => n + (l.code ? l.qty * (l.price - l.code) : 0), 0) : 0;
  const sub = listed - discount;
  const saved = lines.reduce((n, l) => n + (l.was ? l.qty * (l.was - l.price) : 0), 0);
  const tax = rate ? round2((sub * rate.rate) / 100) : 0;
  const taxLabel = rate ? `${rate.label} (${Number(rate.rate.toFixed(4))}%)` : rate;
  return { sub: round2(listed), saved: round2(saved), tax, ...(taxLabel === undefined ? {} : { taxLabel }), total: round2(sub + tax), ...(discount > 0 ? { code, discount: round2(discount) } : {}) };
}

/** WooCommerce's tax as the last cart check said: a rate and its name, null for none, undefined while unknown. */
export const useCartTax = (): CartTax | null | undefined => useSyncExternalStore(subscribeCart, getCartTax, getServerCartTax);

/**
 * The checkout code as it stands: what was entered, whether the sale WooCommerce runs accepts it, and
 * whether anything in the cart is an eligible package. `applied` is the code to count in and to send
 * with the order request, or "".
 */
export function useSaleCode(lines: CartLine[]): { typed: string; applied: string; message: string; tone: "ok" | "warn" | "bad" | ""; set: (code: string) => void } {
  const typed = useSyncExternalStore(subscribeCart, getTypedCode, getServerTypedCode);
  const sale = useSyncExternalStore(subscribeCart, getSaleCode, getServerSaleCode);
  const set = setTypedCode;
  if (!typed) return { typed, applied: "", message: "", tone: "", set };
  if (sale === undefined) return { typed, applied: "", message: "", tone: "", set }; /* not checked yet */
  if (!sale || typed !== sale.code) return { typed, applied: "", message: "This code is not valid.", tone: "bad", set };
  if (!sale.live) return { typed, applied: "", message: "This code has expired.", tone: "bad", set };
  if (!lines.some((l) => l.code)) return { typed, applied: "", message: `Code ${typed} applies to eligible packages. Nothing in your cart is one.`, tone: "warn", set };
  return { typed, applied: typed, message: `Code ${typed} applied to the eligible packages in your cart.`, tone: "ok", set };
}

/** The checkout code field with its note. */
export function CodeField({ lines }: { lines: CartLine[] }) {
  const c = useSaleCode(lines);
  const sale = useSyncExternalStore(subscribeCart, getSaleCode, getServerSaleCode);
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? c.typed;
  const tone = c.tone === "ok" ? "text-[#1F7A4D]" : c.tone === "bad" ? "text-[#B3261E]" : "text-ndm-muted";
  return (
    <form
      className="mt-5 border-t border-ndm-ink/10 pt-5"
      onSubmit={(e) => {
        e.preventDefault();
        c.set(value);
        setDraft(null);
      }}
    >
      <label htmlFor="co-code" className="font-inter text-[12px] font-semibold tracking-[.14em] text-ndm-muted uppercase">
        Checkout code
      </label>
      <div className="mt-2 flex gap-2">
        <input id="co-code" name="code" value={value} onChange={(e) => setDraft(e.target.value.toUpperCase())} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={40} aria-describedby="co-code-note" className={`${FIELD} min-w-0 flex-1 uppercase`} />
        {c.typed && draft === null ? (
          <button type="button" onClick={() => c.set("")} className="btn btn-line btn-sm shrink-0">
            Remove
          </button>
        ) : (
          <button type="submit" className="btn btn-ink btn-sm shrink-0" disabled={!value.trim()}>
            Apply
          </button>
        )}
      </div>
      <p id="co-code-note" role="status" className={`mt-2 font-inter text-[12.5px] leading-[1.5] ${tone}`}>
        {c.message || (sale?.live ? `Code ${sale.code} applies to eligible packages. Consultation required before treatment.` : "Enter a code if you have one.")}
      </p>
    </form>
  );
}

export const money2 = (n: number): string => `$${n.toLocaleString("en-CA", { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const FIELD =
  "block h-12 w-full rounded-[10px] border border-ndm-ink/15 bg-white px-3.5 font-inter text-[14.5px] text-ndm-ink placeholder:text-[#7D868D] outline-hidden transition focus:border-ndm-blue focus:ring-4 focus:ring-ndm-blue/15";
export const CO_CARD = "rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] shadow-[0_30px_60px_-46px_rgba(27,36,43,.45)]";
export const CO_WRAP = "relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(168px,16vw,200px)] pb-[clamp(72px,8vw,120px)]";

/** False on the server and during the first render, true once the page runs in the browser (the cart is in the browser). */
export const useInBrowser = (): boolean =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export const IconTick = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="m3 7.3 2.6 2.6L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const IconLock = () => (
  <svg width={15} height={15} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/**
 * 1 Cart · 2 Details · 3 Payment · 4 Review · 5 Confirmation, always on one line (user,
 * 2026-11-14; the prototype let the row wrap). Below the `lg` width only the current step shows its
 * name (the others keep it for screen readers), and on phones the lines between the steps are left out.
 */
export function CheckoutSteps({ at, onStep }: { at: number; onStep?: (step: number) => void }) {
  return (
    <ol className="flex flex-nowrap items-center gap-x-2 font-inter text-[12.5px] font-semibold tracking-[.12em] whitespace-nowrap uppercase sm:gap-x-3" role="list" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((t, i) => {
        const done = i < at;
        const now = i === at;
        const dot = (
          <span aria-hidden="true" className={`grid size-7 place-items-center rounded-full text-[12px] tracking-normal ${now ? "bg-ndm-deep text-white" : done ? "bg-ndm-deep/10 text-ndm-deep" : "bg-white text-ndm-muted ring-1 ring-ndm-ink/15"}`}>
            {done ? <IconTick size={12} /> : i + 1}
          </span>
        );
        const label = <span className={now ? "text-ndm-ink" : `max-lg:sr-only ${done ? "text-ndm-deep" : "text-ndm-muted"}`}>{t}</span>;
        return (
          <Fragment key={t}>
            <li aria-current={now ? "step" : undefined}>
              {done && i === 0 ? (
                <a href={withBase(pagePath("cart"))} className="flex items-center gap-2 underline-offset-4 hover:underline">
                  {dot}
                  {label}
                </a>
              ) : done && onStep && i > 0 ? (
                <button type="button" onClick={() => onStep(i - 1)} className="flex items-center gap-2 tracking-[.12em] uppercase underline-offset-4 hover:underline">
                  {dot}
                  {label}
                </button>
              ) : (
                <span className="flex items-center gap-2">
                  {dot}
                  {label}
                </span>
              )}
            </li>
            {i < CHECKOUT_STEPS.length - 1 && <li aria-hidden="true" className={`hidden h-px max-w-10 min-w-3 flex-1 sm:block ${done ? "bg-ndm-deep/40" : "bg-ndm-ink/15"}`} />}
          </Fragment>
        );
      })}
    </ol>
  );
}

/** One alert style for the cart and checkout: ok (green), warn (amber), err (red). */
export function CoAlert({ tone = "ok", title, children, className = "" }: { tone?: "ok" | "warn" | "err"; title?: string; children: ReactNode; className?: string }) {
  const icon =
    tone === "ok" ? (
      <path d="m4.5 8.3 2.2 2.2L11.5 5.7" />
    ) : tone === "warn" ? (
      <>
        <path d="M8 4.8v4" />
        <path d="M8 11.2h.01" />
      </>
    ) : (
      <>
        <path d="m5.6 5.6 4.8 4.8" />
        <path d="m10.4 5.6-4.8 4.8" />
      </>
    );
  return (
    <div role={tone === "err" ? "alert" : "status"} className={`co-alert is-${tone} flex items-start gap-3 rounded-[14px] px-4 py-3 font-inter text-[13.5px] leading-[1.5] ${className}`}>
      <span aria-hidden="true" className="co-alert-ico mt-px grid size-6 shrink-0 place-items-center rounded-full">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <span>
        {title && <b className="block font-semibold">{title}</b>}
        {children}
      </span>
    </div>
  );
}

/** The page head every step shares: steps, heading, one line of help. */
/**
 * The page head every step shares, a block of its own above the cards (user, 2026-11-14): the steps on
 * one line, then the heading on one line with one line of help beside it, closed by a thin rule.
 */
export function CoHead({ at, lead, strong, text, onStep }: { at: number; lead: string; strong: string; text?: string | null; onStep?: (step: number) => void }) {
  return (
    <div className="co-head border-b border-ndm-ink/10 pb-[clamp(28px,3.4vw,48px)]">
      <CheckoutSteps at={at} onStep={onStep} />
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <TwoTone as="h1" id="co-title" className="sm:whitespace-nowrap" size="text-[clamp(40px,4.6vw,68px)]" lead={lead} strong={strong} />
        {text && <p className="max-w-[44ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted lg:pb-2">{text}</p>}
      </div>
    </div>
  );
}

export function SumRows({ t }: { t: Totals }) {
  const row = "flex items-baseline justify-between gap-4 font-inter text-[14.5px]";
  return (
    <dl className="grid gap-2.5">
      <div className={row}>
        <dt className="text-ndm-muted">Subtotal</dt>
        <dd className="text-ndm-ink tabular-nums">{money2(t.sub)}</dd>
      </div>
      {t.saved > 0 && (
        <div className={`${row} text-ndm-deep`}>
          <dt>You save</dt>
          <dd className="font-semibold tabular-nums">{money2(t.saved + (t.discount ?? 0))}</dd>
        </div>
      )}
      {t.code && t.discount ? (
        <div className={row}>
          <dt className="text-ndm-muted">Code {t.code}</dt>
          <dd className="text-ndm-ink tabular-nums">-{money2(t.discount)}</dd>
        </div>
      ) : null}
      {/* WooCommerce's tax: named when it is known, left out when WooCommerce adds none */}
      {(t.taxLabel !== null || t.tax > 0) && (
        <div className={row}>
          <dt className="text-ndm-muted">{t.taxLabel ? `Estimated ${t.taxLabel}` : t.tax > 0 ? "Estimated tax" : "Tax"}</dt>
          <dd className="text-ndm-ink tabular-nums">{t.taxLabel || t.tax > 0 ? money2(t.tax) : "To be confirmed"}</dd>
        </div>
      )}
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-ndm-ink/10 pt-4">
        <dt className="font-inter text-[15px] font-semibold text-ndm-ink">Estimated total</dt>
        <dd className="font-aeonik text-[28px] leading-none tracking-[-0.02em] text-ndm-ink tabular-nums">{money2(t.total)}</dd>
      </div>
    </dl>
  );
}

/** The order summary used on the checkout and confirmation pages. */
export function OrderSummary({ t, lines, scroll }: { t: Totals; lines: CartLine[]; scroll?: boolean }) {
  return (
    <>
      <ul className={`divide-y divide-ndm-ink/10 ${scroll ? "co-list" : ""}`} role="list" {...(scroll ? { tabIndex: 0, "aria-label": "Treatments in your order", "data-lenis-prevent": "" } : {})}>
        {lines.map((l) => (
          <li key={l.key} className="flex items-start justify-between gap-4 py-3.5">
            <span className="min-w-0">
              <span className="block font-inter text-[14.5px] leading-[1.3] font-medium text-ndm-ink">{l.name}</span>
              <span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">
                {l.label} · Qty {l.qty}
              </span>
            </span>
            <span className="shrink-0 text-right font-inter text-[14.5px] text-ndm-ink tabular-nums">{money(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-ndm-ink/10 pt-4">
        <SumRows t={t} />
      </div>
    </>
  );
}

/** Pairs well with your treatment / add to your plan: suggestions with WooCommerce's current prices. */
export function CartPairs({ pairs, title = "Pairs well with your treatment", kicker = "Complete your plan", max = 4, compact }: { pairs: Omit<CartLine, "qty">[]; title?: string; kicker?: string; max?: number; compact?: boolean }) {
  const cart = useCart();
  /* nothing that is already in the cart, in any of its options */
  const list = pairs.filter((x) => !cart.lines.some((l) => l.key === x.key || (!!x.productId && l.productId === x.productId))).slice(0, max);
  if (!list.length) return null;
  return (
    <div className={compact ? "" : "mt-12"}>
      <p className="font-inter text-[12px] font-semibold tracking-[.14em] text-ndm-deep uppercase">{kicker}</p>
      <h2 className={`mt-2 font-aeonik leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink ${compact ? "text-[22px]" : "text-[clamp(26px,2.4vw,34px)]"}`}>{title}</h2>
      <ul className={`mt-5 grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`} role="list">
        {list.map((x) => (
          <li key={x.key} className="flex items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3.5 ring-1 ring-ndm-ink/[.07]">
            <span className="min-w-0">
              <span className="block font-inter text-[14.5px] leading-[1.3] font-medium text-ndm-ink">{x.name}</span>
              <span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">
                {x.label} ·{" "}
                {x.was ? (
                  <>
                    <s className="mr-1">{money(x.was)}</s>
                    <b className="font-semibold text-ndm-deep">{money(x.price)}</b>
                  </>
                ) : (
                  money(x.price)
                )}
              </span>
            </span>
            <QtyControl line={x} label={`${x.name}, ${x.label}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A select in the site's field style, with its own arrow. */
export function CoSelect({ name, value, onChange, placeholder, children }: { name: string; value: string; onChange: (value: string) => void; placeholder: string; children: ReactNode }) {
  return (
    <span className="relative block">
      <select required name={name} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} className={`${FIELD} appearance-none pr-10`} style={value === "" ? { color: "#7D868D" } : undefined}>
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      <IconChevron className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ndm-muted" />
    </span>
  );
}

/** Lines the cart check took out because they are no longer on the price list. */
export function RemovedNotice() {
  const cart = useCart();
  if (!cart.removed.length) return null;
  return (
    <CoAlert tone="warn" title="Your cart was updated" className="mt-6">
      No longer on the price list, so removed from your cart: {cart.removed.join("; ")}.
    </CoAlert>
  );
}
