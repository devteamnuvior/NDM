"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow } from "@/components/ui/icons";
import { FINANCING_URL } from "@/config/specials";
import { useReveal } from "@/hooks/use-reveal";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";

export interface WheelOffer {
  name: string;
  photo: StaticImageData;
  position: string;
  tag: string;
  /** Lowest price, without the dollar sign. */
  price: string;
  unit: string;
  deal: string;
  href: string;
}

/* arc positions (card 312 x 430): x, y drop and rotation per step away from the centre card */
const ARC: [x: number, y: number, rotate: number][] = [
  [0, 0, 0],
  [359, 26, 8.77],
  [711, 113, 18.83],
  [1033, 243, 25.05],
  [1320, 400, 31],
];
function arcAt(d: number): [number, number, number] {
  const a = Math.min(Math.abs(d), ARC.length - 1);
  const i = Math.floor(a);
  const f = a - i;
  const p = ARC[i];
  const q = ARC[Math.min(i + 1, ARC.length - 1)];
  const s = Math.sign(d) || 1;
  return [s * (p[0] + (q[0] - p[0]) * f), p[1] + (q[1] - p[1]) * f, s * (p[2] + (q[2] - p[2]) * f)];
}

interface SpecialsWheelProps {
  offers: WheelOffer[];
  level: "h1" | "h2";
  /** Where "View all offers" goes: "#offers" when that list is on this page. */
  offersHref: string;
  /** Rendered under the controls (the payment plans card). */
  children?: ReactNode;
}

/**
 * The offers wheel: cards sit on an arc, the centre one is the current offer. Arrows, a swipe, the arrow
 * keys or a click on a side card turn it. The cards wait off screen and sweep onto the arc the first
 * time the wheel scrolls into view.
 */
