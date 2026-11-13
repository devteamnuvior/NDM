"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { FIELD } from "@/components/checkout/shared";
import { Button } from "@/components/ui/button";
import { IconChevron } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { SubNav } from "@/components/ui/sub-nav";
import { ACCOUNT_TABS, type AccountOrderRow, type AccountTabId } from "@/config/account";
import { PRODUCTS } from "@/config/shop";
import { CLINICS } from "@/config/site";
import { money } from "@/lib/cart";
import { byId } from "@/lib/dom";
import { contentLink, pageLink } from "@/lib/routes";
import { scrollToY } from "@/lib/smooth-scroll";

/**
 * My account, ported from the prototype's src/account-ui.jsx: a section bar and eight sections of a
 * sample member's account. Sample data only: nothing is loaded from or sent to a server, and the health
 * and consent section shows a status only, never health information (PHIPA).
 */

const PLAN_KEY = "ndm-bf-plan";
interface PlanLine {
  key: string;
  cat: string;
  item: string;
  price: number;
}

const noStore = () => () => {};
/** The Black Friday plan saved in this browser (as text, so the value is stable between renders). */
function readPlan(): string {
  try {
    return localStorage.getItem(PLAN_KEY) || "[]";
  } catch {
    return "[]";
  }
}
function onHash(notify: () => void) {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
}

const isTab = (k: string): k is AccountTabId => ACCOUNT_TABS.some((t) => t.id === k);

const Todo = ({ children = "To confirm" }: { children?: ReactNode }) => <span className="acc-todo">{children}</span>;

function AccCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[24px] bg-white p-[clamp(18px,2.2vw,28px)] ring-1 ring-ndm-ink/[.06] shadow-[0_24px_50px_-42px_rgba(27,36,43,.45)] ${className}`}>{children}</div>;
}

function AccHead({ k, title, text }: { k: string; title: string; text?: string }) {
  return (
    <div className="mb-5">
      <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">{k}</p>
      <h2 className="mt-1.5 font-aeonik text-[clamp(28px,2.6vw,38px)] font-normal leading-[1.08] tracking-[-0.025em] text-ndm-ink">{title}</h2>
      {text && <p className="mt-2 max-w-[60ch] font-inter text-[15px] leading-[1.6] text-ndm-muted">{text}</p>}
    </div>
  );
}

function AccStatus({ s }: { s: string }) {
  const tone = ["Completed", "Delivered", "Approved", "Complete"].includes(s) ? "is-ok" : s === "Booked" || s === "Active" ? "is-on" : "is-wait";
  return <span className={`acc-status ${tone}`}>{s}</span>;
}

/** The booking form's select, as the prototype's `BookSelect`. */
function AccSelect({ value, placeholder, options }: { value: string; placeholder: string; options: string[] }) {
  return (
    <span className="relative block">
      <select required value={value} onChange={() => {}} aria-label={placeholder} className={`${FIELD} co-fld appearance-none pr-10`}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((x) => (
          <option key={x} className="text-ndm-ink">
            {x}
          </option>
        ))}
      </select>
      <IconChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ndm-muted" />
    </span>
  );
}

function AccOrders({ rows }: { rows: AccountOrderRow[] }) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse font-inter text-[14px]">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-[.12em] text-ndm-muted">
            {["Order", "Date", "Items", "Clinic", "Total", "Status", ""].map((h) => (
              <th key={h} className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.no} className="border-b border-ndm-line last:border-0">
              <td className="py-3.5 font-medium text-ndm-ink px-px">{o.no}</td>
              <td className="py-3.5 text-ndm-muted px-px">{o.date}</td>
              <td className="py-3.5 text-ndm-ink px-px">{o.items}</td>
              <td className="py-3.5 text-ndm-muted px-px">{o.clinic}</td>
              {/* a treatment's total is WooCommerce's price; without one (WooCommerce unreachable) the cell stays empty */}
              <td className="py-3.5 tabular-nums text-ndm-ink px-px">{o.priced ? (o.total ? money(o.total) : null) : <Todo>Shop order</Todo>}</td>
              <td className="py-3.5 px-px">
                <AccStatus s={o.status} />
              </td>
              <td className="py-3.5 text-right px-px">
                <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-ndm-deep hover:underline">
                  Receipt
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Tailwind 3 left table cells the browser's own 1px padding, which the prototype's tables keep: stated here */
const TH = "border-b border-ndm-line px-px pt-px pb-2.5 font-semibold";
const H3 = "font-aeonik text-[22px] font-normal text-ndm-ink";
const LABEL = "mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80";
const FLD = `${FIELD} co-fld`;

type NoteId = "orders" | "offers" | "news" | "events";

export function AccountPage({ orders }: { orders: AccountOrderRow[] }) {
  /* the section named in the address ("/account#plans") opens first; a pick on the page then decides */
  const hash = useSyncExternalStore(onHash, () => window.location.hash.slice(1), () => "");
  const [picked, setPicked] = useState<AccountTabId | null>(null);
  const tab: AccountTabId = picked ?? (isTab(hash) ? hash : "dashboard");
  const root = useRef<HTMLElement>(null);
  const go = (k: AccountTabId) => {
    setPicked(k);
    try {
      history.replaceState(null, "", `#${k}`);
    } catch {
      /* the address stays as it is */
    }
    const nav = root.current?.parentElement?.querySelector(".tx-nav");
    const title = byId("acc-title");
    if (nav && title && nav.getBoundingClientRect().top <= 130) scrollToY(title.getBoundingClientRect().top + window.scrollY + 70);
  };

  const planText = useSyncExternalStore(noStore, readPlan, () => "[]");
  const plan = useMemo<PlanLine[]>(() => {
    try {
      const list: unknown = JSON.parse(planText);
      return Array.isArray(list) ? (list as PlanLine[]) : [];
    } catch {
      return [];
    }
  }, [planText]);
  const [wish, setWish] = useState(() => PRODUCTS.slice(0, 6));
  const [notes, setNotes] = useState<Record<NoteId, boolean>>({ orders: true, offers: false, news: true, events: false });

  const tiles: [k: string, v: string, d: string, to: AccountTabId][] = [
    ["Next appointment", "Nov 18", "Uptown, 10:30 am", "plans"],
    ["Premium membership", "Active", "Member since Jan 2026", "membership"],
    ["Saved plans", String(1 + (plan.length ? 1 : 0)), "Ready to book", "plans"],
    ["Health forms", "Complete", "Reviewed at your visit", "forms"],
  ];
  const benefits = [
    ["Member pricing", "Pricing on selected treatments and packages."],
    ["Priority booking", "Earlier access to appointment times."],
    ["Skincare savings", "Savings on clinic skincare from our shop."],
  ];
  const history_ = [
    ["Jan 8, 2026", "Membership started", "Joined"],
    ["Nov 3, 2026", "Member pricing on Microneedling package", "Benefit"],
  ];
  const forms = [
    ["Medical history form", "Reviewed with your provider at your first visit", "Complete"],
    ["Treatment consent", "Signed at the clinic for each treatment", "Complete"],
    ["Photo consent", "Optional, for your own before and after record", "Not given"],
    ["Communication preferences (CASL)", "Manage below in Account details", "Set"],
  ];
  const switches: [k: NoteId, t: string, d: string, lock?: boolean][] = [
    ["orders", "Appointment and order updates", "Confirmations and reminders. Always on for booked appointments.", true],
    ["offers", "Offers and promotions (CASL consent)", "Commercial electronic messages. You can withdraw consent at any time."],
    ["news", "Newsletter", "Skincare tips and clinic news, once a month."],
    ["events", "Events", "Invitations to clinic events and open days."],
  ];

  const items = ACCOUNT_TABS.map(({ id, label, soon }) => ({
    key: id,
    label: (
      <>
        {label}
        {id === "wishlist" ? (
          <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold ${tab === id ? "bg-white text-ndm-deep" : "bg-ndm-deep text-white"}`}>{wish.length}</span>
        ) : soon ? (
          <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${tab === id ? "bg-white/20" : "bg-ndm-mist text-ndm-muted"}`}>{soon}</span>
        ) : null}
      </>
    ),
  }));

  return (
    <>
      <section ref={root} aria-labelledby="acc-title" className="px-[var(--gx)] pb-6 pt-[clamp(8px,1.4vw,20px)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 id="acc-title" className="font-aeonik text-[clamp(36px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.03em] text-ndm-ink">
            My account
          </h1>
          <p className="font-inter text-[14px] text-ndm-muted">
            Signed in as <b className="font-semibold text-ndm-ink">Alex M.</b> ·{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className="text-ndm-deep hover:underline">
              Sign out
            </a>
          </p>
        </div>
      </section>
      <SubNav
        label="Account"
        items={items}
        on={tab}
        onPick={(k, e) => {
          e.preventDefault();
          if (isTab(k)) go(k);
        }}
      />
      <section className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)] pt-[clamp(24px,3vw,40px)]">
        <div>
          <div>
            <div className="min-w-0">
              {tab === "dashboard" && (
                <>
                  <AccHead k="Dashboard" title="Welcome back, Alex" text="Your appointments, plans, orders and membership in one place." />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {tiles.map(([k, v, d, to]) => (
                      <button key={k} type="button" onClick={() => go(to)} className="acc-tile text-left">
                        <span className="font-inter text-[12.5px] text-ndm-muted">{k}</span>
                        <span className="mt-2 block font-aeonik text-[30px] leading-none tracking-[-0.03em] text-ndm-ink">{v}</span>
                        <span className="mt-1.5 block font-inter text-[13px] text-ndm-muted">{d}</span>
                      </button>
                    ))}
                  </div>
                  <AccCard className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className={H3}>Recent orders &amp; receipts</h3>
                      <button type="button" onClick={() => go("orders")} className="font-inter text-[14px] font-medium text-ndm-deep hover:underline">
                        View all
                      </button>
                    </div>
                    <AccOrders rows={orders.slice(0, 2)} />
                  </AccCard>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <AccCard>
                      <h3 className={H3}>Upcoming appointment</h3>
                      <p className="mt-2 font-inter text-[15px] text-ndm-ink">Microneedling-Face, session 1 of 3</p>
                      <p className="mt-1 font-inter text-[14px] text-ndm-muted">Tuesday, November 18 · 10:30 am · Uptown clinic</p>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <Button href="#/book" v="ink" sm>
                          Reschedule
                        </Button>
                        <Button href="#/book" v="line" sm>
                          Add to calendar
                        </Button>
                      </div>
                    </AccCard>
                    <AccCard className="acc-member-mini">
                      <p className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-white/70">Premium membership</p>
                      <p className="mt-2 font-aeonik text-[26px] leading-[1.1] text-white">Member pricing on your plan</p>
                      <p className="mt-2 font-inter text-[14px] text-white/75">See your benefits and renewal date.</p>
                      <button type="button" onClick={() => go("membership")} className="btn btn-glass btn-sm mt-5">
                        Open membership
                      </button>
                    </AccCard>
                  </div>
                </>
              )}

              {tab === "plans" && (
                <>
                  <AccHead k="My plans & saved treatments" title="Book again in a tap" text="Treatment plans you saved, and packages with sessions left." />
                  <div className="grid gap-4 md:grid-cols-2">
                    <AccCard>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className={H3}>Microneedling-Face</h3>
                          <p className="mt-1 font-inter text-[13.5px] text-ndm-muted">Package of 3 · 2 sessions left</p>
                        </div>
                        <AccStatus s="Active" />
                      </div>
                      <div className="acc-meter mt-5" aria-label="1 of 3 sessions used">
                        <i style={{ width: "33%" }} />
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <Button href="#/book" v="book" hot sm>
                          Book Free Consultation
                        </Button>
                        <Button href={contentLink("pricing.html#pg-microneedling-h").href} v="line" sm>
                          View prices
                        </Button>
                      </div>
                    </AccCard>
                    <AccCard>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className={H3}>Black Friday plan</h3>
                          <p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{plan.length ? `${plan.length} treatments, ${money(plan.reduce((n, x) => n + x.price, 0))}` : "Build one on the Black Friday page"}</p>
                        </div>
                        <AccStatus s={plan.length ? "Saved" : "Empty"} />
                      </div>
                      {plan.length > 0 && (
                        <ul className="mt-4 grid gap-1.5 font-inter text-[13.5px] text-ndm-ink" role="list">
                          {plan.slice(0, 4).map((x) => (
                            <li key={x.key}>
                              {x.cat} · {x.item}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <Button href={contentLink("black-friday-sale.html#plan").href} v="ink" sm>
                          {plan.length ? "Open my plan" : "See the deals"}
                        </Button>
                      </div>
                    </AccCard>
                  </div>
                </>
              )}

              {tab === "orders" && (
                <>
                  <AccHead k="Orders & receipts" title="Your orders" text="Treatment requests from the cart and orders from the skincare shop." />
                  <AccCard>
                    <div className="mb-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
                      <input type="search" placeholder="Search orders" className={FLD} aria-label="Search orders" />
                      <AccSelect value="All" placeholder="Status" options={["All", "Booked", "Completed", "Delivered"]} />
                      <AccSelect value="This year" placeholder="Date range" options={["This year", "Last 90 days", "All time"]} />
                    </div>
                    <AccOrders rows={orders} />
                  </AccCard>
                </>
              )}

              {tab === "payment" && (
                <>
                  <AccHead k="Payment methods" title="Coming soon" text="Treatments are paid at your appointment for now. Saved cards and financing will appear here." />
                  <AccCard>
                    <p className="font-inter text-[15px] text-ndm-muted">Flexible payment plans are available through Affirm at the clinic, for Canadian residents aged 19 and over, with a minimum $500 purchase.</p>
                  </AccCard>
                </>
              )}

              {tab === "membership" && (
                <>
                  <AccHead k="Premium membership" title="Your NewDermaMed membership" text="A membership for our patients, used only at our Uptown and Downtown clinics." />
                  <div className="acc-member relative overflow-hidden rounded-[28px] p-[clamp(22px,3vw,40px)] text-white">
                    <span aria-hidden="true" className="acc-member-glow" />
                    <div className="relative flex flex-wrap items-end justify-between gap-6">
                      <div>
                        <p className="font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/70">NewDermaMed Premium</p>
                        <p className="mt-3 font-aeonik text-[clamp(34px,3.4vw,48px)] leading-none tracking-[-0.03em]">Alex M.</p>
                        <p className="mt-2 font-inter text-[14px] text-white/75">
                          Member since January 2026 · Renews <Todo>date</Todo>
                        </p>
                      </div>
                      <AccStatus s="Active" />
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {benefits.map(([t, d]) => (
                      <AccCard key={t}>
                        <h3 className="font-aeonik text-[21px] font-normal text-ndm-ink">{t}</h3>
                        <p className="mt-2 font-inter text-[14px] leading-[1.55] text-ndm-muted">{d}</p>
                        <p className="mt-3">
                          <Todo />
                        </p>
                      </AccCard>
                    ))}
                  </div>
                  <AccCard className="mt-5">
                    <h3 className={H3}>Membership history</h3>
                    <div className="no-scrollbar mt-3 overflow-x-auto">
                      <table className="w-full min-w-[520px] font-inter text-[14px]">
                        <thead>
                          <tr className="text-left text-[12px] uppercase tracking-[.12em] text-ndm-muted">
                            {["Date", "Description", "Type"].map((h) => (
                              <th key={h} className={TH}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {history_.map((r) => (
                            <tr key={r[1]} className="border-b border-ndm-line last:border-0">
                              {r.map((c, i) => (
                                <td key={i} className="py-3 text-ndm-ink px-px">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 font-inter text-[13px] text-ndm-muted">
                      Membership price, benefits and terms are being finalised by the clinic <Todo />
                    </p>
                  </AccCard>
                </>
              )}

              {tab === "wishlist" && (
                <>
                  <AccHead k="Wishlist" title={`${wish.length} saved products`} text="Clinic skincare you saved from our online shop." />
                  {wish.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {wish.map((p) => (
                        <div key={p.href} className="flex items-center gap-3 rounded-[18px] bg-white p-3 ring-1 ring-ndm-ink/[.06]">
                          <span className="grid size-[68px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-ndm-mist">
                            {/* eslint-disable-next-line @next/next/no-img-element -- a photo on the shop's own site, as in the prototype */}
                            <img src={p.image} alt="" loading="lazy" className="h-[86%] w-[86%] object-contain" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-inter text-[14.5px] capitalize text-ndm-ink">{p.name}</span>
                            <span className="block font-inter text-[13px] text-ndm-muted">{p.size}</span>
                            <span className="mt-1.5 flex gap-3 font-inter text-[13px]">
                              <a href={p.href} target="_blank" rel="noopener" className="font-medium text-ndm-deep hover:underline">
                                Shop
                              </a>
                              <button type="button" onClick={() => setWish(wish.filter((x) => x.href !== p.href))} className="text-ndm-muted hover:text-ndm-ink">
                                Remove
                              </button>
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <AccCard>
                      <p className="font-inter text-[15px] text-ndm-muted">
                        Your wishlist is empty.{" "}
                        <button type="button" onClick={() => setWish(PRODUCTS.slice(0, 6))} className="text-ndm-deep hover:underline">
                          Restore sample items (prototype only)
                        </button>
                      </p>
                    </AccCard>
                  )}
                </>
              )}

              {tab === "forms" && (
                <>
                  <AccHead k="Health & consent forms" title="Before your treatment" text="Status only. Your health history is reviewed in person by your provider and is never shown here." />
                  <div className="grid gap-3">
                    {forms.map(([t, d, s]) => (
                      <AccCard key={t} className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-inter text-[15.5px] font-semibold text-ndm-ink">{t}</h3>
                          <p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{d}</p>
                        </div>
                        <AccStatus s={s} />
                      </AccCard>
                    ))}
                  </div>
                  <p className="mt-4 font-inter text-[13px] text-ndm-muted">
                    Questions about your records? See our{" "}
                    <SiteLink to={pageLink("privacy")} className="text-ndm-deep hover:underline">
                      Privacy Policy
                    </SiteLink>
                    .
                  </p>
                </>
              )}

              {tab === "details" && (
                <>
                  <AccHead k="Account details" title="Your profile" />
                  <form onSubmit={(e) => e.preventDefault()} className="grid gap-5">
                    <AccCard>
                      <h3 className={H3}>Profile</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label>
                          <span className={LABEL}>First name</span>
                          <input defaultValue="Alex" className={FLD} />
                        </label>
                        <label>
                          <span className={LABEL}>Last name</span>
                          <input defaultValue="M." className={FLD} />
                        </label>
                        <label>
                          <span className={LABEL}>Email</span>
                          <input type="email" defaultValue="alex@example.com" className={FLD} />
                        </label>
                        <label>
                          <span className={LABEL}>Phone</span>
                          <input type="tel" defaultValue="" placeholder="Optional" className={FLD} />
                        </label>
                        <label className="sm:col-span-2">
                          <span className={LABEL}>Preferred clinic</span>
                          <AccSelect value="Uptown" placeholder="Clinic" options={CLINICS.map((c) => c.name)} />
                        </label>
                      </div>
                      <div className="mt-5">
                        <Button as="button" type="submit" v="ink" sm>
                          Save changes
                        </Button>
                      </div>
                    </AccCard>
                    <AccCard>
                      <h3 className={H3}>Password</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {["Current password", "New password", "Confirm new password"].map((x) => (
                          <label key={x}>
                            <span className={LABEL}>{x}</span>
                            <input type="password" autoComplete="off" className={FLD} />
                          </label>
                        ))}
                      </div>
                      <div className="mt-5">
                        <Button as="button" type="submit" v="line" sm>
                          Update password
                        </Button>
                      </div>
                    </AccCard>
                    <AccCard>
                      <h3 className={H3}>Notifications</h3>
                      <ul className="mt-3 divide-y divide-ndm-line" role="list">
                        {switches.map(([k, t, d, lock]) => (
                          <li key={k} className="flex items-start justify-between gap-4 py-3.5">
                            <span>
                              <span className="block font-inter text-[15px] font-medium text-ndm-ink">{t}</span>
                              <span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">{d}</span>
                            </span>
                            <button type="button" role="switch" aria-checked={notes[k]} disabled={lock} onClick={() => setNotes({ ...notes, [k]: !notes[k] })} className={`acc-switch ${notes[k] ? "is-on" : ""}`}>
                              <i />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AccCard>
                  </form>
                </>
              )}
            </div>
          </div>
          <p className="mt-10 font-inter text-[12.5px] text-ndm-muted">Prototype: sample account data only. Nothing is loaded from or sent to a server.</p>
        </div>
      </section>
    </>
  );
}
