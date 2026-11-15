"use client";
/* eslint-disable @next/next/no-img-element -- this page's photos are shown as the prototype shows them */

/*
 * A sale landing page: the VIP Sale (/vip-sale, the site's own look) and Black Friday (/black-friday, black and
 * red), one component in two looks. Its own header and footer, a hero with a live countdown and the gift line,
 * how it works, step 1 concerns, step 2 one deal card per price-list category (area and package pickers, Add to
 * my plan), the sale prices, step 3 my plan (kept in localStorage, sent to the cart with the checkout code), the
 * clinics.
 * Every price, the lines in the sale and the checkout code come from WooCommerce (the campaign beside the price
 * list); the words are the page's copy (WordPress for the VIP Sale). A prescription product is shown by name,
 * quantity and price only (Health Canada C.01.044).
 * The layout is the prototype's (src/bf-sale-ui.jsx, vip-sale.html); the card's price block, the plan tray, the
 * sale prices and the gift line follow the 2026 holiday sale brief.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, Fragment, useContext, useEffect, useRef, useState, type MouseEvent } from "react";
import type { BfClock } from "@/components/black-friday/bf-timer";
import { bfsShort, bfsTag, planPrice, planTotals, type Deal, type Opt, type PlanLine } from "@/components/bf-sale/data";
import { Button } from "@/components/ui/button";
import { IconArrow, IconClose, IconPhone } from "@/components/ui/icons";
import { SHOP_URL } from "@/config/shop";
import { CLINICS as SITE_CLINICS, HOURS } from "@/config/site";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { withBase, withBaseSrcSet } from "@/lib/base-path";
import { cartKey, checkCart, setCartQty, setTypedCode } from "@/lib/cart";
import { byId } from "@/lib/dom";
import { formatPrice as money } from "@/lib/prices";
import { tel } from "@/lib/routes";
import { scrollToY } from "@/lib/smooth-scroll";
import type { SaleLook, SalePhase, SalePriceCard, SaleView } from "@/types/sale";

/* the two looks: every class that differs between them (the rest hangs on the page's own CSS, prefix `p`) */
const LOOKS: Record<SaleView["look"], SaleLook> = {
  vip: { p: "vip", bar: "bg-[#0B1B29]/95", night: "bg-[#0B1B29]", focus: "focus:border-ndm-deep", skip: "focus:bg-ndm-deep", ink: "text-ndm-ink", inkHover: "hover:text-ndm-ink", accent: "text-ndm-deep", accentBg: "bg-ndm-deep", light: "text-[#E2C27A]", lightBg: "bg-[#E2C27A]", pale: "text-[#F0D79B]", photo: "bg-[#F2F2EF]" },
  bfs: { p: "bfs", bar: "bg-[#0B0B0C]/95", night: "bg-[#0B0B0C]", focus: "focus:border-[#0B0B0C]", skip: "focus:bg-[#D3121F]", ink: "text-[#0B0B0C]", inkHover: "hover:text-[#0B0B0C]", accent: "text-[#D3121F]", accentBg: "bg-[#D3121F]", light: "text-[#EE3A45]", lightBg: "bg-[#EE3A45]", pale: "text-[#FF5A63]", photo: "bg-[#F3F1EF]" },
};

const PHONES = SITE_CLINICS.map((c) => ({ num: c.phone }));
const CLINIC_PHOTOS = { uptown: "/assets/clinic/clinic-4.jpg", downtown: "/assets/clinic/clinic-1.jpg" };
const CLINICS = SITE_CLINICS.map((c) => ({ name: c.name, addr: c.address, phone: c.phone, note: c.directions, img: CLINIC_PHOTOS[c.id] }));
const EMAIL = "info@newdermamed.com";
/** "See packages" on a sale price card: its deal card opens on that product. */
const PICK_EVENT = "ndm-sale-pick";
/** Kept beside the saved plan once it went to the cart, until something new is added. */
const sentKey = (planKey: string) => `${planKey}-sent`;
type PickProps = { pick: string | null; setPick: (name: string | null) => void };
type PlanProps = { plan: PlanLine[]; toggle: (x: PlanLine) => void };

/** Scrolls to a section of this page, clear of the sticky header. Works as a click handler or on its own. */
const go = (id: string) => (e?: MouseEvent) => {
  const el = byId(id);
  if (!el) return;
  e?.preventDefault();
  scrollToY(el.getBoundingClientRect().top + window.scrollY - 84);
};

/** The page's view (worked out on the server, handed down by the page) and its look. */
const Sale = createContext<(SaleView & { T: SaleLook }) | null>(null);
const useSale = () => {
  const view = useContext(Sale);
  if (!view) throw new Error("The sale sections need the page's view.");
  return view;
};

/* ---------------------------------------------------------------- the sale's clock */

interface SaleClock extends BfClock {
  /** The phase running now, or the first one before the sale opens; null without phases. */
  phase: SalePhase | null;
  /** The clock has been read (it can only be read in the browser). */
  ready: boolean;
}

const IDLE: BfClock = { live: false, over: false, pct: 0, d: 0, h: 0, m: 0, s: 0 };

/** Counts down to the sale's start, then to the end of the phase that is running. */
function useSaleClock(step = 1000): SaleClock {
  const { start, end, phases } = useSale();
  const [now, setNow] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const t = setInterval(() => setNow(Date.now()), step);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [step]);
  if (!now) return { ...IDLE, phase: phases[0] ?? null, ready: false };
  const live = now >= start;
  const phase = (live ? phases.findLast((p) => now >= p.from) : phases[0]) ?? phases[0] ?? null;
  const target = live ? (phase ? phase.to : end) : start;
  const ms = Math.max(0, target - now);
  return {
    ready: true,
    phase,
    live,
    over: now > end,
    pct: live ? Math.min(1, (now - start) / (end - start)) : 0,
    d: Math.floor(ms / 864e5),
    h: Math.floor((ms % 864e5) / 36e5),
    m: Math.floor((ms % 36e5) / 6e4),
    s: Math.floor((ms % 6e4) / 1e3),
  };
}

/* round 26: moving tapes. Two crossed strips close the hero */
function Tape({ tone = "red", rev = false, phase }: { tone?: "red" | "white"; rev?: boolean; phase: string }) {
  const { copy, T } = useSale();
  if (!copy.tape.length) return null;
  /* "{{phase}}" is the phase running now: Black Friday, Cyber Monday, Black Friday Extended */
  const row = <span>{copy.tape.map((w) => <Fragment key={w}>{w.replace("{{phase}}", phase)}<i /></Fragment>)}</span>;
  return <div aria-hidden="true" className={`${T.p}-tape ${T.p}-tape-${tone}`}><div className={`${T.p}-tick-in ${rev ? 'is-rev' : ''}`}>{row}{row}{row}{row}</div></div>;
}

