"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { placeOrderAction, type OrderRequestForm } from "@/app/(site)/checkout/actions";
import { Button } from "@/components/ui/button";
import { ORDER_STORAGE_KEY, PROVINCES, TIMES_OF_DAY } from "@/config/checkout";
import { CLINICS } from "@/config/site";
import { useCart } from "@/hooks/use-cart";
import { checkCart, clearCart, type CartLine } from "@/lib/cart";
import { pagePath } from "@/lib/routes";
import { CO_CARD, CO_WRAP, CartPairs, CoAlert, CoHead, CoSelect, FIELD, IconLock, OrderSummary, RemovedNotice, money2, totalsOf, useInBrowser } from "./shared";

const STEP_HEAD: [lead: string, strong: string, text: string][] = [
  ["Your", "details", "Your details are used only to arrange your treatment."],
  ["Your", "appointment", "Pick your clinic and a preferred time. We confirm it by email and text."],
  ["How you", "pay", "Nothing is charged online: you pay at the clinic once your provider confirms your plan."],
  ["Review your", "request", "Check everything, then place your request."],
];

const legend = "font-aeonik text-[20px] font-normal leading-[1.2] tracking-[-0.01em] text-ndm-ink";
const label = "mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80";
const fld = `${FIELD} co-fld`;
const block = "co-fs";

/**
 * 2. Checkout: details, appointment, payment (at the clinic), review. Placing the request sends the
 * chosen WooCommerce IDs and quantities with the visitor's details to the server, which creates the
 * order in WooCommerce at WooCommerce's own prices. Nothing is charged online.
 */
