"use client";
/* eslint-disable @next/next/no-img-element -- the page's photos are plain images, as on /vip-sale */

/*
 * The VIP Sale page (/vip-sale since 2026-11-18; first shown at /vip-sale-v2): built for visitors who arrive from an ad and do not know the clinic.
 * One message and one button in the hero with real prices beside it, the clinic itself (film, photos, awards, both
 * locations) before the prices, one price list with one final price per package, a list bar that keeps the saving
 * and Check out in view, what happens after buying, the questions new clients ask, a small chat and both phone
 * numbers on every screen.
 *
 * Every price, struck-through price and saving is WooCommerce's (the sale campaign beside the price list); the
 * headline percentage is the best saving a package on this page really reaches. The page shows one final price
 * and no code: where the campaign still needs its checkout code for that price, "Check out" sends the code along
 * with the cart, unseen. A prescription product is shown by name, quantity and price only (Health Canada C.01.044).
 */
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { bfsShort, planPrice, planTotals, type Deal, type Item, type Opt, type PlanLine } from "@/components/bf-sale/data";
import { AWARD_BADGES } from "@/components/reviews/award-badges";
import e2019 from "@/assets/images/awards/even/top-choice-2019.png";
import e2020 from "@/assets/images/awards/even/top-choice-2020.png";
import e2021 from "@/assets/images/awards/even/top-choice-2021.png";
import e2022 from "@/assets/images/awards/even/top-choice-2022.png";
import e2023 from "@/assets/images/awards/even/top-choice-2023.png";
import e2024 from "@/assets/images/awards/even/top-choice-2024.png";
import e2025 from "@/assets/images/awards/even/top-choice-2025.png";
import e2026 from "@/assets/images/awards/even/top-choice-2026.png";
import { Button } from "@/components/ui/button";
import { IconClose, IconPhone, IconPin } from "@/components/ui/icons";
import { CLINICS, HOURS } from "@/config/site";
import { FINANCING_URL } from "@/config/specials";
import { VIP2 as VIP_WORDS, type SaleWords } from "@/config/vip-sale-v2";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { withBase } from "@/lib/base-path";
import { cartKey, checkCart, setCartQty, setTypedCode } from "@/lib/cart";
import { byId } from "@/lib/dom";
import { firstShown, flyTo } from "@/lib/fly-to";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import { formatPrice as money } from "@/lib/prices";
import { tel } from "@/lib/routes";
import { scrollToY } from "@/lib/smooth-scroll";
import type { SaleView } from "@/types/sale";