function Header({ count }: { count: number }) {
  /* round 30: the links follow the page's own order, the section in view is underlined, and the plan count shows only when
     something is in the plan */
  const links: [id: string, label: string][] = [['how', 'How it works'], ['concerns', 'Concerns'], ['deals', 'Deals'], ['specials', 'Sale prices'], ['plan', 'My plan'], ['clinics', 'Clinics']];
  const [here, setHere] = useState('');
  const { copy, T } = useSale();
  useOnScroll(() => { let cur = ''; links.forEach(([id]) => { const e = byId(id); if (e && e.getBoundingClientRect().top < 140) cur = id; }); setHere(cur); });
  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 ${T.bar} text-white backdrop-blur-[14px]`}>
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-2 sm:gap-4 px-[var(--gx)] min-[1480px]:max-w-[1400px]">
        <Link href="/" className="shrink-0" aria-label="NewDermaMed home"><img src={withBase("/assets/icons/logo-white.svg")} alt="NewDermaMed" className="h-7 w-auto min-[400px]:h-8 sm:h-10" /></Link>
        {/* narrow desktops (1024 to 1279px): tighter links, no Home link (the logo opens it) and the phone as an icon, so the booking button stays whole */}
        <nav aria-label={`${copy.name} page`} className="hidden items-center gap-2 whitespace-nowrap lg:flex min-[1100px]:gap-3 xl:gap-6">
          <Link href="/" className={`${T.p}-nav hidden font-inter text-[14.5px] xl:inline`}>Home</Link>
          {links.map(([id, l]) => (
            <a key={id} href={`#${id}`} onClick={go(id)} aria-current={here === id ? 'location' : undefined} className={`${T.p}-nav inline-flex items-center gap-2 font-inter text-[13.5px] xl:text-[14.5px] ${here === id ? 'is-on' : ''}`}>
              {l}{id === 'plan' && count > 0 && <span className={`grid h-5 min-w-5 place-items-center rounded-full ${T.accentBg} px-1.5 text-[11px] font-semibold text-white tabular-nums`}>{count}</span>}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href={tel(PHONES[0].num)} className="hidden items-center gap-2 font-inter text-[14px] text-white/85 hover:text-white md:inline-flex lg:hidden xl:inline-flex"><IconPhone />{PHONES[0].num}</a>
          <a href={tel(PHONES[0].num)} aria-label={`Call Uptown, ${PHONES[0].num}`} className="grid size-10 place-items-center rounded-full border border-white/20 max-[349px]:hidden md:hidden lg:grid xl:hidden"><IconPhone /></a>
          <Button href="#/book" v="book" hot sm className="hidden sm:inline-flex">Book Free Consultation</Button>
          <Button href="#/book" v="book" hot sm className="sm:hidden">Book</Button>
        </div>
      </div>
    </header>
  );
}

/* round 25: a calmer timer. Four plain numbers with thin dividers on a quiet glass card, one dot for "live".
   The clock can only be read in the browser: until then the same card shows zeros. */
function Countdown({ t }: { t: SaleClock }) {
  const { copy, startDay, after, T } = useSale();
  if (t.over) {
    return after
      ? <p className="font-inter text-[15px] text-white/80">{copy.name} has ended. <Link href={after} className="underline underline-offset-4">See the sale that is on now</Link>.</p>
      : <p className="font-inter text-[15px] text-white/80">Our {copy.name} sale has ended. See our current offers on the <Link href="/promotion" className="underline underline-offset-4">promotions page</Link>.</p>;
  }
  const label = t.live ? (t.phase?.timer ?? 'Offers end in') : `${copy.name} starts in`;
  const day = t.live ? (t.phase?.day ?? '') : startDay;
  const cells: [value: number, label: string][] = [[t.d, 'Days'], [t.h, 'Hours'], [t.m, 'Minutes'], [t.s, 'Seconds']];
  return (
    <div className={`${T.p}-cd rounded-[26px] p-5 sm:p-6`} role="timer" aria-label={`${label} ${t.d} days, ${t.h} hours and ${t.m} minutes`}>
      <p className="flex items-center justify-between gap-3 font-inter text-[12px] font-medium uppercase tracking-[.16em] text-white/70">
        <span className="inline-flex items-center gap-2"><i aria-hidden="true" className={`size-1.5 rounded-full ${T.lightBg}`} />{label}</span>
        <span className="text-white/45">{day}</span>
      </p>
      <div className="mt-5 grid grid-cols-4" aria-hidden="true">
        {cells.map(([n, l], k) => (
          <span key={l} className={`flex flex-col items-center ${k ? 'border-l border-white/10' : ''}`}>
            <b className="font-aeonik text-[clamp(38px,4.4vw,58px)] font-normal leading-none tracking-[-0.03em] text-white tabular-nums">{String(n).padStart(2, '0')}</b>
            <span className="mt-2 font-inter text-[11px] uppercase tracking-[.14em] text-white/50">{l}</span>
          </span>
        ))}
      </div>
      {t.live && <div className="bft-bar mt-6"><i style={{ width: `${(t.pct * 100).toFixed(1)}%` }} /></div>}
    </div>
  );
}

/** A sale price card's picture: the product's photo, or, without one, its quantity on the look's dark band. */
function CardPicture({ card, sizes, lazy = false }: { card: SalePriceCard; sizes: string; lazy?: boolean }) {
  const { T } = useSale();
  return card.img
    ? <img src={withBase(card.img)} srcSet={withBaseSrcSet(card.set)} sizes={sizes} alt="" loading={lazy ? 'lazy' : undefined} decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: card.pos }} />
    : <span aria-hidden="true" className={`${T.p}-head absolute inset-0 grid place-items-center px-4 text-center font-aeonik text-[clamp(22px,2vw,30px)] leading-[1.05] tracking-[-0.02em] text-white`}>{card.qty}</span>;
}

/* round 27: the tickets turn like a carousel. Every few seconds the front ticket moves left, the right one comes forward
   and the next one enters from behind; hovering pauses it, and clicking a side ticket brings it to the front.
   They are the sale prices, without the prescription product. */
