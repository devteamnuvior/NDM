"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore, useTransition, type FormEvent, type ReactNode } from "react";
import { changePasswordAction, saveNotifyAction, saveProfileAction, signOutAction, type AccountResult } from "@/app/(site)/account/actions";
import { AccNote } from "@/components/account/account-sign-in";
import { FIELD } from "@/components/checkout/shared";
import { Button } from "@/components/ui/button";
import { IconChevron } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { SubNav } from "@/components/ui/sub-nav";
import { ACCOUNT_TABS, type AccountTabId } from "@/config/account";
import { CLINICS } from "@/config/site";
import { money } from "@/lib/cart";
import { byId } from "@/lib/dom";
import { contentLink, pageLink } from "@/lib/routes";
import type { AccountData, AccountNotify, AccountOrder } from "@/lib/wordpress/account";
import { scrollToY } from "@/lib/smooth-scroll";

/**
 * My account, after the prototype's src/account-ui.jsx: a section bar and the sections of a signed-in
 * WooCommerce customer's account (details, notification choices, password, orders). Appointments and
 * Premium membership are left out for now; no health information is ever shown here (PHIPA).
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
/* The section named in the address, as it was when the page opened and after each change the visitor
   makes to it. Read once and then only on "hashchange": after a saved change the framework puts its own
   idea of the address back, and the open section must not jump with it. */
let seenHash: string | null = null;
function onHash(notify: () => void) {
  const read = () => {
    seenHash = window.location.hash.slice(1);
    notify();
  };
  seenHash = window.location.hash.slice(1);
  window.addEventListener("hashchange", read);
  return () => window.removeEventListener("hashchange", read);
}
const readHash = (): string => (seenHash ??= window.location.hash.slice(1));

const isTab = (k: string): k is AccountTabId => ACCOUNT_TABS.some((t) => t.id === k);

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

/** An order's status as WooCommerce names it: green when done, blue while the clinic works on it. */
function AccStatus({ s, tone }: { s: string; tone?: string }) {
  const cls = tone === "completed" ? "is-ok" : tone === "processing" || s === "Saved" ? "is-on" : "is-wait";
  return <span className={`acc-status ${cls}`}>{s}</span>;
}

