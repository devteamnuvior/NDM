"use client";

import { useEffect, useState } from "react";
import type { OrderReceipt } from "@/app/(site)/checkout/actions";
import { Button } from "@/components/ui/button";
import { TwoTone } from "@/components/ui/two-tone";
import { ORDER_STORAGE_KEY } from "@/config/checkout";
import { CLINICS } from "@/config/site";
import { pagePath, tel } from "@/lib/routes";
import { CO_CARD, CO_WRAP, CheckoutSteps, OrderSummary, money2 } from "./shared";

const NEXT_STEPS: [title: string, text: string][] = [
  ["We call you", "Within one business day, to find a time for your free consultation and treatment."],
  ["Your consultation", "Your provider confirms your plan in person. Treatments are given only when they suit you."],
  ["Pay at the clinic", "You pay at your appointment. Individual results may vary."],
];

/** The last order request, as this browser kept it (order number, lines, totals, first name and clinic only). */
function readOrder(): OrderReceipt | null {
  try {
    const o = JSON.parse(window.localStorage.getItem(ORDER_STORAGE_KEY) ?? "null") as OrderReceipt | null;
    return o && typeof o.no === "string" && Array.isArray(o.lines) ? o : null;
  } catch {
    return null;
  }
}

/** 3. Confirmation: the order request WooCommerce accepted, with its real order number. */
export function ConfirmPage() {
  /* undefined until the browser has looked: the order lives in this browser, not on the server */
  const [o, setO] = useState<OrderReceipt | null | undefined>(undefined);
  useEffect(() => {
    const id = requestAnimationFrame(() => setO(readOrder()));
    return () => cancelAnimationFrame(id);
  }, []);
  const date = o ? new Date(o.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" }) : "";
  const clinic = o ? CLINICS.find((c) => c.name === o.clinic) : undefined;
  return (
    <section aria-labelledby="co-title" className={`co-band ${CO_WRAP}`}>
      <CheckoutSteps at={5} />
      {o === undefined ? null : !o ? (
        <div className={`${CO_CARD} mt-10 flex flex-col items-center px-6 py-14 text-center`}>
          <h1 id="co-title" className="font-aeonik text-[clamp(30px,3vw,42px)] leading-[1.1] font-normal text-ndm-ink">
            No recent order request
          </h1>
          <p className="mt-3 max-w-[44ch] font-inter text-[15px] text-ndm-muted">Your order requests show here right after you place them.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href={`${pagePath("pricing")}#prices`} v="ink">
              Browse prices
            </Button>
            <Button href={pagePath("home")} v="line">
              Back to home
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          <div className={`${CO_CARD} overflow-hidden`}>
            {/* a calm, celebratory head: the tick draws itself inside soft rings */}
            <div className="co-thanks relative px-[clamp(22px,3vw,44px)] pt-[clamp(28px,3.4vw,48px)] pb-8 text-white">
              <span aria-hidden="true" className="co-ring co-ring-a" />
              <span aria-hidden="true" className="co-ring co-ring-b" />
              <span aria-hidden="true" className="relative grid size-[76px] place-items-center rounded-full bg-white text-ndm-deep shadow-[0_18px_40px_-16px_rgba(0,0,0,.45)]">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path className="co-tick-path" d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </span>
              <TwoTone
                as="h1"
                id="co-title"
                dark
                className="relative mt-6"
                size="text-[clamp(34px,3.6vw,54px)]"
                lead={
                  <>
                    Thank you{o.first ? `, ${o.first}` : ""},
                    <br />
                  </>
                }
                strong="your request is in"
              />
              <p className="relative mt-3 max-w-[52ch] font-inter text-[16px] leading-[1.6] text-white/85">
                Our team contacts you within one business day to book your visit{clinic ? ` at NewDermaMed ${clinic.name}` : ""}. Nothing has been charged.
              </p>
              <span className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-inter text-[13.5px] ring-1 ring-white/25">
                Order number <b className="font-semibold tabular-nums">{o.no}</b>
              </span>
            </div>
            <div className="p-[clamp(22px,3vw,44px)] pt-6">
              <dl className="grid grid-cols-3 [gap:1px] overflow-hidden rounded-[18px] border border-ndm-line bg-ndm-line">
                {[
                  ["Date", date],
                  ["Estimated total", money2(o.total)],
                  ["Payment", "At the clinic"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white px-4 py-3.5">
                    <dt className="font-inter text-[12px] text-ndm-muted">{k}</dt>
                    <dd className="mt-1 font-inter text-[14.5px] leading-[1.35] font-medium text-ndm-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <h2 className="mt-10 font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">What happens next</h2>
              <ol className="mt-4 grid gap-3" role="list">
                {NEXT_STEPS.map(([h, d], i) => (
                  <li key={h} className="flex items-start gap-4 rounded-[16px] bg-ndm-paper px-4 py-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ndm-deep/10 font-inter text-[13px] font-semibold text-ndm-deep">{i + 1}</span>
                    <span>
                      <span className="block font-inter text-[15px] font-semibold text-ndm-ink">{h}</span>
                      <span className="mt-0.5 block font-inter text-[14px] leading-[1.5] text-ndm-muted">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={`${pagePath("account")}#plans`} v="ink">
                  See it in my account
                </Button>
                <Button href={pagePath("home")} v="line">
                  Back to home
                </Button>
              </div>
            </div>
          </div>
          <aside className="grid gap-4 lg:sticky lg:top-[140px]">
            <div className={`${CO_CARD} p-[clamp(20px,2.4vw,28px)]`}>
              <h2 className="font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">Order details</h2>
              <div className="mt-3">
                <OrderSummary t={o} lines={o.lines} />
              </div>
            </div>
            {clinic && (
              <div className={`${CO_CARD} p-[clamp(20px,2.4vw,28px)]`}>
                <p className="font-inter text-[12px] font-semibold tracking-[.14em] text-ndm-deep uppercase">Your clinic</p>
                <p className="mt-2 font-aeonik text-[21px] leading-[1.2] text-ndm-ink">NewDermaMed {clinic.name}</p>
                <p className="mt-1 font-inter text-[14px] leading-[1.5] text-ndm-muted">{clinic.address}</p>
                <div className="mt-4">
                  <Button href={tel(clinic.phone)} v="line" sm>
                    Call {clinic.phone}
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