export function CheckoutPage({ pairs }: { pairs: Omit<CartLine, "qty">[] }) {
  const cart = useCart();
  const router = useRouter();
  const ready = useInBrowser();
  const t = totalsOf(cart.lines);
  const [apt, setApt] = useState(false);
  const [province, setProvince] = useState("Ontario");
  const [clinic, setClinic] = useState("Uptown");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0); /* 0 details, 1 appointment, 2 payment, 3 review */
  const [when, setWhen] = useState({ day: "", time: "Morning", call: false });
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [miss, setMiss] = useState(false);
  const [failure, setFailure] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const empty = cart.lines.length === 0;

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
      day: when.call ? "" : when.day,
      time: when.time,
      call: when.call,
      note: field("note"),
      agree: fd.get("agree") === "on",
      company: field("company"),
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
    router.push(pagePath("orderConfirmed"));
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
    if (form) setSeen(Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, String(v)])));
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    void place();
  };

  const review: [key: string, value: string, go: number][] = [
    ["Name", `${seen.first ?? ""} ${seen.last ?? ""}`.trim(), 0],
    ["Email", seen.email ?? "", 0],
    ["Clinic", `NewDermaMed ${clinic}`, 1],
    ["Preferred time", when.call ? "Call me to find a time" : `${when.day || "Any day"}, ${when.time.toLowerCase()}`, 1],
    ["Payment", "Pay at your appointment", 2],
    ["Treatments", `${cart.lines.length} in your cart, ${money2(t.total)} estimated`, -1],
  ];

  return (
    <section aria-labelledby="co-title" className={`co-band ${CO_WRAP}`}>
      <CoHead at={1 + step} lead={STEP_HEAD[step][0]} strong={STEP_HEAD[step][1]} text={STEP_HEAD[step][2]} onStep={(i) => setStep(Math.min(step, i))} />
      <RemovedNotice />
      {!ready ? null : empty ? (
        <div className={`${CO_CARD} mt-10 flex flex-col items-center px-6 py-14 text-center`}>
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
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
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
                    <span className={label}>
                      Phone <span className="font-normal text-ndm-muted">(optional)</span>
                    </span>
                    <input type="tel" name="phone" autoComplete="tel" maxLength={30} className={fld} />
                  </label>
                </div>
                {/* not for people: left empty, it tells a person from a form-filling robot */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
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
            </div>

            <div data-step="1" className={step === 1 ? "grid gap-5" : "hidden"}>
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

              <fieldset className={block}>
                <legend className={legend}>Preferred time</legend>
                <p className="mt-0.5 font-inter text-[13px] text-ndm-muted">Mondays to Saturdays. We confirm the exact time with you.</p>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  <label>
                    <span className={label}>Preferred day</span>
                    <input type="date" name="day" required={!when.call} disabled={when.call} value={when.day} onChange={(e) => setWhen({ ...when, day: e.target.value })} className={fld} />
                  </label>
                  <label>
                    <span className={label}>Time of day</span>
                    <CoSelect name="time" value={when.time} onChange={(time) => setWhen({ ...when, time })} placeholder="Choose">
                      {TIMES_OF_DAY.map((x) => (
                        <option key={x} className="text-ndm-ink">
                          {x}
                        </option>
                      ))}
                    </CoSelect>
                  </label>
                  <label className="col-span-2 flex items-center gap-2.5 font-inter text-[14px] text-ndm-ink">
                    <input type="checkbox" name="call" checked={when.call} onChange={(e) => setWhen({ ...when, call: e.target.checked })} className="size-4 accent-[#0F80C3]" />
                    Call me to find a time instead
                  </label>
                </div>
              </fieldset>
            </div>

            <div data-step="2" className={step === 2 ? "grid gap-5" : "hidden"}>
              <fieldset className={block}>
                <legend className={legend}>Payment</legend>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <label className="co-opt is-on">
                    <input type="radio" name="pay" value="clinic" defaultChecked className="mt-1 size-4 shrink-0 accent-[#0F80C3]" />
                    <span>
                      <span className="block font-inter text-[14.5px] font-semibold text-ndm-ink">Pay at your appointment</span>
                      <span className="mt-0.5 block font-inter text-[12.5px] leading-[1.45] text-ndm-muted">Nothing is charged online. You pay at the clinic once your provider confirms your plan.</span>
                    </span>
                  </label>
                  <div className="co-opt is-off" aria-disabled="true">
                    <span aria-hidden="true" className="mt-1 size-4 shrink-0 rounded-full border border-ndm-ink/25" />
                    <span>
                      <span className="block font-inter text-[15px] font-semibold text-ndm-muted">Card payment online</span>
                      <span className="mt-0.5 block font-inter text-[12.5px] leading-[1.45] text-ndm-muted">Not available online.</span>
                    </span>
                  </div>
                </div>
              </fieldset>
            </div>

            <div data-step="3" className={step === 3 ? "grid gap-5" : "hidden"}>
              <fieldset className={block}>
                <legend className={legend}>Your request</legend>
                <dl className="mt-3 grid gap-2 rounded-[16px] bg-ndm-mist/70 p-4 font-inter text-[14px]">
                  {review.map(([k, v, go]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4">
                      <dt className="text-ndm-muted">{k}</dt>
                      <dd className="flex items-baseline gap-3 text-right text-ndm-ink">
                        {v || "-"}
                        {go >= 0 ? (
                          <button type="button" onClick={() => setStep(go)} className="font-medium text-ndm-deep hover:underline">
                            Edit
                          </button>
                        ) : (
                          <a href={pagePath("cart")} className="font-medium text-ndm-deep hover:underline">
                            Edit
                          </a>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </fieldset>
              <fieldset className={block}>
                <legend className={legend}>Additional information</legend>
                <label className="mt-3 block">
                  <span className={label}>
                    Note for our team <span className="font-normal text-ndm-muted">(optional)</span>
                  </span>
                  <textarea name="note" rows={2} maxLength={500} className={`${fld} h-auto resize-none py-2.5`} />
                </label>
                <p className="mt-2.5 rounded-[12px] bg-ndm-mist px-3.5 py-2.5 font-inter text-[12.5px] leading-[1.5] text-ndm-muted">Please don’t include medical details here. Your provider reviews your health history in person at your consultation.</p>
              </fieldset>

              <label className="flex items-start gap-2.5 font-inter text-[13.5px] leading-[1.5] text-ndm-ink">
                <input type="checkbox" required name="agree" className="mt-0.5 size-4 shrink-0 accent-[#0F80C3]" />
                <span>
                  I accept the{" "}
                  <a href={pagePath("terms")} className="text-ndm-deep underline-offset-4 hover:underline">
                    Terms of Service
                  </a>
                  , the{" "}
                  <a href={pagePath("privacy")} className="text-ndm-deep underline-offset-4 hover:underline">
                    Privacy Policy
                  </a>{" "}
                  and the{" "}
                  <a href={pagePath("refunds")} className="text-ndm-deep underline-offset-4 hover:underline">
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
              {step === 1 && <CoAlert tone="warn">Your preferred time is a request. Our team confirms the exact time with you by email and text.</CoAlert>}
              {step === 2 && <CoAlert tone="ok">Nothing is charged online. You pay at the clinic once your provider confirms your plan.</CoAlert>}
              <p className="font-inter text-[12.5px] text-ndm-muted">Step {step + 1} of 4</p>
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
                  <a href={pagePath("cart")} className="btn btn-line sm:w-auto">
                    Back to cart
                  </a>
                )}
                <span className="sm:flex-1">
                  <Button as="button" type="submit" v="ink" block disabled={busy}>
                    {busy ? "Placing your request…" : step < 3 ? `Continue to ${["appointment", "payment", "review"][step]}` : `Place order request · ${money2(t.total)}`}
                  </Button>
                </span>
              </div>
              <p className="flex items-center justify-center gap-2 font-inter text-[12.5px] text-ndm-muted">
                <IconLock />
                Nothing is charged online
              </p>
            </div>
          </form>

          <aside className="co-side grid gap-4" aria-label="Order summary" data-lenis-prevent="">
            <div className={`${CO_CARD} hidden p-[clamp(20px,2.4vw,28px)] lg:block`}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-aeonik text-[24px] font-normal tracking-[-0.01em] text-ndm-ink">Order summary</h2>
                <a href={pagePath("cart")} className="font-inter text-[13.5px] font-medium text-ndm-deep hover:underline">
                  Edit cart
                </a>
              </div>
              <div className="mt-3">
                <OrderSummary t={t} lines={cart.lines} scroll />
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