function Fan() {
  const { cards: all, T } = useSale();
  const cards = all.filter((x) => !x.drug).slice(0, 5);
  const n = cards.length;
  const [k, setK] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || hold) return;
    const t = setInterval(() => setK((x) => x + 1), 2600);
    return () => clearInterval(t);
  }, [hold]);
  if (n < 3) return null;
  return (
    <ul role="list" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} className={`${T.p}-fan relative mx-auto mb-8 hidden h-[clamp(250px,24vw,330px)] w-full max-w-[520px] md:block`}>
      {cards.map((x, i) => {
        const pos = (((i - k) % n) + n + 1) % n; /* 0 left, 1 front, 2 right, others wait behind */
        return (
          <li key={x.title} className={`${T.p}-fan-card ${T.p}-pos-${Math.min(pos, 3)}`} aria-hidden={pos > 2}>
            <a href="#specials" tabIndex={pos > 2 ? -1 : 0} onClick={(e) => { if (pos !== 1 && pos < 3) { e.preventDefault(); setK((v) => v + (pos === 2 ? 1 : -1)); } else go('specials')(e); }}
              className={`block h-full w-full overflow-hidden rounded-[22px] bg-white ${T.ink} shadow-[0_40px_70px_-30px_rgba(0,0,0,.85)]`}>
              <span className="relative block h-[62%] overflow-hidden"><CardPicture card={x} sizes="220px" /></span>
              <span className="block border-t-2 border-dashed border-black/10 px-3.5 pt-2.5">
                <span className="block truncate font-aeonik text-[18px] leading-[1.15]">{x.title}</span>
                <span className="mt-0.5 block truncate font-inter text-[12.5px] text-ndm-muted">{x.qty} · <b className={`font-semibold ${T.accent}`}>{money(x.price)}</b></span>
              </span>
            </a>
          </li>
        );
      })}
      <li aria-hidden="true" className={`${T.p}-fan-ring`} />
    </ul>
  );
}

/* round 26: the hero. A giant outlined percentage behind the words, a fan of tickets with the countdown, crossed tapes */
function Hero({ t }: { t: SaleClock }) {
  const { copy, max, T } = useSale();
  const { photo } = copy.hero;
  return (
    <section aria-labelledby={`${T.p}-title`} className={`${T.p}-hero relative isolate overflow-hidden text-white`}>
      {/* round 28: the clinic at night sits behind the tickets and the countdown, fading into the dark on the left and at the bottom */}
      <img src={withBase(photo.src)} width={photo.width} height={photo.height} alt="" fetchPriority="high" decoding="async" className={`${T.p}-hero-pic absolute right-0 top-0 -z-10 h-[46%] w-full object-cover lg:h-full lg:w-[60%]`} style={{ objectPosition: '58% 50%' }} />
      {max > 0 && <span aria-hidden="true" className={`${T.p}-big font-aeonik`}>{max}%</span>}
      <div className="mx-auto grid max-w-[1280px] gap-12 px-[var(--gx)] pb-[clamp(36px,4vw,56px)] pt-[clamp(48px,6vw,96px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-center">
        <div className={`${T.p}-rise`}>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.06] px-3.5 py-1.5 font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/85"><i className={`${T.p}-live`} />{t.phase?.eyebrow ?? copy.name}</p>
          <h1 id={`${T.p}-title`} className="mt-6 font-aeonik text-[clamp(68px,10.5vw,164px)] font-normal leading-[.86] tracking-[-0.05em]">{copy.hero.lead}<br /><span className={`tt-strong ${T.p}-fri`}>{copy.hero.strong}</span><span className={`${T.p}-dot`}>.</span></h1>
          {max > 0 && (
            <p className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-inter text-[13px] font-semibold uppercase tracking-[.18em] text-white/60">Up to</span><b className={`font-aeonik text-[clamp(52px,6vw,84px)] font-normal leading-none tracking-[-0.04em] ${T.light}`}>{max}%</b><span className="tt-strong font-aeonik text-[clamp(30px,3.4vw,46px)] leading-none text-white">off</span><span className="basis-full font-inter text-[15px] text-white/65 sm:basis-auto">{copy.hero.offer}</span></p>
          )}
          <p className="mt-5 max-w-[50ch] font-inter text-[clamp(15.5px,1.2vw,17px)] leading-[1.6] text-white/75">{copy.hero.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="#deals" v="book" hot onClick={go('deals')}>Build my plan</Button>
            <Button href="#/book" v="glass">Book Free Consultation</Button>
          </div>
        </div>
        <div className="relative">
          <Fan />
          <div className="mx-auto max-w-[520px]"><Countdown t={t} /></div>
        </div>
      </div>
      <div className={`${T.p}-tapes`}><Tape tone="red" phase={t.phase?.eyebrow ?? copy.name} /><Tape tone="white" rev phase={t.phase?.eyebrow ?? copy.name} /></div>
    </section>
  );
}

/** The gift line under the header: information only, nothing is sold or added to the cart. */
function GiftBar() {
  const { copy, T } = useSale();
  if (!copy.gift) return null;
  return <p className={`${T.p}-off px-[var(--gx)] py-3 text-center font-inter text-[13.5px] font-semibold leading-[1.4] sm:text-[14.5px]`}>{copy.gift}</p>;
}

