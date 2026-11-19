"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { placeOrderAction, type OrderRequestForm } from "@/app/(site)/checkout/actions";
import { Button } from "@/components/ui/button";
import { ORDER_STORAGE_KEY, PROVINCES } from "@/config/checkout";
import { CLINICS } from "@/config/site";
import { useCart } from "@/hooks/use-cart";
import { checkCart, clearCart, type CartLine } from "@/lib/cart";
import { pushLead } from "@/lib/lead-event";
import { pagePath } from "@/lib/routes";
import { CO_CARD, CO_WRAP, CartPairs, CoAlert, CoHead, CoSelect, CodeField, FIELD, IconLock, OrderSummary, RemovedNotice, money2, totalsOf, useCartTax, useInBrowser, useSaleCode } from "./shared";
import { withBase } from "@/lib/base-path";

const STEP_HEAD: [lead: string, strong: string, text: string][] = [
  ["Your", "details", "Your details are used only to arrange your treatment."],
  ["How you", "pay", "Pay online by card on our secure payment page."],
];

const legend = "font-aeonik text-[20px] font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink";
const label = "mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80";
const fld = `${FIELD} co-fld`;
const block = "co-fs";
/** The small tag on a way to pay. */
const payTag = "rounded-full bg-ndm-deep/8 px-2.5 py-1 font-inter text-[11.5px] leading-none font-semibold whitespace-nowrap text-ndm-deep";

/**
 * 2. Checkout: details (with the clinic), then payment with the note and the terms. The appointment step (preferred day and time) and the review step were taken out on the user's request (2026-11-18). Placing the request sends the chosen WooCommerce
 * IDs and quantities with the visitor's details to the server, which creates the order in WooCommerce
 * at WooCommerce's own prices, then sends the visitor to WooCommerce's pay page for the order, where the
 * card is taken. Card is the only way to pay ("Pay at your appointment" was removed on the user's request,
 * 2026-11-19); while WooCommerce's card gateway is off (`card` false) no order can be placed.
 * Card details never reach this site.
 */