/** The booking form's select, as the prototype's `BookSelect`. */
function AccSelect({ name, value, onChange, placeholder, options }: { name?: string; value: string; onChange: (value: string) => void; placeholder: string; options: string[] }) {
  return (
    <span className="relative block">
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} className={`${FIELD} co-fld appearance-none pr-10`}>
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

const DAY = new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Toronto" });
const orderDay = (o: AccountOrder): string => DAY.format(new Date(o.date));
const orderItems = (o: AccountOrder): string => o.items.map((i) => (i.qty > 1 ? `${i.name} × ${i.qty}` : i.name)).join("; ");
const orderClinic = (o: AccountOrder): string => o.clinic.replace(/^NewDermaMed\s+/, "");

function AccOrders({ rows }: { rows: AccountOrder[] }) {
  return (
    <div className="no-scrollbar overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse font-inter text-[14px]">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-[.12em] text-ndm-muted">
            {["Order", "Date", "Items", "Clinic", "Total", "Status"].map((h) => (
              <th key={h} className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.number} className="border-b border-ndm-line last:border-0">
              <td className="py-3.5 font-medium text-ndm-ink px-px">{o.number}</td>
              <td className="py-3.5 whitespace-nowrap text-ndm-muted px-px">{orderDay(o)}</td>
              <td className="py-3.5 pr-3 text-ndm-ink px-px">{orderItems(o)}</td>
              <td className="py-3.5 text-ndm-muted px-px">{orderClinic(o)}</td>
              {/* the order's own total in WooCommerce */}
              <td className="py-3.5 tabular-nums text-ndm-ink px-px">{money(o.total)}</td>
              <td className="py-3.5 px-px">
                <AccStatus s={o.statusName} tone={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NoOrders() {
  return (
    <p className="font-inter text-[15px] leading-[1.6] text-ndm-muted">
      No orders yet. Order requests you place while signed in appear here.{" "}
      <SiteLink to={pageLink("pricing")} className="font-medium text-ndm-deep hover:underline">
        See treatments and prices
      </SiteLink>
    </p>
  );
}

/* Tailwind 3 left table cells the browser's own 1px padding, which the prototype's tables keep: stated here */
const TH = "border-b border-ndm-line px-px pt-px pb-2.5 font-semibold";
const H3 = "font-aeonik text-[22px] font-normal text-ndm-ink";
const LABEL = "mb-1 block font-inter text-[12.5px] font-medium text-ndm-ink/80";
const FLD = `${FIELD} co-fld`;
const NO_CLINIC = "No preference";

type NoteId = "orders" | keyof AccountNotify;
const RANGES = ["All time", "This year", "Last 90 days"];

export function AccountPage({ account }: { account: AccountData }) {
  const router = useRouter();
  /* the section named in the address ("/account#plans") opens first; a pick on the page then decides */
  const hash = useSyncExternalStore(onHash, readHash, () => "");
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

  const { orders } = account;
  const [busy, start] = useTransition();
  /** Runs a change; a sign-in that has ended sends the visitor back to the sign-in. */
  const run = (action: () => Promise<AccountResult>, done: (r: AccountResult) => void) =>
    start(async () => {
      const r = await action();
      done(r);
      if (r.ok || r.signedOut) router.refresh();
    });

  /* orders: search, status and date range, worked out in the browser from the customer's own list */
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [range, setRange] = useState(RANGES[0]);
  const statuses = useMemo(() => ["All", ...Array.from(new Set(orders.map((o) => o.statusName)))], [orders]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    return orders.filter((o) => {
      if (status !== "All" && o.statusName !== status) return false;
      const when = new Date(o.date);
      if (range === "This year" && when.getFullYear() !== now.getFullYear()) return false;
      if (range === "Last 90 days" && now.getTime() - when.getTime() > 90 * 86_400_000) return false;
      return !q || `${o.number} ${orderItems(o)} ${o.clinic}`.toLowerCase().includes(q);
    });
  }, [orders, query, status, range]);

  /* account details */
  const [clinic, setClinic] = useState(account.clinic);
  const [profile, setProfile] = useState<AccountResult | null>(null);
  const [pass, setPass] = useState<AccountResult | null>(null);
  const [notes, setNotes] = useState<AccountNotify>(account.notify);
  const [noteResult, setNoteResult] = useState<AccountResult | null>(null);
  const saveProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "");
    run(() => saveProfileAction({ first: v("first"), last: v("last"), email: v("email"), phone: v("phone"), clinic }), setProfile);
  };
  const savePass = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const v = (k: string) => String(f.get(k) ?? "");
    run(
      () => changePasswordAction({ current: v("current"), password: v("password"), again: v("again") }),
      (r) => {
        setPass(r);
        if (r.ok) form.reset();
      },
    );
  };
  const flip = (k: keyof AccountNotify) => {
    const before = notes;
    const next = { ...notes, [k]: !notes[k] };
    setNotes(next);
    run(
      () => saveNotifyAction(next),
      (r) => {
        setNoteResult(r.ok ? null : r);
        if (!r.ok) setNotes(before); /* not saved: the switch goes back */
      },
    );
  };

  const latest = orders[0];
  const tiles: [k: string, v: string, d: string, to: AccountTabId][] = [
    ["Orders", String(orders.length), latest ? `Latest: ${latest.statusName}, ${orderDay(latest)}` : "No orders yet", "orders"],
    ["Saved plans", plan.length ? "1" : "0", plan.length ? "Ready to book" : "None saved yet", "plans"],
    ["Preferred clinic", account.clinic || "Not set", "Change it in Account details", "details"],
  ];
  const switches: [k: NoteId, t: string, d: string][] = [
    ["orders", "Appointment and order updates", "Confirmations and reminders. Always on for booked appointments."],
    ["offers", "Offers and promotions (CASL consent)", "Commercial electronic messages. You can withdraw consent at any time."],
    ["news", "Newsletter", "Skincare tips and clinic news, once a month."],
    ["events", "Events", "Invitations to clinic events and open days."],
  ];

  const items = ACCOUNT_TABS.map(({ id, label, soon }) => ({
    key: id,
    label: (
      <>
        {label}
        {soon ? <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${tab === id ? "bg-white/20" : "bg-ndm-mist text-ndm-muted"}`}>{soon}</span> : null}
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
            Signed in as{" "}
            <b className="font-semibold text-ndm-ink">
              {account.first} {account.last}
            </b>{" "}
            ·{" "}
            <button type="button" disabled={busy} onClick={() => run(signOutAction, () => {})} className="text-ndm-deep hover:underline">
              Sign out
            </button>
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
        <div className="min-w-0">
          {tab === "dashboard" && (
            <>
              <AccHead k="Dashboard" title={`Welcome back, ${account.first}`} text="Your plans, orders and details in one place." />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                  {orders.length > 0 && (
                    <button type="button" onClick={() => go("orders")} className="font-inter text-[14px] font-medium text-ndm-deep hover:underline">
                      View all
                    </button>
                  )}
                </div>
                {orders.length ? <AccOrders rows={orders.slice(0, 2)} /> : <NoOrders />}
              </AccCard>
            </>
          )}

          {tab === "plans" && (
            <>
              <AccHead k="My plans & saved treatments" title="Book again in a tap" text="Treatment plans you saved in this browser." />
              <div className="grid gap-4 md:grid-cols-2">
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
              <AccHead k="Orders & receipts" title="Your orders" text="Orders you placed from the cart while signed in. Orders are paid online by card at checkout." />
              <AccCard>
                {orders.length ? (
                  <>
                    <div className="mb-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
                      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders" className={FLD} aria-label="Search orders" />
                      <AccSelect value={status} onChange={setStatus} placeholder="Status" options={statuses} />
                      <AccSelect value={range} onChange={setRange} placeholder="Date range" options={RANGES} />
                    </div>
                    {shown.length ? <AccOrders rows={shown} /> : <p className="font-inter text-[15px] text-ndm-muted">No orders match.</p>}
                  </>
                ) : (
                  <NoOrders />
                )}
              </AccCard>
            </>
          )}

          {tab === "payment" && (
            <>
              <AccHead k="Payment methods" title="Coming soon" text="Orders are paid online by card at checkout. Saved cards and financing will appear here." />
              <AccCard>
                <p className="font-inter text-[15px] text-ndm-muted">Flexible payment plans are available through Affirm at the clinic, for Canadian residents aged 19 and over, with a minimum $500 purchase.</p>
              </AccCard>
            </>
          )}

          {tab === "details" && (
            <>
              <AccHead k="Account details" title="Your profile" />
              <div className="grid gap-5">
                <AccCard>
                  <form onSubmit={saveProfile}>
                    <h3 className={H3}>Profile</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className={LABEL}>First name</span>
                        <input name="first" required maxLength={60} autoComplete="given-name" defaultValue={account.first} className={FLD} />
                      </label>
                      <label>
                        <span className={LABEL}>Last name</span>
                        <input name="last" required maxLength={60} autoComplete="family-name" defaultValue={account.last} className={FLD} />
                      </label>
                      <label>
                        <span className={LABEL}>Email</span>
                        <input name="email" type="email" required maxLength={120} autoComplete="email" defaultValue={account.email} className={FLD} />
                      </label>
                      <label>
                        <span className={LABEL}>Phone</span>
                        <input name="phone" type="tel" maxLength={30} autoComplete="tel" defaultValue={account.phone} placeholder="Optional" className={FLD} />
                      </label>
                      <label className="sm:col-span-2">
                        <span className={LABEL}>Preferred clinic</span>
                        <AccSelect value={clinic || NO_CLINIC} onChange={(v) => setClinic(v === NO_CLINIC ? "" : v)} placeholder="Clinic" options={[NO_CLINIC, ...CLINICS.map((c) => c.name)]} />
                      </label>
                    </div>
                    <div className="mt-5">
                      <Button as="button" type="submit" v="ink" sm disabled={busy}>
                        Save changes
                      </Button>
                    </div>
                    <AccNote result={profile} />
                  </form>
                </AccCard>
                <AccCard>
                  <form onSubmit={savePass}>
                    <h3 className={H3}>Password</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label>
                        <span className={LABEL}>Current password</span>
                        <input name="current" type="password" required maxLength={128} autoComplete="current-password" className={FLD} />
                      </label>
                      <label>
                        <span className={LABEL}>New password</span>
                        <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={FLD} />
                      </label>
                      <label>
                        <span className={LABEL}>Confirm new password</span>
                        <input name="again" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={FLD} />
                      </label>
                    </div>
                    <div className="mt-5">
                      <Button as="button" type="submit" v="line" sm disabled={busy}>
                        Update password
                      </Button>
                    </div>
                    <AccNote result={pass} />
                  </form>
                </AccCard>
                <AccCard>
                  <h3 className={H3}>Notifications</h3>
                  <ul className="mt-3 divide-y divide-ndm-line" role="list">
                    {switches.map(([k, t, d]) => {
                      const on = k === "orders" ? true : notes[k];
                      return (
                        <li key={k} className="flex items-start justify-between gap-4 py-3.5">
                          <span>
                            <span className="block font-inter text-[15px] font-medium text-ndm-ink">{t}</span>
                            <span className="mt-0.5 block font-inter text-[13px] text-ndm-muted">{d}</span>
                          </span>
                          <button type="button" role="switch" aria-label={t} aria-checked={on} disabled={k === "orders" || busy} onClick={() => k !== "orders" && flip(k)} className={`acc-switch ${on ? "is-on" : ""}`}>
                            <i />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <AccNote result={noteResult} />
                </AccCard>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