const CLINIC_PHOTOS = { uptown: "/assets/clinic/clinic-4.jpg", downtown: "/assets/clinic/clinic-1.jpg" };
const FILM = { src: "/assets/clinic/ndm-clinic.mp4", poster: "/assets/clinic/ndm-clinic-poster.jpg" };
const EMAIL = "info@newdermamed.com";
const HOURS_LINE = HOURS.map(([d, h]) => `${d.replace(" – ", " to ")} ${h.replace(" – ", " to ")}`).join(" · ");
const PHONES_LINE = CLINICS.map((c) => `${c.name} at ${c.phone}`).join(" or ");
const mapLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`NewDermaMed, ${address}`)}`;

/** Scrolls to a section of this page, clear of the sticky header. */
const go = (id: string) => (e?: MouseEvent) => {
  const el = byId(id);
  if (!el) return;
  e?.preventDefault();
  scrollToY(el.getBoundingClientRect().top + window.scrollY - 76);
};

/* ------------------------------------------------------------------ words */

/** The page's words: the VIP Sale's, or Black Friday's on /black-friday (same layout, its own colours). */
const Words = createContext<SaleWords>(VIP_WORDS);
const useWords = () => useContext(Words);

/* ------------------------------------------------------------------ tracking */

type Fbq = (kind: "track" | "trackCustom", name: string, data?: Record<string, unknown>) => void;

/**
 * One event per step of the path, for the Meta pixel (and a tag manager's data layer) when the site carries one:
 * AddToCart ("Add to my list"), InitiateCheckout ("Check out"), Contact (a call or the chat) and the custom
 * ConsultationClick. The purchase itself is the confirmation page's event. Nothing about the visitor is sent.
 */
/** The page's event prefix ("vip_sale", "bf_sale"), set by the page from its words once it is on screen. */
let eventPrefix = VIP_WORDS.page.event;

function track(name: string, data: Record<string, unknown> = {}, custom = false): void {
  const w = window as unknown as { fbq?: Fbq; dataLayer?: Record<string, unknown>[] };
  try {
    /* the pixel's event names are Meta's own: the sale travels as a parameter */
    w.fbq?.(custom ? "trackCustom" : "track", name, { ...data, sale: eventPrefix });
    w.dataLayer?.push({ event: `${eventPrefix}_${name}`, ...data });
  } catch {
    /* a blocked or broken tag never breaks the page */
  }
}

/* ------------------------------------------------------------------ the packages */

/** One package of a treatment as this page shows it: the final price, the regular price and the saving. */
interface Pack {
  key: string;
  d: Deal;
  it: Item;
  o: Opt;
  pay: number;
  reg: number;
  save: number;
  pct: number;
  /** "$177 per session", for packages of sessions. */
  each: string;
}

const pack = (d: Deal, it: Item, o: Opt): Pack => {
  const pay = o[4] || o[1];
  const reg = o[2] > pay ? o[2] : 0;
  const n = Number(/(?:package of|^)\s*(\d+)(?:\s*sessions?)?$/i.exec(o[0].trim())?.[1] ?? 0);
  return { key: `${d.id}|${it[0]}|${o[0]}`, d, it, o, pay, reg, save: reg ? reg - pay : 0, pct: reg ? Math.round((1 - pay / reg) * 100) : 0, each: n > 1 && /package|session/i.test(o[0]) ? `${money(pay / n)} per session` : "" };
};
const packsOf = (d: Deal, it: Item): Pack[] => it[2].map((o) => pack(d, it, o));
const allPacks = (deals: Deal[]): Pack[] => deals.flatMap((d) => d.items.flatMap((it) => packsOf(d, it)));
const line = (p: Pack): PlanLine => ({ key: p.key, cat: p.d.c.name, item: bfsShort(p.it[0], p.d.c.name), opt: p.o[0], price: p.o[1], reg: p.o[2] || 0, tag: "", code: p.o[4] || 0, name: p.it[0], pid: p.o[5], vid: p.o[6] });
/** "with PRP - Face" -> "With PRP - Face". */
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/* ------------------------------------------------------------------ the clock */

interface Clock { ready: boolean; over: boolean; pct: number; d: number; h: number; m: number; s: number }

/** Time left until the sale's last minute. The clock can only be read in the browser. */
function useClock(start: number, end: number): Clock {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(t); };
  }, []);
  if (!now) return { ready: false, over: false, pct: 0, d: 0, h: 0, m: 0, s: 0 };
  const ms = Math.max(0, end - now);
  return { ready: true, over: now > end, pct: Math.min(1, Math.max(0, (now - start) / (end - start))), d: Math.floor(ms / 864e5), h: Math.floor((ms % 864e5) / 36e5), m: Math.floor((ms % 36e5) / 6e4), s: Math.floor((ms % 6e4) / 1e3) };
}

/** "2 days 14 hrs", "14 hrs 05 min", "5 min 09 sec". */
const leftWords = (t: Clock): string => {
  if (!t.ready || t.over) return "";
  const two = (n: number) => String(n).padStart(2, "0");
  if (t.d > 0) return `${t.d} ${t.d === 1 ? "day" : "days"} ${t.h} hrs`;
  return t.h > 0 ? `${t.h} hrs ${two(t.m)} min` : `${t.m} min ${two(t.s)} sec`;
};

/* ------------------------------------------------------------------ small pieces */

const Tag = ({ children, dark = false }: { children: ReactNode; dark?: boolean }) => (
  <p className={`flex items-center gap-2.5 font-inter text-[11.5px] font-semibold uppercase tracking-[.17em] ${dark ? "text-[color:var(--v-F0D79B)]" : "text-[color:var(--v-7A5A16)]"}`}><i aria-hidden="true" className="size-[7px] rounded-full bg-[color:var(--v-C9A24E)]" />{children}</p>
);

/** Every h2: two colours, the second on its own line. */
const Title = ({ id, lead, strong, dark = false }: { id: string; lead: string; strong: string; dark?: boolean }) => (
  <h2 id={id} className={`mt-3 font-aeonik text-[clamp(31px,3.6vw,50px)] font-normal leading-[1.06] tracking-[-0.03em] ${dark ? "text-white" : "text-ndm-ink"}`}>{lead}<br /><span className={`tt-strong ${dark ? "text-[color:var(--v-E2C27A)]" : "text-[color:var(--v-0C72AE)]"}`}>{strong}</span></h2>
);

const Photo = ({ src, alt, widths, sizes, className, lazy = true }: { src: string; alt: string; widths: number[]; sizes: string; className: string; lazy?: boolean }) => (
  <img src={optimized(src, widths[widths.length - 1])} srcSet={optimizedSrcSet(src, widths) || undefined} sizes={sizes} alt={alt} loading={lazy ? "lazy" : undefined} decoding="async" className={className} />
);

/** A mobile phone, for the header's two numbers. */
const IconMobile = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 5.3h3" /><path d="M11 18.6h2" /></svg>
);

/** Both clinics' numbers, one under the other. */
const Calls = ({ dark = true, from }: { dark?: boolean; from: string }) => (
  <span className={`block font-inter text-[14.5px] leading-[1.75] ${dark ? "text-white/70" : "text-ndm-muted"}`}>
    {CLINICS.map((c) => (
      <span key={c.id} className="flex items-baseline gap-2 whitespace-nowrap"><span className="w-[78px] shrink-0">{c.name}</span><a href={tel(c.phone)} onClick={() => track("Contact", { method: "phone", clinic: c.name, from })} className={`font-semibold tabular-nums underline-offset-[5px] hover:underline ${dark ? "text-white" : "text-ndm-ink"}`}>{c.phone}</a></span>
    ))}
  </span>
);

/** A styled picker in place of the browser's own select: the chosen value on a pill, the choices on a card. */
function Dropdown({ label, value, options, onChange, wide = false }: { label: string; value: number; options: { text: string; hint?: string }[]; onChange: (index: number) => void; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!open) return;
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    const out = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", key); };
  }, [open]);
  /* the arrow keys change the choice from the pill itself, as they do on a select */
  const step = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const by = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!by) return;
    e.preventDefault();
    onChange(Math.min(options.length - 1, Math.max(0, value + by)));
  };
  return (
    <div ref={box} className={`v2-dd ${open ? "is-open" : ""}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}: ${options[value]?.text ?? ""}`} onClick={() => setOpen((v) => !v)} onKeyDown={step} className="v2-dd-btn">
        <span className="truncate">{options[value]?.text}</span>
        <svg aria-hidden="true" viewBox="0 0 12 8" width="11" height="8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m1 1.5 5 5 5-5" /></svg>
      </button>
      {open && (
        <ul ref={list} role="listbox" aria-label={label} data-lenis-prevent className={`v2-dd-list ${wide ? "is-wide" : ""}`}>
          {options.map((o, i) => (
            <li key={o.text} role="option" aria-selected={i === value} onClick={() => { onChange(i); setOpen(false); }} className="v2-dd-opt">
              <span className="min-w-0 truncate">{o.text}</span>
              {o.hint && <span className="v2-dd-hint">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ header */

function Header({ count, day, openList }: { count: number; day: string; openList: () => void }) {
  const VIP2 = useWords();
  const [calls, setCalls] = useState(false);
  return (
    <>
      <p className="vip-off flex justify-center gap-x-3.5 px-4 py-2.5 text-center font-inter text-[11px] font-bold uppercase leading-[1.35] tracking-[.13em] max-[359px]:gap-x-2.5 max-[359px]:text-[10px] max-[359px]:tracking-[.06em] sm:text-[11.5px] sm:tracking-[.15em]">
        {VIP2.bar.map((w, i) => <span key={w} className="max-md:hidden">{i > 0 && <i aria-hidden="true" className="mr-3.5 not-italic opacity-50">•</i>}{w.replace("{{day}}", day)}</span>)}
        {/* phones: one line; the deadline is in the pill right under the header */}
        {VIP2.barPhone.map((w, i) => <span key={w} className="whitespace-nowrap md:hidden">{i > 0 && <i aria-hidden="true" className="mr-3.5 not-italic opacity-50">•</i>}{w}</span>)}
      </p>
      <header className="sticky top-0 z-50 border-b border-black/[.07] bg-white/95 backdrop-blur-[14px]">
        <div className="relative mx-auto flex h-[64px] max-w-[1280px] items-center justify-between gap-3 px-[var(--gx)]">
          <div className="flex shrink-0 items-center gap-10 xl:gap-14">
            <Link href="/" prefetch={false} className="shrink-0" aria-label="NewDermaMed home"><img src={withBase(VIP2.page.logo)} alt="NewDermaMed" width="317" height="62" className="h-[24px] w-auto min-[360px]:h-[30px] sm:h-[38px]" /></Link>
          <nav aria-label={VIP2.page.navLabel} className="hidden items-center gap-5 font-inter text-[14.5px] font-medium text-ndm-ink lg:flex xl:gap-7">
            <a href="#vip-list" onClick={go("vip-list")} className="v2-nav"><span className="v2-roll"><span>{VIP2.page.nav}</span><span aria-hidden="true">{VIP2.page.nav}</span></span></a>
            <a href="#clinic" onClick={go("clinic")} className="v2-nav"><span className="v2-roll"><span>The Clinics</span><span aria-hidden="true">The Clinics</span></span></a>
          </nav>
          </div>
          <div className="flex items-center gap-2 min-[360px]:gap-2.5 lg:gap-6">
            <p className="hidden items-center gap-2.5 font-inter text-ndm-ink lg:flex">
              <span aria-hidden="true" className="v2-phone"><IconMobile /></span>
              <span className="grid gap-0.5">
                {CLINICS.map((c) => (
                  <a key={c.id} href={tel(c.phone)} onClick={() => track("Contact", { method: "phone", clinic: c.name, from: "header" })} className="flex items-baseline gap-2 whitespace-nowrap text-[14px] font-semibold leading-[1.25] tabular-nums hover:text-[color:var(--v-0C72AE)]"><small className="w-[68px] text-[12.5px] font-normal text-ndm-muted">{c.name}</small>{c.phone}</a>
                ))}
              </span>
            </p>
            <div className="lg:hidden">
              <button type="button" aria-expanded={calls} aria-controls="v2-calls" aria-label="Call Uptown or Downtown" onClick={() => setCalls((v) => !v)} className="v2-phone size-11 shrink-0"><IconMobile /></button>
              {calls && (
                <ul id="v2-calls" role="list" className="absolute right-[var(--gx)] top-[58px] z-10 w-[250px] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_-20px_rgba(11,27,41,.45)] ring-1 ring-black/10">
                  {CLINICS.map((c) => (
                    <li key={c.id} className="border-b border-black/[.07] last:border-0"><a href={tel(c.phone)} onClick={() => { track("Contact", { method: "phone", clinic: c.name, from: "header" }); setCalls(false); }} className="block px-4 py-3 font-inter"><span className="block text-[11.5px] font-semibold uppercase tracking-[.14em] text-ndm-muted">{c.name} · {c.near}</span><span className="mt-0.5 block text-[17px] font-semibold text-ndm-ink">{c.phone}</span></a></li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" onClick={openList} className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[color:var(--v-0B1B29)] pl-3.5 pr-2 font-inter text-[14px] font-semibold text-white min-[360px]:gap-2.5 min-[360px]:pl-4">
              <span className="max-[359px]:hidden">{VIP2.name}</span><span className="min-[360px]:hidden">My list</span><b id="v2-list-count" className={`vip-off fly-${VIP2.page.fly}-ring grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-[12.5px] tabular-nums`}>{count}</b>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

/* ------------------------------------------------------------------ hero */

/** The three prices beside the offer: the package with the best saving first, then the page's sale price cards. */
function useTopPacks(view: SaleView, packs: Pack[]): { p: Pack; title: string; sub: string }[] {
  return useMemo(() => {
    const priced = packs.filter((p) => p.reg > 0);
    const best = [...priced].sort((a, b) => b.pct - a.pct || a.pay - b.pay)[0];
    const out: { p: Pack; title: string; sub: string }[] = [];
    if (best) {
      /* a product named after its category ("Microneedling-Face", "LHR - Lip (Upper)") shows the category with the
         rest as its area; another keeps its own name, cut at its last " - " */
      const cat = best.d.c.name;
      const rest = bfsShort(best.it[0], cat);
      const cut = best.it[0].lastIndexOf(" - ");
      const [title, area] = rest !== best.it[0] ? [cat, cap(rest)] : cut > 0 ? [best.it[0].slice(0, cut), best.it[0].slice(cut + 3)] : [best.it[0], ""];
      out.push({ p: best, title, sub: [area, best.o[0]].filter(Boolean).join(" · ") });
    }
    const cards = view.cards.filter((c) => !c.drug && c.cat && c.regular > c.price);
    for (const c of [...cards.filter((x) => /^(lip filler|skin booster)$/i.test(x.title)), ...cards]) {
      if (out.length >= 3) break;
      const p = priced.find((x) => x.d.id === c.cat && x.it[0] === c.item && x.pay === c.price);
      if (p && !out.some((x) => x.p.key === p.key || x.p.it[0] === p.it[0])) out.push({ p, title: c.title, sub: c.qty });
    }
    return out;
  }, [view.cards, packs]);
}

function Hero({ view, t, day, best, top, inList, toggle }: { view: SaleView; t: Clock; day: string; best: number; top: ReturnType<typeof useTopPacks>; inList: (key: string) => boolean; toggle: (p: Pack, from: string, el?: HTMLElement, name?: string) => void }) {
  const VIP2 = useWords();
  const { photo } = view.copy.hero;
  const left = leftWords(t);
  return (
    <section aria-labelledby="v2-title" className="vip-hero relative isolate overflow-hidden text-white">
      <img src={optimized(photo.src, 1080)} srcSet={optimizedSrcSet(photo.src, [640, 828, 1080, 1920]) || undefined} sizes="(min-width: 1024px) 60vw, 100vw" width={photo.width} height={photo.height} alt="" fetchPriority="high" className="vip-hero-pic absolute right-0 top-0 -z-10 h-[46%] w-full object-cover object-[58%_50%] lg:h-full lg:w-[60%]" />
      <div className="vip-hero-in mx-auto grid max-w-[1280px] gap-8 px-[var(--gx)] pb-[clamp(34px,4.4vw,60px)] pt-[clamp(26px,4.4vw,60px)] lg:grid-cols-[minmax(0,1.06fr)_minmax(0,.94fr)] lg:items-center lg:gap-12">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/[.16] bg-white/[.08] px-3.5 py-2 font-inter text-[11px] font-semibold uppercase leading-[1.2] tracking-[.14em] text-[color:var(--v-E6EDF5)] sm:text-[11.5px] sm:tracking-[.17em]">
            <i aria-hidden="true" className="vip-live shrink-0" />{t.over ? VIP2.page.ended : <>Ends {day}{left && <> · {left} left</>}</>}
          </p>
          <h1 id="v2-title" className="mt-5 font-aeonik font-normal text-white">
            <span className="block text-[clamp(46px,5.6vw,76px)] leading-none tracking-[-0.02em]">{VIP2.page.heading[0]} <span className="tt-strong v2-shine">{VIP2.page.heading[1]}</span></span>
            {best > 0 && (
              <span className="mt-1 flex flex-wrap items-baseline gap-x-3 leading-none">
                <small className="font-inter text-[12px] font-semibold uppercase tracking-[.3em] text-[color:var(--v-D5DEE8)]">Up to</small>
                <b className="v2-gold text-[clamp(96px,11.5vw,156px)] font-normal leading-[.98] tracking-[-0.03em]">{best}%</b>
                <span className="tt-strong text-[clamp(40px,4.6vw,62px)] text-white">off</span>
              </span>
            )}
          </h1>
          <p className="mt-3 max-w-[44ch] font-inter text-[16px] leading-[1.6] text-[color:var(--v-C4CEDA)] sm:text-[17px]">{VIP2.hero.sub} <strong className="font-semibold text-white">{VIP2.hero.gift}</strong>. {VIP2.hero.welcome}</p>
          <div id="v2-cta" className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3.5">
            <a href="#vip-list" onClick={go("vip-list")} className="btn bfd-cta h-[54px] px-8 text-[16.5px] font-semibold max-sm:w-full">{VIP2.hero.button}</a>
            <a href="#/book" onClick={() => track("ConsultationClick", { from: "hero" }, true)} className="font-inter text-[14.5px] leading-[1.45] text-[color:var(--v-F0D79B)] underline decoration-[color:var(--v-F0D79B)]/50 underline-offset-[5px] max-sm:w-full max-sm:text-center">{VIP2.hero.link}</a>
          </div>
        </div>
        {top.length > 0 && (
          <div className="vip-cd rounded-[22px] px-5 pb-5 pt-1.5 shadow-[0_30px_70px_rgba(0,0,0,.45)] sm:px-[26px]">
            <p className="flex items-center justify-between gap-3 py-4 font-inter text-[11.5px] font-semibold uppercase tracking-[.17em] text-[color:var(--v-DCE4EC)]"><span className="inline-flex items-center gap-2.5"><i aria-hidden="true" className="size-[7px] rounded-full bg-[color:var(--v-C9A24E)]" />{VIP2.hero.card}</span><span className="whitespace-nowrap text-white/50">{day}</span></p>
            <ul role="list">
              {top.map(({ p, title, sub }) => {
                const on = inList(p.key);
                return (
                  <li key={p.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-white/10 py-3.5">
                    <div className="min-w-0">
                      {/* every row says its own saving, worked out from its two prices */}
                      {p.pct > 0 && <span className="v2-tag mb-2">{p.pct}% off</span>}
                      <span className="block font-aeonik text-[clamp(19px,1.7vw,22px)] leading-[1.2] text-white">{title}</span>
                      <span className="mt-0.5 block font-inter text-[13.5px] text-white/55">{sub}</span>
                    </div>
                    <p className="self-end whitespace-nowrap text-right"><b className="font-aeonik text-[clamp(28px,2.5vw,33px)] font-normal leading-none text-white">{money(p.pay)}</b><s className="ml-2 font-inter text-[13.5px] text-white/50">{money(p.reg)}</s></p>
                    <button type="button" aria-pressed={on} onClick={(e) => toggle(p, "hero", e.currentTarget, title)} className={`v2-mini justify-self-start ${on ? "is-on" : ""}`}>{on ? VIP2.list.added : VIP2.list.add}</button>
                    <p className="text-right font-inter text-[13.5px] font-semibold text-[color:var(--v-F0D79B)]">Save {money(p.save)}</p>
                  </li>
                );
              })}
            </ul>
            {!t.over && <div className="bft-bar mt-2"><i style={{ width: `${(t.pct * 100).toFixed(1)}%` }} /></div>}
            {left && <p className="mt-2.5 font-inter text-[13.5px] text-white/55">{left} {VIP2.hero.cardFoot}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

/** Who the clinic is, in one line under the hero: the award, the years, the free first visit, both locations. */
function Strip() {
  const VIP2 = useWords();
  const s = VIP2.strip;
  return (
    <ul role="list" aria-label="About NewDermaMed" className="grid grid-cols-2 bg-[color:var(--v-0A1722)] font-inter text-[13.5px] leading-[1.4] text-[color:var(--v-C4CEDA)] lg:grid-cols-[1.15fr_.8fr_1.2fr_1.1fr]">
      <li className="v2-cell"><Image src={AWARD_BADGES[2026]} alt="" width={34} height={34} className="size-[34px] shrink-0 object-contain" /><span><b>{s.award}</b> {s.awardYears}</span></li>
      <li className="v2-cell"><span aria-hidden="true" className="grid size-[34px] shrink-0 place-items-center rounded-full border-[1.5px] border-[color:var(--v-E2C27A)] font-inter text-[14px] font-bold leading-none tracking-[-0.02em] text-[color:var(--v-E2C27A)] tabular-nums">16</span><span><b>{s.years}</b> {s.yearsIn}</span></li>
      <li className="v2-cell"><span>{s.visit}</span></li>
      <li className="v2-cell"><IconPin className="shrink-0 text-[color:var(--v-E2C27A)]" /><span><b>2 clinics</b> {CLINICS.map((c) => c.near).join(" · ")}</span></li>
    </ul>
  );
}

/* ------------------------------------------------------------------ the clinic */

/** The clinic film: a still until it is asked for, so a phone on mobile data downloads nothing it will not watch. */
function Film() {
  const VIP2 = useWords();
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[22px] bg-[color:var(--v-EDEBE6)]">
      {on
        ? <video src={withBase(FILM.src)} poster={withBase(FILM.poster)} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-[color:var(--v-EDEBE6)] object-cover" />
        : (
          <button type="button" onClick={() => { setOn(true); track("ClinicFilmPlay", {}, true); }} aria-label={VIP2.clinic.videoLabel} className="group absolute inset-0 grid place-items-center">
            <Photo src={FILM.poster} alt="" widths={[640, 828, 1080]} sizes="(min-width: 1024px) 640px, 100vw" className="absolute inset-0 h-full w-full object-cover" />
                        <span aria-hidden="true" className="v2-play" />
          </button>
        )}
    </div>
  );
}

/* the eight badges with even edges (the shared files carry different empty margins, so they looked unequal) */
const BADGES: [year: number, badge: StaticImageData][] = [[2019, e2019], [2020, e2020], [2021, e2021], [2022, e2022], [2023, e2023], [2024, e2024], [2025, e2025], [2026, e2026]];

/**
 * The clinic's standing: the award of every year, and the three numbers the site states everywhere. When the block
 * comes into view the badges arrive one year at a time and the three numbers count up with them; the awards number
 * lands last with a gold shine and two rings.
 */
function Awards() {
  const VIP2 = useWords();
  const c = VIP2.clinic;
  const total = BADGES.length;
  const box = useRef<HTMLDivElement>(null);
  /* the full count until the browser takes over, so the page reads right without scripts and with reduced motion */
  const [n, setN] = useState(total);
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let timer = 0;
    const raf = requestAnimationFrame(() => setN(0));
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      let k = 0;
      timer = window.setInterval(() => { k += 1; setN(k); if (k >= total) clearInterval(timer); }, 300);
    }, { threshold: 0.55 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); clearInterval(timer); };
  }, [total]);
  return (
    <div ref={box} className="mt-8 grid gap-6 rounded-[22px] bg-[color:var(--v-FAFAF8)] p-5 ring-1 ring-black/[.07] sm:p-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-10">
      <div>
        <p className="font-aeonik text-[clamp(22px,2.2vw,28px)] leading-[1.2] text-ndm-ink">{c.awardLead}</p>
        <p className="mt-1 font-inter text-[14.5px] text-ndm-muted">{c.awardText}</p>
        <ul role="list" aria-label="Top Choice Awards, 2019 to 2026" className="mt-4 grid grid-cols-8 gap-1.5 sm:gap-3">
          {BADGES.map(([year, badge], i) => (
            <li key={year} className={`v2-badge ${i < n ? "is-in" : ""} ${i === n - 1 && n < total ? "is-new" : ""}`}>
              <Image src={badge} alt={`Top Choice Award ${year}`} sizes="64px" className="aspect-square h-auto w-full max-w-[64px] object-contain" />
              <span className="mt-1.5 block max-w-[64px] text-center font-inter text-[10.5px] font-semibold tabular-nums text-ndm-muted sm:text-[11.5px]">{year}</span>
            </li>
          ))}
        </ul>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-center sm:grid-cols-[1fr_1fr_auto] lg:gap-5 xl:grid-cols-[auto_auto_auto]">
        {c.facts.map((f, i) => {
          /* every number counts in step with the badges; the awards number is the one the block is about */
          const [, digits, tail = ""] = /^(\d+)(.*)$/.exec(f.figure) ?? [];
          const to = Number(digits);
          const star = to === total;
          const value = Math.floor((to * n) / total);
          const done = n === total;
          return (
            <div key={f.label} className={i ? "border-l border-black/10 pl-3 lg:pl-5" : ""}>
              <dd className="font-aeonik text-[clamp(38px,4.2vw,56px)] leading-none tracking-[-0.03em]">
                {digits
                  ? (
                    <>
                      <span className="sr-only">{f.figure}</span>
                      <span aria-hidden="true" className={`v2-fig ${star ? "v2-fig-star" : ""} ${done ? "is-done" : ""}`}>
                        <span key={value} className="v2-gold-d v2-count inline-block tabular-nums">{value}</span>
                        {tail && <span className="v2-gold-d">{tail}</span>}
                      </span>
                    </>
                  )
                  : <span className="v2-gold-d">{f.figure}</span>}
              </dd>
              <dt className="mt-2 font-inter text-[12.5px] leading-[1.35] text-ndm-muted sm:whitespace-nowrap">{f.label}</dt>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function Clinic() {
  const VIP2 = useWords();
  const c = VIP2.clinic;
  return (
    <section id="clinic" aria-labelledby="v2-clinic-title" className="scroll-mt-[64px] bg-white px-[var(--gx)] pb-[clamp(68px,8.6vw,128px)] pt-[clamp(44px,6vw,84px)] text-ndm-ink">
      <div className="mx-auto max-w-[1180px]">
        <Tag>{c.tag}</Tag>
        <Title id="v2-clinic-title" lead={c.lead} strong={c.strong} />
        <p className="mt-3 max-w-[52ch] font-inter text-[16px] leading-[1.6] text-ndm-muted">{c.text}</p>
        <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.9fr)] lg:gap-[22px]">
          <div className="min-w-0">
            <Film />
            <ul role="list" className="no-scrollbar -mx-[var(--gx)] mt-3 flex gap-2.5 overflow-x-auto px-[var(--gx)] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0">
              {c.photos.map((p) => (
                <li key={p.src} className="relative aspect-[4/3] w-[136px] shrink-0 overflow-hidden rounded-[14px] sm:w-auto">
                  <Photo src={p.src} alt={p.alt} widths={[256, 384]} sizes="(min-width: 640px) 150px, 136px" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color:var(--v-0B1B29)]/45 to-transparent px-2.5 pb-2 pt-7 [text-shadow:0_1px_3px_rgba(11,27,41,.55)] font-inter text-[10.5px] font-semibold uppercase tracking-[.1em] text-white/90">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul role="list" className="grid min-w-0 gap-3.5">
            {CLINICS.map((k) => (
              <li key={k.id} className="grid grid-cols-[88px_minmax(0,1fr)] content-center items-start gap-4 rounded-[20px] bg-[color:var(--v-FAFAF8)] p-4 ring-1 ring-black/[.07] sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-[18px]">
                <div className="relative aspect-square overflow-hidden rounded-[14px]"><Photo src={CLINIC_PHOTOS[k.id]} alt={`The NewDermaMed ${k.name} clinic`} widths={[256]} sizes="112px" className="absolute inset-0 h-full w-full object-cover" /></div>
                <div className="min-w-0">
                  <p className="font-inter text-[10.5px] font-semibold uppercase tracking-[.14em] text-[color:var(--v-7A5A16)]">{k.near}</p>
                  <h3 className="mt-1 font-aeonik text-[23px] font-normal leading-[1.15] text-ndm-ink">{k.name}</h3>
                  <p className="mt-1.5 font-inter text-[13.5px] leading-[1.5] text-ndm-ink">{k.address}</p>
                  <p className="mt-1 font-inter text-[13px] leading-[1.5] text-ndm-muted">{k.directions}</p>
                  <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-inter">
                    <a href={tel(k.phone)} onClick={() => track("Contact", { method: "phone", clinic: k.name, from: "clinic" })} className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-ndm-ink"><IconPhone />{k.phone}</a>
                    <a href={mapLink(k.address)} target="_blank" rel="noopener" className="text-[13.5px] font-semibold text-[color:var(--v-0C72AE)] underline decoration-[color:var(--v-0C72AE)]/40 underline-offset-[5px]">Directions</a>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 font-inter text-[13.5px] text-ndm-muted">Both clinics: {HOURS_LINE}</p>
        <Awards />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ the price list */

function Row({ d, best, order, inList, toggle }: { d: Deal; best: number; order: number; inList: (key: string) => boolean; toggle: (p: Pack, from: string, el?: HTMLElement, name?: string) => void }) {
  const VIP2 = useWords();
  /* the row that carries the headline opens on that package, so its price shows first; the others open on their first */
  const start = useMemo(() => {
    let at: [number, number] = [0, 0];
    let top = -1;
    d.items.forEach((it, i) => packsOf(d, it).forEach((p, k) => { if (p.pct > top) { top = p.pct; at = [i, k]; } }));
    return top === best ? at : ([0, 0] as [number, number]);
  }, [d, best]);
  const [ii, setIi] = useState(start[0]);
  const [pick, setPick] = useState(start[1]);
  const it = d.items[ii] ?? d.items[0];
  const packs = packsOf(d, it);
  const p = packs[pick] ?? packs[0];
  const on = inList(p.key);
  const cat = d.c.name;
  const areas = d.items.length > 1;
  return (
    <li className={`v2-row ${on ? "is-on" : ""}`} style={{ "--i": Math.min(order, 9) } as CSSProperties}>
      <h3 className="v2-row-name flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 font-aeonik text-[20px] font-normal leading-[1.25] text-ndm-ink xl:text-[19px]"><span className="v2-row-title min-w-0 font-semibold">{cat}</span>{/* every row says the saving of the package it shows, worked out from its two prices; a package without a regular price has none */}{p.pct > 0 && <span className="v2-tag">{p.pct}% off</span>}</h3>
      <div className={`v2-row-pick grid gap-2 ${areas ? "grid-cols-[minmax(0,1fr)_minmax(0,var(--v2-pack,148px))]" : "grid-cols-1"}`}>
        {areas && <Dropdown label={`${cat}: treatment or area`} value={ii} options={d.items.map((x) => ({ text: cap(bfsShort(x[0], cat)) }))} onChange={(k) => { setIi(k); setPick(0); }} />}
        {packs.length > 1
          ? <Dropdown wide={areas} label={`${cat}: package`} value={pick} options={packs.map((x) => ({ text: x.o[0], hint: money(x.pay) }))} onChange={setPick} />
          : !areas && <p className="font-inter text-[14.5px] text-ndm-muted">{[cap(bfsShort(it[0], cat)), p.o[0]].filter((x, k, a) => x && a.indexOf(x) === k && x !== cat).join(" · ")}</p>}
        {packs.length === 1 && areas && <p className="self-center pl-2 font-inter text-[14.5px] text-ndm-muted">{p.o[0]}</p>}
      </div>
      <p className="v2-row-price whitespace-nowrap">
        <b className="font-aeonik text-[28px] font-normal leading-[1.1] text-ndm-ink tabular-nums">{money(p.pay)}</b>
        {p.reg > 0 && <s className="ml-2 font-inter text-[14px] text-[color:var(--v-7D8B9C)]">{money(p.reg)}</s>}
        {(p.save > 0 || p.each) && <span className="mt-0.5 block font-inter text-[13.5px] font-semibold text-[color:var(--v-0C72AE)]">{p.save > 0 && <>Save {money(p.save)}</>}{p.save > 0 && p.each && <span className="font-normal text-ndm-muted max-[1359px]:hidden"> · </span>}{p.each && <span className="font-normal text-ndm-muted max-[1359px]:block">{p.each}</span>}</span>}
      </p>
      <button type="button" aria-pressed={on} onClick={(e) => toggle(p, "list", e.currentTarget, cat)} className={`v2-add ${on ? "is-on" : ""}`}>{on ? VIP2.list.added : VIP2.list.add}</button>
    </li>
  );
}

function PriceList({ view, rows, best, day, inList, toggle }: { view: SaleView; rows: Deal[]; best: number; day: string; inList: (key: string) => boolean; toggle: (p: Pack, from: string, el?: HTMLElement, name?: string) => void }) {
  const VIP2 = useWords();
  const tabs = view.tabs.slice(1);
  const [tab, setTab] = useState("All");
  /* the rows play their entrance only once a tab has been chosen, never on the page's first paint */
  const [played, setPlayed] = useState(false);
  const shown = rows.filter((d) => tab === "All" || d.group === tab);
  const bar = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  /* a filter chosen while the bar is fixed over the list (rows have passed under it) brings the list's first row
     back under the bar, so the new list is read from its top. Measured after the new list is drawn, against the
     place the bar is fixed at (the header's height), because a shorter list can carry the bar itself off screen. */
  const [jump, setJump] = useState(0);
  const pick = (x: string) => {
    if (x !== tab) { setTab(x); setPlayed(true); }
    setJump((n) => n + 1);
  };
  useEffect(() => {
    if (!jump || !bar.current || !panel.current) return;
    const under = 64 + bar.current.offsetHeight;
    const top = panel.current.getBoundingClientRect().top;
    if (top < under) scrollToY(top + window.scrollY - under - 8, true);
  }, [jump]);
  return (
    <section id="vip-list" aria-labelledby="v2-list-title" className="scroll-mt-[64px] px-[var(--gx)] py-[clamp(68px,8.6vw,128px)]">
      <div className="mx-auto max-w-[1180px]">
        <Tag>{rows.length} treatments on sale</Tag>
        <Title id="v2-list-title" lead={VIP2.list.lead} strong={VIP2.list.strong} />
        <p className="mt-2.5 font-inter text-[16px] leading-[1.6] text-ndm-muted">{VIP2.list.text.replace("{{day}}", day)}</p>
        {/* the filters stay under the page header for as long as the list is on screen; the strip is the page's own
            colour, so it only shows once rows pass under it */}
        <div ref={bar} className="v2-tabs sticky top-[64px] z-40 -mx-[var(--gx)] mt-3 px-[var(--gx)] py-3">
          <div role="group" aria-label="Filter the price list" className="no-scrollbar -mx-[var(--gx)] flex gap-2 overflow-x-auto px-[var(--gx)] sm:mx-0 sm:flex-wrap sm:px-0">
            {["All", ...tabs].map((x) => <button key={x} type="button" aria-pressed={tab === x} onClick={() => pick(x)} className="v2-chip">{x}</button>)}
          </div>
        </div>
        <div ref={panel} className="v2-panel mt-2 rounded-[22px] bg-white px-4 py-1 shadow-[0_14px_40px_rgba(16,32,48,.08)] sm:px-[26px]">
          <ul key={tab} role="list" className={played ? "v2-rows-in" : undefined}>{shown.map((d, i) => <Row key={d.id} d={d} best={best} order={i} inList={inList} toggle={toggle} />)}</ul>
        </div>
        <p className="mx-1 mt-4 font-inter text-[13.5px] leading-[1.55] text-ndm-muted">{VIP2.list.fine}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ after the list */

function Next({ day, openChat }: { day: string; openChat: () => void }) {
  const VIP2 = useWords();
  const n = VIP2.next;
  return (
    <section aria-labelledby="v2-next-title" className="px-[var(--gx)] pb-[clamp(44px,6vw,84px)]">
      <div className="mx-auto max-w-[1180px] border-t border-black/10 pt-[clamp(40px,5vw,68px)]">
        <Tag>{n.tag}</Tag>
        <Title id="v2-next-title" lead={n.lead} strong={n.strong} />
        <ol role="list" className="mt-7 grid rounded-[22px] bg-white px-5 shadow-[0_14px_40px_rgba(16,32,48,.08)] sm:px-[26px] md:grid-cols-3 md:px-0">
          {n.steps.map((s, i) => (
            <li key={s.title} className={`grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 py-5 md:block md:px-[30px] md:py-[30px] ${i ? "border-t border-black/[.08] md:border-l md:border-t-0" : ""}`}>
              <span aria-hidden="true" className="font-aeonik text-[30px] leading-none text-[color:var(--v-A9812E)] tabular-nums md:text-[34px]">0{i + 1}</span>
              <div className="min-w-0">
                <h3 className="font-aeonik text-[21px] font-normal leading-[1.2] text-ndm-ink md:mt-[18px] md:text-[23px]">{s.title}</h3>
                <p className="mt-1.5 font-inter text-[15px] leading-[1.6] text-ndm-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="vip-dark mt-3.5 grid items-center gap-x-10 gap-y-6 rounded-[22px] p-6 text-white sm:p-[30px] md:mt-[22px] lg:grid-cols-[minmax(0,1fr)_auto] lg:px-[38px] lg:py-[34px]">
          <div className="min-w-0">
            <Tag dark>{n.keep.tag}</Tag>
            <h3 className="mt-3 font-aeonik text-[clamp(25px,2.4vw,31px)] font-normal leading-[1.15]">{n.keep.title}</h3>
            <p className="mt-2 max-w-[46ch] font-inter text-[15.5px] leading-[1.6] text-[color:var(--v-C4CEDA)]">{n.keep.text.replace("{{day}}", day)}</p>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Button href="#/book" v="book" hot onClick={() => track("ConsultationClick", { from: "keep-price" }, true)}>Book Free Consultation</Button>
              <button type="button" onClick={openChat} className="btn btn-glass"><span>Chat with us</span></button>
            </div>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 font-inter text-[14.5px] text-white/70">
              <span className="max-sm:basis-full">or call</span>
              {CLINICS.map((c) => (
                <span key={c.id} className="whitespace-nowrap">{c.name} <a href={tel(c.phone)} onClick={() => track("Contact", { method: "phone", clinic: c.name, from: "keep-price" })} className="ml-1 font-semibold tabular-nums text-white underline-offset-[5px] hover:underline">{c.phone}</a></span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Questions({ day }: { day: string }) {
  const VIP2 = useWords();
  const f = VIP2.faq;
  return (
    <section aria-labelledby="v2-faq-title" className="bg-white px-[var(--gx)] py-[clamp(88px,11.5vw,176px)]">
      <div className="mx-auto max-w-[1180px]">
        <Tag>{f.tag}</Tag>
        <Title id="v2-faq-title" lead={f.lead} strong={f.strong} />
        <div className="mt-9 border-t border-black/10">
          {f.items.map(([q, a], i) => (
            <details key={q} open={i === 0} className="v2-q border-b border-black/10">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-1 py-4 font-inter text-[16px] font-semibold text-ndm-ink">{q}</summary>
              <p className="max-w-[70ch] px-1 pb-[18px] font-inter text-[15.5px] leading-[1.6] text-ndm-muted">{a.replace("{{day}}", day)}{/pay over time/i.test(q) && <> <a href={FINANCING_URL} target="_blank" rel="noopener" className="font-semibold text-[color:var(--v-0C72AE)] underline underline-offset-[5px]">See financing</a></>}</p>
            </details>
          ))}
        </div>
        <p className="mx-1 mt-6 font-inter text-[14.5px] text-ndm-muted"><Link href="/before-after" prefetch={false} className="font-semibold text-[color:var(--v-0C72AE)] underline underline-offset-[5px]">{f.gallery}</Link> · {f.galleryNote}</p>
      </div>
    </section>
  );
}

/* The closing band, after dermahub.ca's: a light ground with wide rings, a small tag, one large two-line heading,
   a sentence, the button and a call pill for each clinic, then the hours and both intersections on one line. */
function Final({ t, day }: { t: Clock; day: string }) {
  const VIP2 = useWords();
  const left = leftWords(t);
  const f = VIP2.final;
  return (
    <section aria-labelledby="v2-final-title" className="v2-final relative isolate overflow-hidden px-[var(--gx)] pb-[clamp(36px,4.4vw,60px)] pt-[clamp(48px,5.6vw,80px)] text-center text-ndm-ink">
      <span aria-hidden="true" className="v2-rings" />
      <div className="relative mx-auto max-w-[900px]">
        <p className="inline-flex items-center gap-3 font-inter text-[12px] font-semibold uppercase tracking-[.2em] text-[color:var(--v-7A5A16)]"><i aria-hidden="true" className="h-px w-9 bg-[color:var(--v-C9A24E)]" />{left ? `${left} left` : f.tag}</p>
        <h2 id="v2-final-title" className="mt-5 font-aeonik text-[clamp(34px,4vw,54px)] font-normal leading-[1.08] tracking-[-0.03em]">{f.lead}<br className="lg:hidden" /> <span className="tt-strong text-[color:var(--v-A9812E)]">{day}.</span></h2>
        <p className="mx-auto mt-5 max-w-[54ch] font-inter text-[clamp(16px,1.3vw,18px)] leading-[1.65] text-ndm-muted [text-wrap:balance] lg:max-w-[78ch]">{f.text}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href="#vip-list" onClick={go("vip-list")} className="btn bfd-cta h-[56px] px-9 text-[16.5px] font-semibold max-sm:w-full">{VIP2.hero.button}</a>
          {CLINICS.map((c) => (
            <a key={c.id} href={tel(c.phone)} onClick={() => track("Contact", { method: "phone", clinic: c.name, from: "final" })} className="v2-call max-sm:w-full"><span className="text-ndm-muted">{c.name}</span><b className="font-semibold tabular-nums">{c.phone}</b><IconMobile /></a>
          ))}
        </div>
        <p className="mt-6 font-inter text-[14px] leading-[1.6] text-ndm-muted">{HOURS_LINE} · {CLINICS.map((c) => c.near).join(" and ")}</p>
      </div>
    </section>
  );
}

/** "10am" -> 10, "7pm" -> 19, "5:30pm" -> 17.5. */
const hourOf = (text: string): number => {
  const m = /(\d+)(?::(\d+))?\s*(am|pm)/i.exec(text);
  if (!m) return 0;
  return (Number(m[1]) % 12) + (m[3].toLowerCase() === "pm" ? 12 : 0) + Number(m[2] ?? 0) / 60;
};
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** The clinics' hours by weekday (0 Sunday), read from the site's own hours; a day not named there is closed. */
const WEEK: ([open: number, close: number, closes: string, opens: string] | null)[] = DAYS.map((day) => {
  for (const [days, hours] of HOURS) {
    const [from, to = from] = days.split(" – ").map((d) => DAYS.indexOf(d.trim()));
    const [opens, closes] = hours.split(" – ");
    if (from >= 0 && DAYS.indexOf(day) >= from && DAYS.indexOf(day) <= to) return [hourOf(opens), hourOf(closes), closes, opens];
  }
  return null;
});

/** Whether the clinics are open right now, by their regular hours in Toronto time. Read in the browser only. */
function useOpenNow(): { open: boolean; text: string } | null {
  const [state, setState] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    const read = () => {
      const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "long", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
      const get = (type: string) => parts.find((x) => x.type === type)?.value ?? "";
      const day = DAYS.indexOf(get("weekday"));
      const now = Number(get("hour")) + Number(get("minute")) / 60;
      const today = WEEK[day];
      if (today && now >= today[0] && now < today[1]) return setState({ open: true, text: `Open Now, Until ${today[2].toUpperCase()}` });
      if (today && now < today[0]) return setState({ open: false, text: `Opens Today At ${today[3].toUpperCase()}` });
      for (let k = 1; k <= 7; k++) {
        const next = WEEK[(day + k) % 7];
        if (next) return setState({ open: false, text: `Opens ${k === 1 ? "Tomorrow" : DAYS[(day + k) % 7]} At ${next[3].toUpperCase()}` });
      }
    };
    const raf = requestAnimationFrame(read);
    const t = setInterval(read, 60_000);
    return () => { cancelAnimationFrame(raf); clearInterval(t); };
  }, []);
  return state;
}

/* The footer, after dermahub.ca's (a light ground with soft glows, the logo and a status pill above a hairline, then
   cards), kept to what a visitor from an ad needs: both clinics with a number to call, the hours, one button back
   to the prices, and the sale's terms. */
function Footer() {
  const VIP2 = useWords();
  const f = VIP2.footer;
  const now = useOpenNow();
  return (
    <footer className="v2-foot relative overflow-hidden px-[var(--gx)] pb-[calc(104px+env(safe-area-inset-bottom))] text-ndm-ink">
      <span aria-hidden="true" className="v2-foot-glow" />
      <div className="relative mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-5">
            <Link href="/" prefetch={false} aria-label="NewDermaMed home"><img src={withBase(VIP2.page.logo)} alt="NewDermaMed" width="317" height="62" loading="lazy" className="h-[46px] w-auto md:h-[58px]" /></Link>
            <span aria-hidden="true" className="hidden h-9 w-px bg-black/15 lg:block" />
            <p className="hidden max-w-[26ch] font-aeonik text-[17px] italic leading-[1.35] text-ndm-muted lg:block">{f.line}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            {now && <span className="inline-flex items-center gap-2.5 rounded-full border border-black/[.12] bg-white/70 px-4 py-2.5 font-inter text-[13.5px] text-ndm-muted"><i aria-hidden="true" className={`v2-dot ${now.open ? "is-open" : ""}`} />{now.text}</span>}
          </div>
        </div>
        <span aria-hidden="true" className="block h-px w-full bg-gradient-to-r from-[color:var(--v-C9A24E)] via-black/15 to-transparent" />
        <div className="grid gap-4 py-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)] lg:gap-5 lg:py-12">
          {CLINICS.map((k) => (
            <section key={k.id} aria-label={`${k.name} clinic`} className="rounded-[26px] border border-black/[.08] bg-white/60 p-6 backdrop-blur-sm sm:p-7">
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[.16em] text-[color:var(--v-7A5A16)]">{k.near}</p>
              <h2 className="mt-1.5 font-aeonik text-[28px] font-normal leading-[1.1] text-ndm-ink">{k.name}</h2>
              <address className="mt-3 font-inter text-[15px] not-italic leading-[1.6] text-ndm-ink">{k.address}</address>
              <p className="mt-1 font-inter text-[13px] leading-[1.5] text-ndm-muted">{k.note}</p>
              <a href={tel(k.phone)} onClick={() => track("Contact", { method: "phone", clinic: k.name, from: "footer" })} className="group mt-5 flex items-center gap-3.5 font-inter text-[19px] font-semibold tabular-nums text-ndm-ink">
                <span aria-hidden="true" className="v2-phone size-11 transition-transform duration-300 group-hover:scale-105"><IconMobile /></span>{k.phone}
              </a>
              <a href={mapLink(k.address)} target="_blank" rel="noopener" className="mt-4 inline-block font-inter text-[13.5px] font-semibold text-[color:var(--v-0C72AE)] underline decoration-[color:var(--v-0C72AE)]/40 underline-offset-[5px]">Directions</a>
            </section>
          ))}
          <section aria-label="Hours" className="rounded-[26px] border border-black/[.08] bg-white/45 p-6 sm:p-7 md:col-span-2 lg:col-span-1">
            <p className="font-inter text-[11px] font-semibold uppercase tracking-[.16em] text-[color:var(--v-7A5A16)]">{f.hoursTag}</p>
            <h2 className="mt-1.5 font-aeonik text-[28px] font-normal leading-[1.1] text-ndm-ink">{f.hours}</h2>
            <ul role="list" className="mt-4 font-inter text-[14.5px]">
              {HOURS.map(([d, h]) => <li key={d} className="flex items-center justify-between gap-4 border-b border-black/[.09] py-3 first:border-t"><span className="text-ndm-muted">{d.replace(" – ", " to ")}</span><span className="whitespace-nowrap font-semibold tabular-nums">{h.replace(" – ", " to ")}</span></li>)}
            </ul>
            <a href={`mailto:${EMAIL}`} className="mt-5 inline-block break-all font-inter text-[14.5px] font-semibold text-ndm-ink underline decoration-black/25 underline-offset-[5px]">{EMAIL}</a>
          </section>
        </div>
        <div className="border-t border-black/[.09] py-7">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 font-inter text-[13.5px] text-ndm-muted">
            <p>© 2026 NewDermaMed Cosmetic Surgery and Laser Clinic</p>
            <p className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/about" prefetch={false} className="hover:text-ndm-ink">About the clinic</Link><Link href="/privacy" prefetch={false} className="hover:text-ndm-ink">Privacy</Link><Link href="/terms" prefetch={false} className="hover:text-ndm-ink">Terms</Link></p>
          </div>
          <p className="mt-4 max-w-[110ch] font-inter text-[12px] leading-[1.6] text-ndm-muted">{VIP2.terms}</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ the list: bar and sheet */

/** The chat mark: a speech bubble in the page's gold. */
const IconChat = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" className="text-[color:var(--v-E2C27A)]" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);

function ListBar({ list, t, show, openList, checkout, chatOpen, toggleChat }: { list: PlanLine[]; t: Clock; show: boolean; openList: () => void; checkout: () => void; chatOpen: boolean; toggleChat: () => void }) {
  const VIP2 = useWords();
  const { withCode, saved } = planTotals(list);
  const n = list.length;
  const left = leftWords(t);
  if (!n && !show) return null;
  return (
    <div className={`fixed inset-x-0 bottom-0 z-[60] border-t border-white/[.14] bg-[color:var(--v-09141F)]/95 pb-[env(safe-area-inset-bottom)] text-white shadow-[0_-10px_30px_rgba(0,0,0,.35)] backdrop-blur-[10px] ${n ? "" : "lg:hidden"}`}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-2 px-[var(--gx)] py-2.5 sm:gap-3">
        {/* phones: the chat lives in the bar as a small icon, so nothing floats over the price list */}
        <button type="button" aria-expanded={chatOpen} aria-label={VIP2.chat.title} onClick={toggleChat} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 bg-white/[.06] sm:hidden"><IconChat /></button>
        {n ? (
          <>
            <button type="button" onClick={openList} aria-live="polite" className="min-w-0 flex-1 overflow-hidden text-left font-inter leading-[1.3]">
              <b className="block text-[13.5px] sm:whitespace-nowrap font-semibold sm:text-[14.5px]"><span className="max-sm:hidden">{VIP2.name}: </span><span id="v2-bar-count" className="inline-block whitespace-nowrap">{n} {n === 1 ? "treatment" : "treatments"}</span><span className="tabular-nums sm:hidden"> <span className="whitespace-nowrap">· {money(withCode)}</span></span> <span className="font-normal text-white/60 underline underline-offset-[5px] max-sm:hidden">View</span></b>
              {saved > 0 && <span className="block text-[13.5px] font-semibold text-[color:var(--v-F0D79B)]">You save {money(saved)}</span>}
            </button>
            <span className="flex shrink-0 items-center gap-4">
              <b className="font-aeonik text-[26px] font-normal leading-none tabular-nums max-sm:hidden">{money(withCode)}</b>
              <button type="button" onClick={checkout} className="btn bfd-cta h-12 px-6 font-semibold max-sm:px-4">{VIP2.checkout}</button>
            </span>
          </>
        ) : (
          <>
            <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap font-inter leading-[1.3]"><b className="block text-[14.5px] font-semibold">{VIP2.page.name}</b><span className="block text-[13.5px] text-[color:var(--v-F0D79B)]">{left ? `${left} left` : "Sale prices shown"}</span></span>
            <a href="#vip-list" onClick={go("vip-list")} className="btn bfd-cta h-12 shrink-0 px-6 font-semibold max-sm:px-5 max-[359px]:px-3.5 max-[359px]:text-[14px]">{VIP2.page.barButton}</a>
          </>
        )}
      </div>
    </div>
  );
}

function ListSheet({ list, remove, close, checkout }: { list: PlanLine[]; remove: (key: string) => void; close: () => void; checkout: () => void }) {
  const VIP2 = useWords();
  const { withCode, saved } = planTotals(list);
  const regular = withCode + saved;
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [close]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[color:var(--v-08131D)]/60 backdrop-blur-[3px] sm:items-center sm:p-6" onClick={close}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="v2-sheet-title" tabIndex={-1} data-lenis-prevent onClick={(e) => e.stopPropagation()} className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] bg-white text-ndm-ink outline-hidden sm:max-w-[520px] sm:rounded-[26px]">
        <div className="flex items-center justify-between gap-4 border-b border-black/[.08] px-5 py-4">
          <h2 id="v2-sheet-title" className="font-aeonik text-[24px] font-normal leading-none">{VIP2.name}</h2>
          <button type="button" onClick={close} aria-label="Close my list" className="grid size-10 place-items-center rounded-full bg-black/[.05]"><IconClose size={14} /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5">
          {list.length ? (
            <ul role="list" className="divide-y divide-black/[.08]">
              {list.map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-3 py-3.5">
                  <span className="min-w-0">
                    <span className="block font-inter text-[11.5px] font-semibold uppercase tracking-[.13em] text-ndm-muted">{p.cat}</span>
                    <span className="mt-0.5 block font-inter text-[15px] leading-[1.35]">{cap(p.item)}{p.item !== p.opt && <span className="text-ndm-muted"> · {p.opt}</span>}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    <span className="text-right font-inter text-[15.5px] font-semibold tabular-nums">{money(planPrice(p))}{p.reg > planPrice(p) && <s className="block text-[12.5px] font-normal text-ndm-muted">{money(p.reg)}</s>}</span>
                    <button type="button" onClick={() => remove(p.key)} aria-label={`Remove ${p.cat}, ${p.item} from my list`} className="grid size-9 place-items-center rounded-full border border-black/10 text-ndm-muted"><IconClose size={12} /></button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="py-8 font-inter text-[15.5px] leading-[1.6] text-ndm-muted">{VIP2.page.empty}</p>}
        </div>
        <div className="border-t border-black/[.08] bg-[color:var(--v-FAFAF8)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
          {list.length > 0 && (
            <dl className="mb-3.5 grid grid-cols-[1fr_auto] gap-y-1 font-inter text-[14.5px]">
              {saved > 0 && <><dt className="text-ndm-muted">Regular price</dt><dd className="text-right tabular-nums text-ndm-muted"><s>{money(regular)}</s></dd></>}
              {saved > 0 && <><dt className="font-semibold text-[color:var(--v-0C72AE)]">You save</dt><dd className="text-right font-semibold tabular-nums text-[color:var(--v-0C72AE)]">{money(saved)}</dd></>}
              <dt className="self-end font-semibold">{VIP2.page.total}</dt><dd className="text-right font-aeonik text-[30px] leading-none tabular-nums">{money(withCode)}</dd>
            </dl>
          )}
          {list.length > 0
            ? <button type="button" onClick={checkout} className="btn bfd-cta h-[52px] w-full text-[16.5px] font-semibold">{VIP2.checkout}</button>
            : <button type="button" onClick={() => { close(); go("vip-list")(); }} className="btn bfd-cta h-[52px] w-full text-[16.5px] font-semibold">{VIP2.hero.button}</button>}
          <p className="mt-3 text-center font-inter text-[12.5px] leading-[1.5] text-ndm-muted">Prices in CAD, before tax. Every package includes a free consultation and VISIA® skin analysis.</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ chat */

/** Sale and booking questions only: the same answers as the questions block, and the phone numbers for a person.
 * On phones its panel opens from the left, and once the bottom bar shows, the launcher is the bar's own small icon
 * (user, 2026-11-18), so nothing floats over the price list. */
function Chat({ open, setOpen, day, lifted }: { open: boolean; setOpen: (on: boolean) => void; day: string; lifted: "all" | "small" | "" }) {
  const VIP2 = useWords();
  const c = VIP2.chat;
  const [log, setLog] = useState<{ me: boolean; text: string }[]>([]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [log]);
  const answer = (a: string) => a.replace("{{day}}", day).replace("{{phones}}", `Call ${PHONES_LINE}.`);
  return (
    <div className={`fixed left-3 z-[55] flex flex-col items-start gap-2.5 sm:left-auto sm:right-5 sm:items-end ${lifted === "all" ? "bottom-[calc(80px+env(safe-area-inset-bottom))]" : lifted === "small" ? "bottom-[calc(16px+env(safe-area-inset-bottom))] max-lg:bottom-[calc(80px+env(safe-area-inset-bottom))]" : "bottom-[calc(16px+env(safe-area-inset-bottom))]"}`}>
      {open && (
        <div role="dialog" aria-label={c.title} data-lenis-prevent className="w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-[18px] bg-white text-ndm-ink shadow-[0_22px_60px_rgba(8,19,29,.4)] ring-1 ring-black/10">
          <div className="flex items-center justify-between gap-2.5 bg-[color:var(--v-0B1B29)] py-3 pl-4 pr-3 text-white"><b className="font-aeonik text-[18px] font-normal">{c.title}</b><button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-8 place-items-center rounded-full bg-white/[.14]"><IconClose size={12} /></button></div>
          <div aria-live="polite" className="flex max-h-[230px] flex-col gap-2 overflow-y-auto overscroll-contain px-3.5 pb-1 pt-3.5 font-inter text-[14.5px] leading-[1.45]">
            <p className="max-w-[88%] self-start rounded-[14px] rounded-bl-[4px] bg-[color:var(--v-EEF2F6)] px-3 py-2">{c.hello}</p>
            {log.map((m, i) => <p key={i} className={`max-w-[88%] rounded-[14px] px-3 py-2 ${m.me ? "self-end rounded-br-[4px] bg-[color:var(--v-0B1B29)] text-white" : "self-start rounded-bl-[4px] bg-[color:var(--v-EEF2F6)]"}`}>{m.text}</p>)}
            <div ref={end} />
          </div>
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-3 pt-2.5">
            {c.replies.map(([q, a]) => <button key={q} type="button" onClick={() => { setLog((l) => [...l, { me: true, text: q }, { me: false, text: answer(a) }]); if (a.includes("{{phones}}")) track("Contact", { method: "chat-to-phone", from: "chat" }); }} className="rounded-full border border-[color:var(--v-CBD3DD)] bg-white px-3 py-2 font-inter text-[13px] font-semibold">{q}</button>)}
          </div>
          <p className="border-t border-black/[.08] px-3.5 py-2.5 font-inter text-[12px] leading-[1.4] text-ndm-muted">{c.foot}<span className="mt-1 block"><Calls dark={false} from="chat" /></span></p>
        </div>
      )}
      <button type="button" aria-expanded={open} onClick={() => { setOpen(!open); if (!open) track("Contact", { method: "chat", from: "launcher" }); }} className={`${lifted ? "max-sm:hidden" : ""} inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-[color:var(--v-0B1B29)] pl-3.5 pr-[18px] font-inter text-[14.5px] font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,.4)]`}>
        <IconChat />{c.button}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ the page */

/** The page; `words` are the VIP Sale's unless given (Black Friday passes its own, with the class "vbf" on <html> for its colours). */
export function VipSaleV2({ view, words = VIP_WORDS }: { view: SaleView; words?: SaleWords }) {
  const { deals, planKey, code } = view;
  const router = useRouter();
  useEffect(() => {
    eventPrefix = words.page.event;
  }, [words]);
  const packs = useMemo(() => allPacks(deals), [deals]);
  /* the headline: the best saving a package on this page really reaches */
  const best = useMemo(() => Math.max(0, ...packs.map((p) => p.pct)), [packs]);
  /* the treatment that carries it leads the list; the rest keep the page's order */
  const rows = useMemo(() => {
    const top = (d: Deal) => Math.max(0, ...d.items.flatMap((it) => packsOf(d, it).map((p) => p.pct)));
    /* then the first group of the page's own list (laser hair removal), then the price list's order */
    const first = view.copy.deals.groups[0]?.category;
    const rest = deals.filter((d) => top(d) !== best);
    return [...deals.filter((d) => top(d) === best), ...rest.filter((d) => d.id === first), ...rest.filter((d) => d.id !== first)];
  }, [deals, best, view.copy.deals.groups]);
  const top = useTopPacks(view, packs);
  const t = useClock(view.start, view.end);
  const day = view.phases.at(-1)?.day ?? "";

  const [list, setList] = useState<PlanLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [chat, setChat] = useState(false);
  const [past, setPast] = useState(false);

  /* the saved list is read after the first paint; a line saved before its price changed is dropped */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const saved: PlanLine[] = JSON.parse(localStorage.getItem(planKey) || "[]");
        const current = new Map(packs.map((p): [string, Pack] => [p.key, p]));
        setList(saved.filter((x) => { const p = current.get(x.key); return !!p && p.o[1] === x.price && (p.o[4] || 0) === (x.code || 0); }));
      } catch {
        /* nothing saved, or storage blocked */
      }
      setLoaded(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [planKey, packs]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(planKey, JSON.stringify(list)); } catch { /* private mode: the list lives for this visit */ }
  }, [list, loaded, planKey]);

  /* the bar with the button comes in once the hero's own button has left the screen */
  useOnScroll(() => { const cta = byId("v2-cta"); setPast(!!cta && cta.getBoundingClientRect().bottom < 0); });

  const inList = (key: string) => list.some((x) => x.key === key);
  const toggle = (p: Pack, from: string, el?: HTMLElement, name?: string) => {
    const on = inList(p.key);
    /* the ticket flies into the bottom bar on phones (it appears with the first item), else into the header's count */
    if (!on && el) flyTo(el, { name: name || p.it[0], price: money(p.pay), look: words.page.fly, target: () => (window.matchMedia("(max-width: 639px)").matches ? firstShown(byId("v2-bar-count"), byId("v2-list-count")) : firstShown(byId("v2-list-count"))) });
    if (!on) track("AddToCart", { content_name: `${p.it[0]}, ${p.o[0]}`, content_ids: [String(p.o[6] ?? "")], content_type: "product", value: p.pay, currency: "CAD", from });
    setList((l) => (on ? l.filter((x) => x.key !== p.key) : [...l, line(p)]));
  };
  const checkout = () => {
    const sendable = list.filter((p) => p.pid !== undefined && p.vid !== undefined);
    if (!sendable.length) return;
    track("InitiateCheckout", { value: planTotals(list).withCode, currency: "CAD", num_items: sendable.length, content_ids: sendable.map((p) => String(p.vid)) });
    sendable.forEach((p) => setCartQty({ key: cartKey(p.pid!, p.vid!), cat: p.cat, name: p.name ?? p.item, label: p.opt, price: p.price, was: p.reg || undefined, productId: p.pid, variationId: p.vid }, 1));
    /* the page shows final prices and no code: where the campaign still takes its code for that price, it goes along unseen */
    if (code) setTypedCode(code);
    setList([]);
    setSheet(false);
    void checkCart().finally(() => router.push("/checkout"));
  };

  return (
    <Words.Provider value={words}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:rounded-full focus:bg-ndm-deep focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <Header count={list.length} day={day} openList={() => setSheet(true)} />
      <main id="main" data-page="vip2-sale">
        <Hero view={view} t={t} day={day} best={best} top={top} inList={inList} toggle={toggle} />
        <Strip />
        <Clinic />
        <PriceList view={view} rows={rows} best={best} day={day} inList={inList} toggle={toggle} />
        {/* hidden for now (user, 2026-11-17): the "After you buy" section; change false to true to show it again */}
        {false && <Next day={day} openChat={() => { setChat(true); track("Contact", { method: "chat", from: "keep-price" }); }} />}
        <Questions day={day} />
        <Final t={t} day={day} />
      </main>
      <Footer />
      <Chat open={chat} setOpen={setChat} day={day} lifted={list.length > 0 ? "all" : past ? "small" : ""} />
      <ListBar list={list} t={t} show={past} openList={() => setSheet(true)} checkout={checkout} chatOpen={chat} toggleChat={() => { if (!chat) track("Contact", { method: "chat", from: "bar" }); setChat(!chat); }} />
      {sheet && <ListSheet list={list} remove={(key) => setList((l) => l.filter((x) => x.key !== key))} close={() => setSheet(false)} checkout={checkout} />}
    </Words.Provider>
  );
}