export function CheckoutPage({ pairs, card }: { pairs: Omit<CartLine, "qty">[]; card: boolean }) {
  const cart = useCart();
  const router = useRouter();
  const ready = useInBrowser();
  const code = useSaleCode(cart.lines);
  const t = totalsOf(cart.lines, code.applied, useCartTax());
  const [apt, setApt] = useState(false);
  const [province, setProvince] = useState("Ontario");
  const [clinic, setClinic] = useState("Uptown");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0); /* 0 details (with the clinic), 1 payment */
  const [miss, setMiss] = useState(false);
  const [failure, setFailure] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const empty = cart.lines.length === 0;
  const head = STEP_HEAD[step];

  const place = async () => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const field = (name: string) => String(fd.get(name) ?? "").trim();
    const request: OrderRequestForm = {
      lines: cart.lines.map((l) => ({ productId: l.productId ?? 0, variationId: l.variationId ?? 0, qty: l.qty })),
      first: field("first"),
      last: field("last"),
      email: field("email"),
      phone: field("phone"),
      address: field("address"),
      apt: field("apt"),
      city: field("city"),
      province,
      postal: field("postal"),
      clinic,
      note: field("note"),
      agree: fd.get("agree") === "on",
      code: code.applied,
    };
    setBusy(true);
    setFailure("");
    let result;
    try {
      result = await placeOrderAction(request);
    } catch {
      result = { ok: false as const, reason: "unreachable" as const, message: "Your request could not be sent right now. Nothing was placed; please try again in a moment, or call the clinic." };
    }
    if (!result.ok) {
      setBusy(false);
      setFailure(result.message);
      if (result.reason === "unavailable") void checkCart(); /* show what WooCommerce says now */
      return;
    }
    try {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(result.order));
    } catch {
      /* storage blocked: the confirmation shows a general message */
    }
    clearCart();
    /* the lead event for Tag Manager (lib/lead-event.ts), sent before the page changes: no order details */
    const payUrl = result.order.method === "card" ? result.order.payUrl : undefined;
    pushLead("checkout", { orderMethod: payUrl ? "card" : "clinic" }, () => {
      /* card: WooCommerce's pay page takes the card, then sends the visitor back to the confirmation */
      if (payUrl) window.location.assign(payUrl);
      else router.push(pagePath("orderConfirmed"));
    });
  };

  const next = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    const fs = form?.querySelector(`[data-step="${step}"]`);
    const bad = fs ? [...fs.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea")].filter((x) => !x.disabled && !x.checkValidity()) : [];
    if (bad.length) {
      setMiss(true);
      bad[0].reportValidity();
      return;
    }
    setMiss(false);
    if (step < 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    void place();
  };

  return (
    <section aria-labelledby="co-title" className={`co-band ${CO_WRAP}`}>
      <CoHead at={1 + step} lead={head[0]} strong={head[1]} text={head[2]} onStep={(i) => setStep(Math.min(step, i))} />
      <RemovedNotice />
      {!ready ? null : empty ? (
        <div className={`${CO_CARD} mt-7 flex flex-col items-center px-6 py-14 text-center`}>
          <h2 className="font-aeonik text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-normal text-ndm-ink">There is nothing to check out yet</h2>
          <p className="mt-3 max-w-[42ch] font-inter text-[15px] text-ndm-muted">Add a treatment from the price list first.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href={`${pagePath("pricing")}#prices`} v="ink">
              Browse prices
            </Button>
            <Button href={pagePath("cart")} v="line">
              Back to cart
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          {/* phones: the order summary folds above the form */}
          <details className={`co-sum ${CO_CARD} px-5 py-4 lg:hidden`}>
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-inter text-[14.5px] font-medium text-ndm-deep">
              <span>Show order summary</span>
              <span className="font-aeonik text-[20px] text-ndm-ink tabular-nums">{money2(t.total)}</span>
            </summary>
            <div className="mt-2">
              <OrderSummary t={t} lines={cart.lines} />
            </div>
          </details>

          <form ref={formRef} onSubmit={next} noValidate className={`${CO_CARD} co-form grid gap-5 p-[clamp(18px,2.4vw,32px)]`}>
            <div data-step="0" className={step === 0 ? "grid gap-5" : "hidden"}>
              <fieldset className={block}>
                <legend className={legend}>Contact information</legend>
                <p className="mt-0.5 font-inter text-[13px] text-ndm-muted">You are checking out as a guest.</p>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  <label>
                    <span className={label}>First name</span>
                    <input required name="first" autoComplete="given-name" maxLength={60} className={fld} />
                  </label>
                  <label>
                    <span className={label}>Last name</span>
                    <input required name="last" autoComplete="family-name" maxLength={60} className={fld} />
                  </label>
                  <label className="col-span-2 sm:col-span-1">
                    <span className={label}>Email address</span>
                    <input required type="email" name="email" autoComplete="email" maxLength={120} className={fld} />
                  </label>
                  <label className="col-span-2 sm:col-span-1">
                    {/* required: the card processor refuses a payment without a phone number (Bambora 314, 2026-11-18) */}
                    <span className={label}>Phone</span>
                    <input required type="tel" name="phone" autoComplete="tel" maxLength={30} pattern="(?:\D*\d){7,}\D*" title="A phone number with at least 7 digits" className={fld} />
                  </label>
                </div>
                {/* no hidden anti-robot field here (user, 2026-11-18): browser autofill filled it and real customers were turned away */}
              </fieldset>

              <fieldset className={block}>
                <legend className={legend}>Billing address</legend>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-6">
                  <label className="col-span-2 sm:col-span-4">
                    <span className={label}>Address</span>
                    <input required name="address" autoComplete="street-address" maxLength={120} className={fld} />
                  </label>
                  <label className="col-span-2 sm:col-span-2">
                    <span className={label}>Country</span>
                    <input readOnly value="Canada" className={`${fld} bg-ndm-mist text-ndm-muted`} />
                  </label>
                  {apt ? (
                    <label className="col-span-2 sm:col-span-6">
                      <span className={label}>
                        Apartment, suite, etc. <span className="font-normal text-ndm-muted">(optional)</span>
                      </span>
                      <input name="apt" autoComplete="address-line2" maxLength={60} className={fld} />
                    </label>
                  ) : (
                    <button type="button" onClick={() => setApt(true)} className="col-span-2 justify-self-start font-inter text-[14px] font-medium text-ndm-deep hover:underline sm:col-span-6">
                      + Add apartment, suite, etc.
                    </button>
                  )}
                  <label className="col-span-2 sm:col-span-2">
                    <span className={label}>City</span>
                    <input required name="city" autoComplete="address-level2" maxLength={60} className={fld} />
                  </label>
                  <label className="sm:col-span-2">
                    <span className={label}>Province</span>
                    <CoSelect name="province" value={province} onChange={setProvince} placeholder="Select a province">
                      {PROVINCES.map((x) => (
                        <option key={x} className="text-ndm-ink">
                          {x}
                        </option>
                      ))}
                    </CoSelect>
                  </label>
                  <label className="sm:col-span-2">
                    <span className={label}>Postal code</span>
                    <input required name="postal" autoComplete="postal-code" maxLength={7} pattern="[A-Za-z]\d[A-Za-z][ \-]?\d[A-Za-z]\d" title="A Canadian postal code such as M2N 5M5" className={`${fld} uppercase`} />
                  </label>
                </div>
              </fieldset>

              <fieldset className={block}>
                <legend className={legend}>Your clinic</legend>
                <p className="mt-0.5 font-inter text-[13px] text-ndm-muted">Where you would like your treatment.</p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {CLINICS.map((c) => (
                    <label key={c.name} className={`co-opt ${clinic === c.name ? "is-on" : ""}`}>
                      <input type="radio" name="clinic" value={c.name} checked={clinic === c.name} onChange={() => setClinic(c.name)} className="mt-1 size-4 shrink-0 accent-[#0F80C3]" />
                      <span>
                        <span className="block font-inter text-[14.5px] font-semibold text-ndm-ink">NewDermaMed {c.name}</span>
                        <span className="mt-0.5 block font-inter text-[12.5px] leading-[1.45] text-ndm-muted">{c.address}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div data-step="1" className={step === 1 ? "grid gap-6" : "hidden"}>
              <fieldset className={block}>
                <legend className={legend}>Payment method</legend>
                <p className="mt-0.5 font-inter text-[13px] text-ndm-muted">Every order is paid online by card.</p>
                {card ? (
                  <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="co-opt is-on p-4!">
                        <input type="radio" name="pay" value="card" checked readOnly className="mt-0.5 size-[18px] shrink-0 accent-[#0F80C3]" />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                            <span className="font-inter text-[15px] font-semibold text-ndm-ink">Card payment online</span>
                            <span className={payTag}>Visa · Mastercard</span>
                          </span>
                          <span className="mt-1.5 block font-inter text-[13px] leading-[1.5] text-ndm-muted">Pay now on our secure payment page, processed by Bambora.</span>
                        </span>
                      </label>
                    </div>
                    <CoAlert tone="ok" className="mt-3">
                      Next you go to our secure payment page to enter your card. Your order is charged there, by Bambora.
                    </CoAlert>
                  </>
                ) : (
                  <CoAlert tone="err" className="mt-4" title="Card payment is not available right now">
                    Your order cannot be placed online at the moment. Please try again later, or call the clinic.
                  </CoAlert>
                )}
              </fieldset>

              <fieldset className={block}>
                <legend className={legend}>Additional information</legend>
                <label className="mt-3 block">
                  <span className={label}>
                    Note for our team <span className="font-normal text-ndm-muted">(optional)</span>
                  </span>
                  <textarea name="note" rows={3} maxLength={500} className={`${fld} h-auto resize-none py-2.5`} />
                </label>
                <p className="mt-2 font-inter text-[12.5px] leading-[1.5] text-ndm-muted">Please don’t include medical details here. Your provider reviews your health history in person at your consultation.</p>
              </fieldset>

              <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-ndm-ink/12 bg-ndm-paper px-4 py-3.5 font-inter text-[13.5px] leading-[1.5] text-ndm-ink">
                <input type="checkbox" required name="agree" className="mt-0.5 size-[18px] shrink-0 accent-[#0F80C3]" />
                <span>
                  I accept the{" "}
                  <a href={withBase(pagePath("terms"))} className="font-medium text-ndm-deep underline-offset-4 hover:underline">
                    Terms of Service
                  </a>
                  , the{" "}
                  <a href={withBase(pagePath("privacy"))} className="font-medium text-ndm-deep underline-offset-4 hover:underline">
                    Privacy Policy
                  </a>{" "}
                  and the{" "}
                  <a href={withBase(pagePath("refunds"))} className="font-medium text-ndm-deep underline-offset-4 hover:underline">
                    Refund Policy
                  </a>
                  .
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-ndm-ink/10 pt-5">
              {miss && (
                <CoAlert tone="err" title="A few details are missing">
                  Please fill in the highlighted field to continue.
                </CoAlert>
              )}
              {failure && (
                <CoAlert tone="err" title="Your request was not placed">
                  {failure}
                </CoAlert>
              )}
              <p className="font-inter text-[12.5px] text-ndm-muted">Step {step + 1} of 2</p>
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMiss(false);
                      setFailure("");
                      setStep(step - 1);
                    }}
                    className="btn btn-line sm:w-auto"
                  >
                    Back
                  </button>
                ) : (
                  <a href={withBase(pagePath("cart"))} className="btn btn-line sm:w-auto">
                    Back to cart
                  </a>
                )}
                <span className="sm:flex-1">
                  <Button as="button" type="submit" v="ink" block disabled={busy || (step === 1 && !card)}>
                    {busy ? "Placing your order…" : step < 1 ? "Continue to payment" : `Continue to card payment · ${money2(t.total)}`}
                  </Button>
                </span>
              </div>
              <p className="flex items-center justify-center gap-2 font-inter text-[12.5px] text-ndm-muted">
                <IconLock />
                Your card is entered on our secure payment page
              </p>
            </div>
          </form>

          <aside className="co-side grid gap-4" aria-label="Order summary" data-lenis-prevent="">
            <div className={`${CO_CARD} hidden p-[clamp(20px,2.4vw,28px)] lg:block`}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">Order summary</h2>
                <a href={withBase(pagePath("cart"))} className="font-inter text-[13.5px] font-medium text-ndm-deep hover:underline">
                  Edit cart
                </a>
              </div>
              <div className="mt-3">
                <OrderSummary t={t} lines={cart.lines} scroll />
                <CodeField lines={cart.lines} />
              </div>
            </div>
            <div className={`${CO_CARD} p-[clamp(18px,2.2vw,24px)]`}>
              <CartPairs pairs={pairs} compact max={2} kicker="Before you finish" title="Add to your plan" />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
