"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cad, percentOff } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { productPath } from "@/config/shop";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import type { ShopCard, ShopSale } from "@/types/shop";

const HERO_PHOTO = "/assets/treatments/journey-skin.webp";
const CARD_MS = 6500;

/** Days, hours and minutes until a moment, read in the browser only (empty on the server, so nothing jumps). */
function useLeft(to: number | null): [number, number, number] | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (to === null) return;
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [to]);
  if (to === null || now === null) return null;
  const ms = Math.max(0, to - now);
  return [Math.floor(ms / 864e5), Math.floor((ms % 864e5) / 36e5), Math.floor((ms % 36e5) / 6e4)];
}

/** The Black Friday card: the phase running now, Black Friday's days, the sale's headline and the time left. */
function SaleCard({ sale, maxOff }: { sale: ShopSale; maxOff: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []); // eslint-disable-line react-hooks/set-state-in-effect -- the clock is only read in the browser
  const bf = sale.blackFriday;
  const before = now !== null && now < bf.from;
  const left = useLeft(now === null ? null : before ? bf.from : bf.to);
  return (
    <div className="sp-fc-sale">
      <p className="sp-fc-k">{sale.now && sale.now.label !== bf.label ? `${sale.now.label} on now` : `${bf.label} at NewDermaMed`}</p>
      <p className="sp-fc-name">
        {bf.label}, <em>{bf.days}</em>
      </p>
      <p className="sp-fc-text">
        {sale.headline} at both Toronto clinics.{maxOff ? ` Up to ${maxOff}% off selected skincare here.` : ""}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        <p className="sp-fc-clock" role="timer" aria-label={left ? `${before ? "Starts in" : "Ends in"} ${left[0]} days and ${left[1]} hours` : undefined}>
          <span>{before ? "Starts in" : "Ends in"}</span>
          {left ? `${left[0]}d ${String(left[1]).padStart(2, "0")}h ${String(left[2]).padStart(2, "0")}m` : "--"}
        </p>
        <Button href={sale.link} v="light" sm>
          {sale.cta}
        </Button>
      </div>
    </div>
  );
}

/** A featured product on the floating card: photo on white, saving and brand, name, line, price and size. */
function ProductSlide({ p }: { p: ShopCard }) {
  return (
    <div className="flex h-full gap-4">
      <span className="sp-fc-img">
        {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store */}
        {p.image && <img src={p.image.src} alt="" className="h-full w-full object-contain" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="sp-fc-k">{[p.onSale ? `Save ${percentOff(p)}%` : "", p.brand].filter(Boolean).join(" · ")}</span>
        <span className="sp-fc-name sp-name">{p.name}</span>
        <span className="sp-fc-text line-clamp-2">{p.text}</span>
        <span className="mt-auto flex items-end justify-between gap-3 pt-3">
          <span className="font-inter text-white">
            <b className="text-[19px] font-semibold tabular-nums">{cad(p.price)}</b>
            {p.size && <span className="ml-2 text-[12.5px] text-white/60">{p.size.replace(/\s*\(.*\)$/, "")}</span>}
          </span>
          <Link href={productPath(p.slug)} className="btn btn-light btn-sm">
            <span>Shop</span>
            <span className="sr-only">{` ${p.name}`}</span>
          </Link>
        </span>
      </span>
    </div>
  );
}

/**
 * The shop's header, after auna.framer.media: the words on the warm cream of the photo, the portrait to the right,
 * the giant "skincare." word along the bottom, and a floating card that turns through Black Friday (while the holiday
 * sale runs) and three products on sale. The card moves on every 6.5 seconds, stops while hovered or focused, and
 * never moves with reduced motion.
 */
export function ShopHero({ count, brands, featured, sale, maxOff }: { count: number; brands: string; featured: ShopCard[]; sale: ShopSale | null; maxOff: number }) {
  const items = [...(sale ? [{ id: "sale" as const }] : []), ...featured.map((p) => ({ id: p.id, p }))];
  const [on, setOn] = useState(0);
  const [held, setHeld] = useState(false);
  const still = useRef(false);
  const n = items.length;
  useEffect(() => {
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useEffect(() => {
    if (held || n < 2 || still.current) return;
    const t = setTimeout(() => setOn((i) => (i + 1) % n), CARD_MS);
    return () => clearTimeout(t);
  }, [on, held, n]);
  const go = (d: number) => setOn((i) => (i + d + n) % n);

  return (
    <section aria-labelledby="sp-title" className="sp-hero px-[var(--gx)] pt-[clamp(16px,2vw,28px)]">
      <div className="sp-hero-card relative overflow-hidden rounded-[clamp(24px,2.6vw,36px)]">
        <div className="sp-hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer, painted first */}
          <img src={optimized(HERO_PHOTO, 1920)} srcSet={optimizedSrcSet(HERO_PHOTO, [828, 1200, 1920]) || undefined} sizes="(min-width: 1024px) 70vw, 100vw" alt="" fetchPriority="high" className="h-full w-full object-cover" />
        </div>

        <div className="sp-hero-words relative z-[2] px-[clamp(22px,4vw,64px)] pt-[clamp(28px,4.4vw,72px)]">
          <Eyebrow>Medical-grade skincare</Eyebrow>
          <TwoTone
            as="h1"
            id="sp-title"
            className="mt-5 max-w-[11ch]"
            size="text-[clamp(44px,6vw,92px)]"
            lead={
              <>
                Clinic skincare,
                <br />
              </>
            }
            strong="now online"
          />
          <p className="mt-5 max-w-[40ch] font-inter text-[clamp(15.5px,1.15vw,17.5px)] leading-[1.6] text-ndm-ink/75">{`The medical-grade skincare we carry at our Toronto clinics, ready to order online. ${brands}.`}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#products" className="sp-split">
              <span>Shop all products</span>
              <em>{`${count} products`}</em>
            </a>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
          </div>
        </div>

        <div aria-hidden="true" className="sp-hero-meta relative z-[2] hidden px-[clamp(22px,4vw,64px)] lg:flex">
          <span>Medical-grade skincare</span>
          <span>Uptown and Downtown Toronto</span>
        </div>
        <p aria-hidden="true" className="sp-hero-word relative z-[1]">
          skincare.
        </p>

        {n > 0 && (
          <div
            className={`sp-float z-[3] ${items[on]?.id === "sale" ? "is-sale" : ""}`}
            role="group"
            aria-roledescription="carousel"
            aria-label="Featured"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
          >
            <div className="sp-fc-bar">
              <span aria-live="polite">{`${on + 1} / ${n}`}</span>
              {n > 1 && (
                <span className="flex gap-1.5">
                  <button type="button" onClick={() => go(-1)} aria-label="Previous" className="sp-fc-arrow">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M7.5 2.5 4 6l3.5 3.5" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next" className="sp-fc-arrow">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="m4.5 2.5 3.5 3.5-3.5 3.5" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
            {/* a card out of view cannot be reached with Tab (`inert` set on the element: React 18 and 19 read the prop differently) */}
            <div className="grid">
              {items.map((it, i) => (
                <div
                  key={it.id}
                  ref={(el) => {
                    if (el) el.inert = i !== on;
                  }}
                  className={`sp-fc-item col-start-1 row-start-1 ${i === on ? "is-on" : ""}`}
                  aria-hidden={i !== on}
                >
                  {"p" in it && it.p ? <ProductSlide p={it.p} /> : sale ? <SaleCard sale={sale} maxOff={maxOff} /> : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