/* round 26: the sale in four numbers */
function Stats({ t }: { t: SaleClock }) {
  const { copy, deals, max, T } = useSale();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const items: [figure: string, label: string][] = [[`${max}%`, 'Up to, on selected packages'], [String(deals.length), 'Treatment groups on offer'], ...(t.phase ? [[t.phase.date, 'Last day'] as [string, string]] : []), ['$0', 'Consultation and VISIA® analysis']];
  if (!deals.length) return null;
  return (
    <section ref={ref} aria-label={`${copy.name} at a glance`} className="px-[var(--gx)] pt-[clamp(40px,5vw,72px)]">
      <ul role="list" className={`mx-auto grid max-w-[1180px] grid-cols-2 gap-y-8 ${items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {items.map(([n, l], i) => (
          <li key={l} className={`rv px-4 text-center ${i ? 'lg:border-l lg:border-black/10' : ''} ${i % 2 ? 'border-l border-black/10' : ''}`} style={{ transitionDelay: `${0.05 * i}s` }}>
            <b className={`block whitespace-nowrap font-aeonik text-[clamp(40px,5vw,72px)] font-normal leading-none tracking-[-0.04em] ${T.ink}`}>{n.replace('%', '')}{n.includes('%') && <span className={T.accent}>%</span>}</b>
            <span className="mt-2 block font-inter text-[13.5px] leading-[1.4] text-ndm-muted">{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function How() {
  const { copy, T } = useSale();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const steps = copy.how;
  return (
    <section ref={ref} id="how" aria-labelledby={`${T.p}-h-title`} className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(40px,5vw,64px)]">
      <div className="mx-auto max-w-[1180px]">
        <h2 id={`${T.p}-h-title`} className={`rv font-inter text-[12px] font-semibold uppercase tracking-[.18em] ${T.accent}`}>How it works</h2>
        <ol className={`${T.p}-how mt-4 grid gap-3 md:grid-cols-3 md:gap-4`}>
          {steps.map(({ title: s, text: d }, i) => (
            <li key={s} className={`rv ${T.p}-how-card relative flex items-center gap-4 rounded-[22px] bg-white px-5 py-4 ring-1 ring-black/[.06]`} style={{ transitionDelay: `${0.06 * i}s`, zIndex: steps.length - i }}>
              <span aria-hidden="true" className={`${T.p}-how-n font-aeonik`}><i>0</i>{i + 1}</span>
              <p className="font-inter text-[15px] leading-[1.4] text-ndm-muted"><b className={`font-aeonik text-[22px] font-normal tracking-[-0.02em] ${T.ink}`}>{s}</b><br />{d}</p>
              {i < steps.length - 1 && <span aria-hidden="true" className={`${T.p}-how-go`}><IconArrow size={13} /></span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Concerns({ pick, setPick }: PickProps) {
  const { copy, deals, T } = useSale();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  /* a concern none of whose treatments is in the sale is not offered */
  const list = copy.concerns.items.map((c) => ({ ...c, k: c.categories.filter((id) => deals.some((x) => x.id === id)).length })).filter((c) => c.k > 0);
  if (!list.length) return null;
  return (
    <section ref={ref} id="concerns" aria-labelledby={`${T.p}-c-title`} className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] lg:items-end">
          <div>
            <p className={`${T.p}-step rv`}><b>1</b>Step 1</p>
            <h2 id={`${T.p}-c-title`} className={`rv mt-5 font-aeonik text-[clamp(36px,4.4vw,64px)] font-normal leading-[1] tracking-[-0.035em] ${T.ink}`} style={{ transitionDelay: '.05s' }}>{copy.concerns.lead}<br /><span className={`tt-strong ${T.accent}`}>{copy.concerns.strong}</span></h2>
          </div>
          <p className="rv max-w-[46ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted lg:pb-2" style={{ transitionDelay: '.08s' }}>{copy.concerns.text}</p>
        </div>
        <ul role="list" className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3">
          {list.map(({ name: n, text: d }, i) => {
            const on = pick === n;
            return (
              <li key={n} className="rv" style={{ transitionDelay: `${0.03 * i}s` }}>
                <button type="button" aria-pressed={on} onClick={() => { setPick(on ? null : n); if (!on) setTimeout(() => go('deals')(), 60); }}
                  className={`${T.p}-chip group relative flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white p-4 text-left ring-1 ring-black/[.06] sm:p-6`}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0 pt-1 font-aeonik text-[clamp(20px,1.8vw,26px)] leading-[1.12] tracking-[-0.015em]">{n}</span>
                    <span aria-hidden="true" className={`${T.p}-chip-go grid size-9 shrink-0 place-items-center rounded-full`}><IconArrow size={12} /></span>
                  </span>
                  <span className={`${T.p}-chip-d mt-1.5 hidden font-inter text-[13.5px] leading-[1.45] sm:block`}>{d}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function DealCard({ d, plan, toggle, badge }: PlanProps & { d: Deal; badge: string }) {
  const { code, T } = useSale();
  const [ii, setIi] = useState(0);
  /* "See packages" on a sale price card names its product: this card opens on it */
  useEffect(() => {
    const pick = (e: Event) => {
      const want = (e as CustomEvent<{ cat: string; item: string }>).detail;
      if (want.cat !== d.id) return;
      const i = d.items.findIndex((x) => x[0] === want.item);
      if (i >= 0) setIi(i);
    };
    window.addEventListener(PICK_EVENT, pick);
    return () => window.removeEventListener(PICK_EVENT, pick);
  }, [d]);
  const it = d.items[ii];
  const opts = it[2].map((o, k): [Opt, number] => [o, k]).filter(([o]) => o[5] !== undefined || o[2] > 0 || o[3]);
  const [pickOi, setOi] = useState(opts[0][1]);
  const oi = opts.some(([, k]) => k === pickOi) ? pickOi : opts[0][1]; /* a new area starts on its first offer */
  const o = it[2][oi];
  const key = `${d.id}|${it[0]}|${o[0]}`;
  const inPlan = plan.some((p) => p.key === key);
  const cat = d.c.name;
  /* the price to pay: with the checkout code where it applies, else the website price */
  const pay = o[4] || o[1];
  const save = o[2] > 0 ? o[2] - pay : 0;
  return (
    /* the one column may shrink below its content (minmax(0,1fr)), so a long name is cut short instead of widening the card;
       header, text, treatment, packages and price are five rows the cards of one grid row share (subgrid), so each lines up across the row */
    <li id={`bf-${d.id}`} className="row-span-5 grid scroll-mt-[150px] grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-y-0">
      <article className={`${T.p}-card row-span-5 grid grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-y-0 overflow-hidden rounded-[24px] bg-white p-5 ring-1 ring-black/[.06] sm:p-6 ${inPlan ? 'is-in' : ''}`}>
        <div className={`${T.p}-head relative -mx-5 -mt-5 mb-5 flex min-h-[180px] flex-col gap-5 overflow-hidden p-5 text-white *:last:mt-auto sm:-mx-6 sm:-mt-6 sm:p-6`}>
          <span aria-hidden="true" className={`${T.p}-head-mark font-aeonik`}>%</span>
          <span className="relative flex items-center justify-between gap-3">
            <span className="font-inter text-[11.5px] font-semibold uppercase tracking-[.16em] text-white/65">{d.group}</span>
            {badge && <span className={`${T.p}-off rounded-full px-2.5 py-1 font-inter text-[10.5px] font-semibold uppercase tracking-[.1em]`}>{badge}</span>}
          </span>
          <h3 className="relative max-w-[16ch] font-aeonik text-[clamp(26px,2.3vw,32px)] font-normal leading-[1.05] tracking-[-0.02em] text-white">{cat}</h3>
          {d.pct
            ? <span className="relative flex items-baseline gap-2"><span className="font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-white/70">Up to</span><b className={`font-aeonik text-[60px] font-normal leading-[.9] tracking-[-0.04em] ${T.light}`}>{d.pct}%</b><span className="tt-strong font-aeonik text-[26px] leading-none">off</span></span>
            : d.offer
              ? <span className="relative max-w-[11ch] font-aeonik text-[32px] leading-[1.02] tracking-[-0.02em]">{d.offer.replace(/ (free|50%\s*off)$/, '')} <span className={`tt-strong whitespace-nowrap ${T.light}`}>{(/(free|50%\s*off)$/.exec(d.offer) || [''])[0]}</span></span>
              : <span className="relative font-inter text-[13px] text-white/70">From <b className={`font-aeonik text-[34px] font-normal leading-none tracking-[-0.03em] ${T.light}`}>{money(d.from)}</b></span>}
        </div>
        <p className="mb-5 font-inter text-[14px] leading-[1.55] text-ndm-muted empty:mb-0">{d.c.blurb}</p>
        {d.items.length > 1 ? (
          <label className="block">
            <span className="block font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Treatment or area</span>
            <select value={ii} onChange={(e) => setIi(+e.target.value)} className={`${T.p}-sel mt-2 h-12 w-full rounded-[14px] border border-black/10 pl-4 pr-10 font-inter text-[15px] ${T.ink} outline-hidden ${T.focus}`}>
              {d.items.map((x, k) => <option key={x[0]} value={k}>{bfsShort(x[0], cat)}</option>)}
            </select>
          </label>
        ) : (
          /* one treatment only: the same field, without a choice, so the packages sit level with the other cards */
          <p>
            <span className="block font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Treatment or area</span>
            <span className={`mt-2 flex h-12 w-full items-center rounded-[14px] border border-black/10 bg-black/[.025] px-4 font-inter text-[15px] ${T.ink}`}><span className="truncate">{bfsShort(it[0], cat)}</span></span>
          </p>
        )}
        <div className="mb-6 mt-5">
          <span className="font-inter text-[12px] font-semibold uppercase tracking-[.14em] text-ndm-muted">Package</span>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`${cat} packages`}>
            {opts.map(([x, k]) => (
              <button key={k} type="button" aria-pressed={k === oi} onClick={() => setOi(k)}
                className={`${T.p}-opt rounded-[12px] border border-black/10 px-3 py-2 text-left font-inter text-[13px] leading-[1.25] ${T.ink} transition-colors hover:border-black/40`}>
                <span className="block font-medium">{x[0]}</span>
                <span className="block tabular-nums">{money(x[4] || x[1])}{x[2] > 0 && <s className="ml-1.5 text-ndm-muted">{money(x[2])}</s>}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={`${T.p}-tear flex flex-col pt-5`}>
          <p className="truncate font-inter text-[12px] text-ndm-muted">{bfsShort(it[0], cat)} · {o[0]}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="flex items-baseline gap-2">
              <b className={`font-aeonik text-[34px] font-normal leading-none tracking-[-0.03em] ${T.ink}`}>{money(pay)}</b>
              {o[2] > 0 && <s className="font-inter text-[15px] text-ndm-muted">{money(o[2])}</s>}
            </p>
            {(save > 0 || (!o[5] && o[3])) && <span className={`shrink-0 whitespace-nowrap pb-1 text-right font-inter text-[12.5px] font-semibold ${T.accent}`}>{save > 0 ? `You save ${money(save)}` : bfsTag(o[3])}</span>}
          </div>
          {o[4] ? <p className="mt-2 font-inter text-[12.5px] leading-[1.45] text-ndm-muted">Website price {money(o[1])} · {code} applied at checkout</p> : null}
          <span className="grow" />
          <button type="button" onClick={() => toggle({ key, cat, item: bfsShort(it[0], cat), opt: o[0], price: o[1], reg: o[2] || 0, tag: o[5] ? '' : bfsTag(o[3]), code: o[4] || 0, name: it[0], pid: o[5], vid: o[6] })}
            className={`btn mt-5 w-full shrink-0 ${inPlan ? 'btn-line' : 'btn-ink'}`} aria-pressed={inPlan}>
            {inPlan ? 'In my plan, tap to remove' : 'Add to my plan'}
          </button>
        </div>
      </article>
    </li>
  );
}

function Deals({ pick, setPick, plan, toggle, badge }: PickProps & PlanProps & { badge: string }) {
  const { copy, deals, tabs, code, T } = useSale();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const [tab, setTab] = useState('All deals');
  const ids = pick ? (copy.concerns.items.find((c) => c.name === pick)?.categories ?? null) : null;
  const list = deals.filter((d) => (!ids || ids.includes(d.id)) && (tab === 'All deals' || d.group === tab));
  return (
    <section ref={ref} id="deals" aria-labelledby={`${T.p}-d-title`} className="scroll-mt-[84px] px-[var(--gx)] pt-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`${T.p}-step rv`}><b>2</b>Step 2</p>
            <h2 id={`${T.p}-d-title`} className={`rv mt-5 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] ${T.ink}`} style={{ transitionDelay: '.05s' }}>{copy.deals.lead}<br /><span className={`tt-strong ${T.accent}`}>{copy.deals.strong}</span></h2>
            <p className="rv mt-4 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: '.08s' }}>{copy.deals.text}</p>
          </div>
          <p className="rv font-inter text-[14px] text-ndm-muted" style={{ transitionDelay: '.1s' }}><b className={`font-semibold ${T.ink}`}>{list.length}</b> {list.length === 1 ? 'treatment' : 'treatments'}{pick && <> for <b className={`font-semibold ${T.ink}`}>{pick.toLowerCase()}</b> · <button type="button" onClick={() => setPick(null)} className={`${T.accent} underline underline-offset-4`}>show all</button></>}</p>
        </div>
        {/* the tabs stay under the page header for as long as the deals are on screen; the strip is the page's own colour, so it only shows once cards pass under it */}
        <div className={`${T.p}-tabs no-scrollbar sticky top-[69px] z-40 -mx-[var(--gx)] mt-5 overflow-x-auto bg-[color-mix(in_srgb,var(--pp)_92%,transparent)] px-[var(--gx)] py-3 backdrop-blur-[10px]`}>
          <div className="inline-flex gap-1 rounded-full bg-black/[.05] p-1" role="tablist" aria-label="Deal categories">
            {tabs.map((x) => (
              <button key={x} type="button" role="tab" aria-selected={tab === x} onClick={() => setTab(x)}
                className={`shrink-0 rounded-full px-4 py-2.5 font-inter text-[14px] transition-colors ${tab === x ? `${T.night} font-medium text-white` : `text-ndm-muted ${T.inkHover}`}`}>{x}</button>
            ))}
          </div>
        </div>
        {list.length ? (
          <ul role="list" className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((d) => <DealCard key={d.id} d={d} plan={plan} toggle={toggle} badge={badge} />)}
          </ul>
        ) : <p className="mt-5 font-inter text-[15px] text-ndm-muted">No deals in this group for that concern. <button type="button" onClick={() => setTab('All deals')} className={`${T.accent} underline underline-offset-4`}>See all deals</button></p>}
        <p className="mt-6 font-inter text-[12.5px] leading-[1.55] text-ndm-muted">Prices in CAD from the current NewDermaMed price list, before tax.{code ? ` Code ${code} applies to eligible packages.` : ''} Your provider confirms which treatment suits you at your free consultation. Individual results may vary.</p>
      </div>
    </section>
  );
}

/* The sale prices: a moving row of tickets on the dark band. Each shows a title, a quantity and a price, nothing else. */
function Specials() {
  const { copy, cards, T } = useSale();
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  if (!cards.length) return null;
  return (
    <section ref={ref} id="specials" aria-labelledby={`${T.p}-s-title`} data-nav="dark" className={`${T.p}-dark ${T.p}-band relative mt-[clamp(64px,7vw,104px)] scroll-mt-[68px] overflow-hidden px-[var(--gx)] py-[clamp(72px,8vw,120px)] text-white`}>
      <span aria-hidden="true" className={`${T.p}-big ${T.p}-big-l font-aeonik`}>%</span>
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className={`rv font-inter text-[12px] font-semibold uppercase tracking-[.18em] ${T.light}`}>{copy.specials.tag}</p>
          <h2 id={`${T.p}-s-title`} className="rv mt-4 font-aeonik text-[clamp(36px,4.4vw,64px)] font-normal leading-[1.04] tracking-[-0.03em] text-white" style={{ transitionDelay: '.05s' }}>{copy.specials.lead}<br /><span className={`tt-strong ${T.light}`}>{copy.specials.strong}</span></h2>
        </div>
      </div>
      <div className={`${T.p}-marq rv relative -mx-[var(--gx)] mt-10`} style={{ transitionDelay: '.1s' }}>
        <div className={`${T.p}-marq-track`}>
          {[0, 1].map((copyNo) => (
            <ul key={copyNo} role="list" className={`${T.p}-marq-set`} aria-hidden={copyNo ? true : undefined} inert={copyNo === 1}>
              {cards.map((s) => (
                <li key={s.title}>
                  <article className={`${T.p}-ticket on-k flex h-full flex-col overflow-hidden rounded-[24px] ${T.ink}`}>
                    <div className={`relative aspect-[16/10] overflow-hidden ${T.photo}`}><CardPicture card={s} sizes="(min-width: 1280px) 372px, (min-width: 990px) 29vw, 286px" lazy /></div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className={`font-aeonik text-[24px] font-normal leading-[1.1] tracking-[-0.02em] ${T.ink}`}>{s.title}</h3>
                      <p className="mt-1.5 font-inter text-[14px] leading-[1.5] text-ndm-muted">{s.qty}</p>
                      <div className={`${T.p}-tear mt-auto flex items-end justify-between gap-3 pt-5`}>
                        <p><b className={`font-aeonik text-[30px] font-normal leading-none tracking-[-0.03em] ${T.ink}`}>{money(s.price)}</b>{s.regular > s.price && <s className="ml-2 font-inter text-[14px] text-ndm-muted">{money(s.regular)}</s>}</p>
                        {s.cat ? <Button href={`#bf-${s.cat}`} v="ink" sm onClick={(e: MouseEvent) => { window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: { cat: s.cat, item: s.item } })); go(`bf-${s.cat}`)(e); }}>See packages</Button> : <Button href="#/book" v="ink" sm>Book</Button>}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function Plan({ plan, toggle, clear, sent, onSent }: PlanProps & { clear: () => void; sent: boolean; onSent: () => void }) {
  const { copy, deals, code, T } = useSale();
  const router = useRouter();
  const { website, withCode, saved } = planTotals(plan);
  const coded = !!code && plan.some((p) => p.code);
  /* everything in the plan goes to the cart, and the code with it: the checkout applies it to the eligible packages */
  const checkout = () => {
    plan.forEach((p) => {
      if (p.pid === undefined || p.vid === undefined) return;
      setCartQty({ key: cartKey(p.pid, p.vid), cat: p.cat, name: p.name ?? p.item, label: p.opt, price: p.price, was: p.reg || undefined, productId: p.pid, variationId: p.vid }, 1);
    });
    if (code) setTypedCode(code);
    /* the plan is in the cart now: it empties here, so coming back cannot add it a second time */
    onSent();
    /* WooCommerce confirms the lines and the code before the checkout opens (a cart that cannot be checked opens as it is) */
    void checkCart().finally(() => router.push("/checkout"));
  };
  const sendable = plan.some((p) => p.pid !== undefined);
  return (
    <section id="plan" aria-labelledby={`${T.p}-p-title`} data-nav="dark" className={`${T.p}-dark mt-[clamp(64px,7vw,104px)] scroll-mt-[68px] px-[var(--gx)] py-[clamp(64px,7vw,104px)] text-white`}>
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <p className={`${T.p}-step bg-white/10`}><b>3</b>Step 3</p>
          <h2 id={`${T.p}-p-title`} className="mt-5 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em]">{copy.plan.lead}<br /><span className={`tt-strong ${T.light}`}>{copy.plan.strong}</span></h2>
          {plan.length ? (
            <ul role="list" className="mt-8 divide-y divide-white/10 rounded-[22px] bg-white/[.05] px-5 ring-1 ring-white/10">
              {plan.map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-4 py-4">
                  <span className="min-w-0">
                    <span className="block font-inter text-[12px] uppercase tracking-[.14em] text-white/55">{p.cat}</span>
                    <span className="mt-1 block font-inter text-[15px] text-white">{p.item}{p.item !== p.opt && <span className="text-white/60"> · {p.opt}</span>}</span>
                    {(p.code || p.tag) && <span className={`mt-1 block font-inter text-[12.5px] font-semibold ${T.light}`}>{p.code ? `Website price ${money(p.price)} · ${code} at checkout` : p.tag}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-right font-inter text-[15px] tabular-nums">{money(planPrice(p))}{p.reg > 0 && <s className="block text-[12.5px] text-white/45">{money(p.reg)}</s>}</span>
                    <button type="button" onClick={() => toggle(p)} aria-label={`Remove ${p.cat}, ${p.item} from my plan`} className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white hover:text-white"><IconClose size={14} /></button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`${T.p}-empty mt-8 rounded-[26px] p-6 sm:p-8`}>
              <span aria-hidden="true" className={`${T.p}-empty-icon grid size-14 place-items-center rounded-full`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.7h-7a2 2 0 0 1-2-1.7L5 7Z" /><path d="M9 7V5.5a3 3 0 0 1 6 0V7" /><path d="M12 11v5M9.5 13.5h5" /></svg></span>
              <p className="mt-5 font-aeonik text-[clamp(26px,2.4vw,34px)] leading-[1.1] tracking-[-0.02em] text-white">{sent ? 'Your plan is in your cart' : 'Nothing in your plan yet'}</p>
              <p className="mt-2 max-w-[46ch] font-inter text-[15px] leading-[1.6] text-white/70">{sent ? 'Everything you picked is waiting in your cart. Add more packages here whenever you like.' : 'Pick a concern or browse the deals, choose a package and tap Add to my plan. Your total and savings add up here.'}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {sent && <Link href="/cart" className="btn bfd-cta">View my cart</Link>}
                <a href="#deals" onClick={go('deals')} className={sent ? 'btn btn-glass' : 'btn bfd-cta'}>{sent ? <span>Browse the deals</span> : 'Browse the deals'}</a>
                <Button href="#concerns" v="glass" onClick={go('concerns')}>Start from a concern</Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2" role="list">{deals.filter((d) => d.pct >= 50).slice(0, 4).map((d) => <li key={d.id}><a href={`#bf-${d.id}`} onClick={go(`bf-${d.id}`)} className="inline-flex items-center gap-2 rounded-full bg-white/[.07] px-3.5 py-2 font-inter text-[13px] text-white/85 ring-1 ring-white/10 transition-colors hover:bg-white/15"><b className={`font-semibold ${T.pale}`}>{d.offer}</b>{d.c.name}</a></li>)}</ul>
            </div>
          )}
        </div>
        <aside className={`self-start rounded-[26px] bg-white p-6 ${T.ink} lg:sticky lg:top-[96px]`}>
          <p className="font-inter text-[12px] font-semibold uppercase tracking-[.16em] text-ndm-muted">{code ? 'Website total' : 'Plan total'}</p>
          <p className="mt-2 font-aeonik text-[52px] font-normal leading-none tracking-[-0.04em] tabular-nums">{money(website)}</p>
          {code && <p className="mt-3 font-inter text-[15px]">With code {code}: <b className="font-semibold tabular-nums">{money(coded ? withCode : website)}</b></p>}
          <p className={`mt-1.5 font-inter text-[15px] font-semibold ${T.accent}`}>You save {money(saved)}</p>
          <p className="mt-1 font-inter text-[13px] text-ndm-muted">{plan.length} {plan.length === 1 ? 'treatment' : 'treatments'} in your plan</p>
          <div className="mt-6 grid gap-2.5">
            {code && <button type="button" onClick={checkout} disabled={!sendable} className="btn bfd-cta w-full disabled:cursor-not-allowed disabled:opacity-50">Go to checkout</button>}
            {!code && <Button href="#/book" v="book" hot block>Book Free Consultation</Button>}
            <Button href={tel(PHONES[0].num)} v="line" block>Call Uptown {PHONES[0].num}</Button>
            <Button href={tel(PHONES[1].num)} v="line" block>Call Downtown {PHONES[1].num}</Button>
          </div>
          <p className="mt-4 font-inter text-[12px] leading-[1.5] text-ndm-muted">{copy.plan.note}</p>
          {plan.length > 0 && <button type="button" onClick={clear} className={`mt-3 font-inter text-[13px] text-ndm-muted underline underline-offset-4 ${T.inkHover}`}>Clear my plan</button>}
        </aside>
      </div>
    </section>
  );
}

function Clinics() {
  const { copy, T } = useSale();
  return (
    <section id="clinics" aria-labelledby={`${T.p}-k-title`} className="scroll-mt-[84px] px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className="mx-auto max-w-[1180px]">
        <p className={`font-inter text-[12px] font-semibold uppercase tracking-[.18em] ${T.accent}`}>{copy.clinics.tag}</p>
        <h2 id={`${T.p}-k-title`} className={`mt-4 font-aeonik text-[clamp(32px,3.6vw,52px)] font-normal leading-[1.04] tracking-[-0.03em] ${T.ink}`}>{copy.clinics.lead}<br /><span className={`tt-strong ${T.accent}`}>{copy.clinics.strong}</span></h2>
        <ul role="list" className="mt-10 grid gap-5 md:grid-cols-2">
          {CLINICS.map((c) => (
            <li key={c.name} className="overflow-hidden rounded-[24px] bg-white ring-1 ring-black/[.06]">
              <div className="relative aspect-[16/8] overflow-hidden"><img src={withBase(c.img)} alt={`The NewDermaMed ${c.name} clinic`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" /></div>
              <div className="p-6">
                <h3 className={`font-aeonik text-[26px] font-normal leading-none ${T.ink}`}>{c.name}</h3>
                <p className={`mt-3 font-inter text-[15px] leading-[1.5] ${T.ink}`}>{c.addr}</p>
                <p className="mt-1 font-inter text-[13.5px] leading-[1.5] text-ndm-muted">{c.note}</p>
                <p className="mt-3 font-inter text-[13.5px] text-ndm-muted">{HOURS.map(([d, h]) => `${d.replace(' – ', ' to ')} ${h.replace(' – ', ' to ')}`).join(' · ')}</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button href="#/book" v="book" hot sm>Book Free Consultation</Button>
                  <Button href={tel(c.phone)} v="line" sm>{c.phone}</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-inter text-[15px] text-ndm-muted">Questions about the sale? Email <a href={`mailto:${EMAIL}`} className={`font-semibold underline underline-offset-4 ${T.ink}`}>{EMAIL}</a></p>
      </div>
    </section>
  );
}

function Footer({ t }: { t: SaleClock }) {
  const { copy, phases, T } = useSale();
  /* the day the sale closes for good: its last phase's */
  const last = phases.at(-1);
  return (
    <footer className={`${T.night} px-[var(--gx)] pb-[calc(32px+env(safe-area-inset-bottom))] pt-14 text-white lg:pb-10`}>
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-aeonik text-[clamp(30px,3.4vw,46px)] leading-[1.05] tracking-[-0.03em]">{copy.footer.lead}{!t.over && last && <><br /><span className={`tt-strong ${T.light}`}>{last.day}.</span></>}</p>
            <p className="mt-3 font-inter text-[15px] text-white/70">{copy.footer.text}</p>
          </div>
          <div className="flex flex-wrap gap-2.5"><Button href="#/book" v="book" hot>Book Free Consultation</Button><Button href="#deals" v="glass" onClick={go('deals')}>See the deals</Button></div>
        </div>
        <div className="flex flex-col gap-6 pt-8 md:flex-row md:items-center md:justify-between">
          <Link href="/"><img src={withBase("/assets/icons/logo-white.svg")} alt="NewDermaMed" className="h-10 w-auto" /></Link>
          <p className="font-inter text-[13.5px] text-white/60">{CLINICS.map((c) => `${c.name} ${c.phone}`).join(' · ')} · <a href={`mailto:${EMAIL}`} className="hover:text-white">{EMAIL}</a></p>
          <p className="flex flex-wrap gap-x-5 gap-y-2 font-inter text-[13.5px] text-white/60">
            <Link href="/" className="hover:text-white">Main site</Link><Link href="/pricing" className="hover:text-white">Full price list</Link><a href={SHOP_URL} target="_blank" rel="noopener" className="hover:text-white">Skincare shop ↗</a>
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <p className="max-w-[90ch] font-inter text-[12px] leading-[1.6] text-white/45">© 2026 NewDermaMed. {copy.footer.terms}</p>
          <a href="https://thenexthealth.ca/" target="_blank" rel="noopener" className={`${T.p}-credit group flex shrink-0 items-center gap-2.5 font-inter text-[11px] uppercase tracking-[.16em] text-white/35 transition-colors hover:text-white/70`}>
            Site by<img src={withBase("/assets/partners/next-health-white.svg")} alt="Next Health" width="88" height="16" className="h-4 w-auto opacity-40 transition-opacity group-hover:opacity-80" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function PlanBar({ plan }: { plan: PlanLine[] }) {
  const { code, T } = useSale();
  const { website, withCode } = planTotals(plan);
  const coded = !!code && plan.some((p) => p.code);
  if (!plan.length) return null;
  return (
    <div className={`${T.p}-bar fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 flex items-center justify-between gap-3 rounded-[26px] py-2 pl-5 pr-2 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,.7)] lg:hidden`}>
      <span className="min-w-0 font-inter text-[12.5px] leading-[1.35]"><b className="font-semibold">My plan</b> · {plan.length}<span className="block tabular-nums text-white/85">Website total {money(website)}{coded && <> · With {code} <b className="font-semibold text-white">{money(withCode)}</b></>}</span></span>
      <a href="#plan" onClick={go('plan')} className={`btn btn-sm h-10 rounded-full ${T.accentBg} px-5 text-white`}>Review</a>
    </div>
  );
}

/** The sections that follow the sale's clock (labels, the last day, the card badge). */
function Body({ plan, setPlan, sent, onSent }: { plan: PlanLine[]; setPlan: (update: (p: PlanLine[]) => PlanLine[]) => void; sent: boolean; onSent: () => void }) {
  const { after, T } = useSale();
  const t = useSaleClock(1000);
  const router = useRouter();
  const [pick, setPick] = useState<string | null>(null);
  const toggle = (x: PlanLine) => setPlan((p) => (p.some((y) => y.key === x.key) ? p.filter((y) => y.key !== x.key) : [...p, x]));
  /* a page whose window has closed hands over to the sale that follows it */
  useEffect(() => {
    if (t.ready && t.over && after) router.replace(after);
  }, [t.ready, t.over, after, router]);
  const badge = t.live && !t.over ? (t.phase?.badge ?? '') : (t.phase?.badge ?? '');
  return (
    <>
      <a href="#main" className={`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:rounded-full ${T.skip} focus:px-4 focus:py-2 focus:font-mont focus:text-white`}>
        Skip to content
      </a>
      <Header count={plan.length} />
      <main id="main" data-page={`${T.p}-sale`}>
        <Hero t={t} />
        <GiftBar />
        <Stats t={t} />
        <How />
        <Concerns pick={pick} setPick={setPick} />
        <Deals pick={pick} setPick={setPick} plan={plan} toggle={toggle} badge={badge} />
        <Specials />
        <Plan plan={plan} toggle={toggle} clear={() => setPlan(() => [])} sent={sent} onSent={onSent} />
        <Clinics />
      </main>
      <Footer t={t} />
      <PlanBar plan={plan} />
    </>
  );
}

/** The page: the plan lives here (and in localStorage), shared by the deal cards, the plan section and the phone bar. */
export function SalePage({ view }: { view: SaleView }) {
  const [plan, setPlan] = useState<PlanLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  /* the plan went to the cart: said in the empty plan until something new is added */
  const [sent, setSent] = useState(false);
  const { planKey, deals } = view;
  /* the saved plan is read after the first paint, so the server and the browser render the same page first; a line
     saved before the sale's prices changed is dropped rather than shown at an old price */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const saved: PlanLine[] = JSON.parse(localStorage.getItem(planKey) || "[]");
        const current = new Map(deals.flatMap((d) => d.items.flatMap((it) => it[2].map((o): [string, Opt] => [`${d.id}|${it[0]}|${o[0]}`, o]))));
        setPlan(saved.filter((p) => { const o = current.get(p.key); return !!o && o[1] === p.price && (o[4] || 0) === (p.code || 0); }));
        setSent(localStorage.getItem(sentKey(planKey)) === "1");
      } catch {
        /* nothing saved, or storage blocked */
      }
      setLoaded(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [planKey, deals]);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(planKey, JSON.stringify(plan));
      if (sent && !plan.length) localStorage.setItem(sentKey(planKey), "1");
      else localStorage.removeItem(sentKey(planKey));
    } catch {
      /* private mode: the plan lives for this visit */
    }
  }, [plan, loaded, planKey, sent]);
  const onSent = () => {
    setSent(true);
    setPlan([]);
  };
  return (
    <Sale value={{ ...view, T: LOOKS[view.look] }}>
      <Body plan={plan} setPlan={setPlan} sent={sent && !plan.length} onSent={onSent} />
    </Sale>
  );
}
