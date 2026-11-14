"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { BeforeAfterCase } from "@/config/before-after";
import { clamp01, easeInOut } from "@/lib/math";
import { withBase } from "@/lib/base-path";

/* one-time "you can drag this" hint: 50 -> 34 -> 66 -> 50 over 1.6s, each leg eased */
const HINT_MS = 1600;
const HINT: [at: number, value: number][] = [
  [0, 50],
  [0.3, 34],
  [0.72, 66],
  [1, 50],
];
function hintAt(p: number): number {
  for (let k = 1; k < HINT.length; k++) {
    const [p0, v0] = HINT[k - 1];
    const [p1, v1] = HINT[k];
    if (p <= p1) return v0 + (v1 - v0) * easeInOut((p - p0) / (p1 - p0));
  }
  return 50;
}

const IconDrag = () => (
  <svg width={18} height={18} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M7.5 6 3.5 10l4 4M12.5 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Drag {
  id: number;
  x: number;
  y: number;
  /** The pointer is sliding the divider (touch waits for a sideways move first). */
  on: boolean;
}

interface BaCompareProps {
  c: BeforeAfterCase;
  /** Position in its row: staggers the drag hint. */
  i: number;
  /** Play the one-time drag hint when the card scrolls into view. */
  nudge?: boolean;
}

/**
 * Compare slider: the AFTER photo underneath, the BEFORE photo on top, clipped to the left of the divider.
 * Mouse and pen grab at once (click to jump, drag to slide). Touch waits for a sideways move or a tap, so
 * a vertical swipe over a photo still scrolls the page. Keyboard and screen readers use the native range
 * input laid over the card.
 */
export function BaCompare({ c, i, nudge = true }: BaCompareProps) {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const touched = useRef(false);
  const hint = useRef(0);
  const [pos, setPos] = useState(50);
  const [active, setActive] = useState(false); /* a pointer is sliding: the handle grows */
  const [tween, setTween] = useState(false); /* a discrete jump (click, tap, keys): ease into place */
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stopHint = () => {
    touched.current = true;
    cancelAnimationFrame(hint.current);
  };
  const fromX = (x: number) => {
    const r = box.current?.getBoundingClientRect();
    return r && r.width ? 100 * clamp01((x - r.left) / r.width) : 50;
  };
  const jump = (v: number) => {
    stopHint();
    setTween(true);
    setPos(v);
  };
  const slide = (v: number) => {
    setTween(false);
    setPos(v);
  };

  useEffect(() => {
    if (!seen || !nudge || touched.current) return;
    let t0 = 0;
    const tick = (t: number) => {
      if (touched.current) return;
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / HINT_MS);
      setTween(false);
      setPos(hintAt(p));
      if (p < 1) hint.current = requestAnimationFrame(tick);
    };
    const wait = setTimeout(() => {
      hint.current = requestAnimationFrame(tick);
    }, 350 + 150 * i);
    return () => {
      clearTimeout(wait);
      cancelAnimationFrame(hint.current);
    };
  }, [seen, nudge, i]);

  const grab = (e: PointerEvent<HTMLDivElement>) => {
    try {
      box.current?.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    setActive(true);
    jump(fromX(e.clientX));
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "touch" && drag.current?.on) return; /* a second finger while sliding */
    const now = e.pointerType !== "touch";
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, on: now };
    if (now) {
      e.preventDefault();
      grab(e);
    }
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.on) {
      const dx = Math.abs(e.clientX - d.x);
      const dy = Math.abs(e.clientY - d.y);
      if (dx < 6 || dx <= dy) return;
      d.on = true;
      grab(e);
      return;
    }
    slide(fromX(e.clientX));
  };
  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.on) {
      setActive(false);
      return;
    }
    if (e.type === "pointerup" && Math.abs(e.clientX - d.x) < 10 && Math.abs(e.clientY - d.y) < 10) jump(fromX(e.clientX)); /* a tap */
  };
  const lost = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d && d.on && d.id === e.pointerId) {
      drag.current = null;
      setActive(false);
    }
  };
  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    const k = e.key;
    const dir = k === "ArrowLeft" || k === "ArrowDown" ? -1 : k === "ArrowRight" || k === "ArrowUp" ? 1 : 0;
    if (!dir) return; /* Home, End, PageUp and PageDown stay native and arrive through onChange */
    e.preventDefault();
    jump(Math.min(100, Math.max(0, Math.round(pos) + dir * (e.shiftKey ? 10 : 2))));
  };
  const change = (e: ChangeEvent<HTMLInputElement>) => jump(Number(e.target.value));

  const clip = `inset(0 ${(100 - pos).toFixed(3)}% 0 0)`;
  const at = `${pos.toFixed(3)}%`;
  const shown = Math.round(pos);
  const img = "absolute inset-0 h-full w-full object-cover";
  /* the source photos carry their own Before/After tags in the top corners (about 157x80 of 750x690):
     zooming 1.16x from the bottom edge crops the top 14% so the tags never show; fx keeps each face in frame */
  const crop: CSSProperties = { objectPosition: `${c.fx}% 50%`, transformOrigin: `${c.fx}% 100%`, transform: "scale(1.16)" };
  const pill = "ba-pill absolute top-3 rounded-full pl-2.5 pr-2 py-[6px] font-inter text-[11.5px] font-medium uppercase leading-none tracking-[.14em] backdrop-blur-[8px]";
  const alt = (w: string) => `${w} ${(c.treat || "Aptos thread lift").toLowerCase()}, model ${c.n}`;

  return (
    <div
      ref={box}
      className={`ba-box relative isolate aspect-[4/5] w-full cursor-ew-resize overflow-hidden rounded-[22px] bg-white/5 ring-1 ring-white/10 select-none focus-within:ring-2 focus-within:ring-ndm-sky focus-within:ring-offset-2 focus-within:ring-offset-[#18222A] ${active ? "is-drag" : ""} ${tween ? "is-tween" : ""}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={lost}
    >
      {/* eslint-disable @next/next/no-img-element -- clinical photos served by the clinic's own site, cropped with a transform */}
      <div className="ba-before absolute inset-0 z-[2]" style={{ clipPath: clip, WebkitClipPath: clip }}>
        <img src={withBase(c.before)} alt={alt("Before")} width={750} height={690} loading="lazy" decoding="async" draggable={false} className={img} style={crop} />
        <span aria-hidden="true" className={`${pill} left-3 bg-ndm-ink/55 text-white`} style={{ opacity: pos < 12 ? 0 : 1 }}>
          Before
        </span>
      </div>
      <div className="absolute inset-0 z-[1]">
        <img src={withBase(c.after)} alt={alt("After")} width={750} height={690} loading="lazy" decoding="async" draggable={false} className={img} style={crop} />
        <span aria-hidden="true" className={`${pill} right-3 bg-white/85 text-ndm-ink`} style={{ opacity: pos > 88 ? 0 : 1 }}>
          After
        </span>
      </div>
      {/* eslint-enable @next/next/no-img-element */}
      <span aria-hidden="true" className="ba-line absolute inset-y-0 z-[3] w-px -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(11,15,19,.35)]" style={{ left: at }} />
      <span aria-hidden="true" className="ba-handle absolute top-1/2 z-[4] grid size-10 place-items-center rounded-full bg-white text-ndm-ink shadow-[0_10px_24px_-10px_rgba(11,15,19,.55)] ring-1 ring-ndm-ink/10" style={{ left: at }}>
        <IconDrag />
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={Math.round(pos * 2) / 2}
        onChange={change}
        onKeyDown={key}
        onFocus={stopHint}
        aria-label={`Compare before and after, model ${c.n}, ${c.treat || c.view}`}
        aria-valuetext={`${shown}% before, ${100 - shown}% after`}
        className="absolute inset-0 z-20 m-0 h-full w-full appearance-none opacity-0"
      />
    </div>
  );
}