export function SpecialsWheel({ offers, level: Heading, offersHref, children }: SpecialsWheelProps) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  useReveal(section);
  const n = offers.length;
  /* the current card, and the one before the last turn (to spot a card that jumps across the wheel) */
  const [turn, setTurn] = useState({ act: 0, prev: 0 });
  const [k, setK] = useState(1); /* scale of the whole wheel */
  const [vw, setVw] = useState(1440);
  const [entered, setEntered] = useState(false);
  const [settled, setSettled] = useState(false);
  const act = turn.act;

  const show = (i: number) => setTurn((t) => ({ act: i, prev: t.act }));
  const go = (d: number) => setTurn((t) => ({ act: (t.act + d + n) % n, prev: t.act }));

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => {
        setEntered(true);
        setSettled(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* once the entrance has played, turns use the cards' own quick transition */
  useEffect(() => {
    if (!entered || settled) return;
    const t = setTimeout(() => setSettled(true), 2300);
    return () => clearTimeout(t);
  }, [entered, settled]);

  /* full-screen stage: size the wheel to both the width and the window height */
  useEffect(() => {
    const fit = () => {
      const w = stage.current ? stage.current.clientWidth : window.innerWidth;
      setK(Math.max(0.72, Math.min(1.12, w / 1240, (window.innerHeight - 340) / 520)));
      setVw(window.innerWidth);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    swipe.current = { x: e.clientX, moved: false };
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 50) {
      go(dx < 0 ? 1 : -1);
      /* keep the record until the next press: the click that ends a mouse drag must not turn the wheel
         again (the prototype dropped it too early, so a mouse drag bounced back) */
      swipe.current = { x: s.x, moved: true };
    }
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };
  const stepFrom = (i: number, centre: number) => {
    let d = i - centre;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };
  const viewAll = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = byId("offers");
    if (!el) return;
    e.preventDefault();
    scrollToY(el.getBoundingClientRect().top + window.scrollY - 150);
  };

  return (
    <section ref={section} aria-labelledby="specials" className="specials-wheel relative z-10">
      <div className="sw-panel relative overflow-clip pb-[clamp(56px,6vw,104px)]">
        <div className="flex min-h-[100svh] flex-col justify-center pt-[clamp(140px,17vh,176px)] pb-[clamp(20px,4vh,44px)]">
          {Heading !== "h1" && (
            <div className="rv mb-4 text-center">
              <Eyebrow>Monthly specials</Eyebrow>
            </div>
          )}
          <Heading id="specials" className="rv sw-title mx-auto px-4 text-center font-aeonik text-[clamp(23px,4.2vw,60px)] leading-[1.06] font-normal tracking-[-0.035em] whitespace-nowrap">
            <span className="text-ndm-ink">Exclusive monthly</span> <span className="tt-strong text-ndm-deep">specials</span>
          </Heading>

          <div
            ref={stage}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={`Monthly specials, offer ${act + 1} of ${n}`}
            onKeyDown={key}
            onPointerDown={down}
            onPointerUp={up}
            onPointerCancel={() => {
              swipe.current = null;
            }}
            className="sw-stage relative mt-4 outline-hidden select-none md:mt-6"
            style={{ height: 500 * k + 28, touchAction: "pan-y" }}
          >
            {offers.map((s, i) => {
              const d = stepFrom(i, act);
              const [x, y, r] = arcAt(d);
              const on = d === 0;
              const far = Math.abs(d) > 3;
              /* a card that crosses from one end of the wheel to the other jumps there, it does not fly across */
              const wrap = turn.prev !== act && Math.abs(d - stepFrom(i, turn.prev)) > 2;
              /* before the stage is in view, cards wait outside the screen on their own side, then sweep onto the arc, centre card last */
              const side = d < 0 ? -1 : 1;
              const ox = entered ? 0 : side * (vw * 0.75 + 200);
              const oy = entered ? 0 : 260;
              const or = entered ? 0 : side * 32;
              return (
                <article
                  key={s.name}
                  aria-hidden={!on}
                  onClick={() => {
                    if (!on && !swipe.current?.moved) show(i);
                  }}
                  className={`sw-card absolute top-7 left-1/2 rounded-[22px] ${on ? "is-on" : "cursor-pointer"}`}
                  style={{
                    width: 300 * k,
                    height: 392 * k,
                    transform: `translateX(-50%) translate(${(x * k + ox).toFixed(1)}px, ${(y * k + oy).toFixed(1)}px) rotate(${(r + or).toFixed(2)}deg) scale(${on ? 1.03 : 1})`,
                    opacity: far ? 0 : 1,
                    zIndex: 10 - Math.abs(d),
                    pointerEvents: far ? "none" : "auto",
                    ...(!settled ? { transition: `transform 1.5s var(--e-out) ${(0.1 + (3 - Math.min(3, Math.abs(d))) * 0.14).toFixed(2)}s` } : {}),
                    ...(wrap ? { transition: "none" } : {}),
                  }}
                >
                  <span aria-hidden="true" className="sw-ring pointer-events-none absolute -right-20 -bottom-20 size-48 rounded-full" />
                  <span aria-hidden="true" className="sw-ring pointer-events-none absolute -right-9 -bottom-9 size-28 rounded-full" />
                  <span className="relative flex h-full flex-col p-[clamp(14px,1.6vw,22px)]">
                    <span className="flex items-center justify-between gap-2">
                      <span className="sw-photo block shrink-0 overflow-hidden rounded-full" style={{ width: 52 * k, height: 52 * k }}>
                        <Image src={s.photo} alt="" sizes="64px" draggable={false} className="h-full w-full object-cover" style={{ objectPosition: s.position }} />
                      </span>
                      <span className={`sw-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] tracking-[.12em] uppercase ${i === 0 ? "is-feature" : ""}`}>{i === 0 ? "Featured" : s.tag}</span>
                    </span>
                    <h3 className="sw-title mt-[clamp(12px,1.5vw,20px)] flex items-center justify-center text-center font-aeonik leading-[1.04] font-normal tracking-[-0.03em]" style={{ fontSize: 34 * k, minHeight: 34 * k * 2.15 }}>
                      {s.name}
                    </h3>
                    <span className="flex flex-1 flex-col items-center justify-center text-center">
                      {s.deal && (
                        <span className="deal-badge mb-3">
                          <i aria-hidden="true">%</i>
                          {s.deal}
                        </span>
                      )}
                      <span className="sw-muted font-inter text-[11px] tracking-[.18em] uppercase">From</span>
                      <span className="sw-price mt-1 font-aeonik leading-none tracking-[-0.035em] whitespace-nowrap" style={{ fontSize: 40 * k }}>
                        <span className="sw-cur">$</span>
                        {s.price}
                      </span>
                      <span className="sw-muted mt-2 font-inter text-[12.5px]">{s.unit || "for selected packages"}</span>
                    </span>
                    <Button
                      href={s.href}
                      tabIndex={on ? 0 : -1}
                      draggable={false}
                      onClick={(e) => {
                        if (!on) e.preventDefault();
                      }}
                      v={on ? "ink" : "line"}
                      sm
                      block
                      className={on ? "btn-buy" : ""}
                    >
                      Buy now
                    </Button>
                  </span>
                </article>
              );
            })}
          </div>

          <div className="relative flex flex-col items-center gap-5 px-5">
            <p className="sw-title flex flex-col items-center justify-center gap-3 text-center font-mont text-[12px] tracking-[.16em] uppercase md:text-[13px]">
              <span>Save on cosmetic treatment</span>
              <span className="tracking-normal normal-case">
                <Button href={FINANCING_URL} v="line" sm>
                  Apply for financing now
                </Button>
              </span>
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => go(-1)} aria-label="Previous offer" className="sw-ctrl grid size-12 place-items-center rounded-full border transition">
                <IconArrow className="rotate-180" />
              </button>
              <Button href={offersHref} v="ink" onClick={viewAll}>
                View all offers
              </Button>
              <button type="button" onClick={() => go(1)} aria-label="Next offer" className="sw-ctrl grid size-12 place-items-center rounded-full border transition">
                <IconArrow />
              </button>
            </div>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {offers.map((o, i) => (
                <i key={o.name} className={`sw-dot h-1.5 rounded-full transition-all duration-500 ${i === act ? "is-on w-6" : "w-1.5"}`} />
              ))}
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
