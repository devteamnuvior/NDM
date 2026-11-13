"use client";

import { useEffect, useState } from "react";
import { IconExternal, IconPhone } from "@/components/ui/icons";
import {
  ANNOUNCEMENT_INTERVAL_MS,
  ANNOUNCEMENTS_DESKTOP,
  ANNOUNCEMENTS_MOBILE,
  type Announcement,
} from "@/config/announcements";
import { ACTIONS } from "@/config/routes";
import { CLINICS } from "@/config/site";
import { tel } from "@/lib/routes";
import { withBase } from "@/lib/base-path";

function PhonesMessage() {
  const [a, b] = CLINICS;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px]">
      <a href={withBase(tel(a.phone))} className="hover:underline">
        {a.name} {a.phone}
      </a>
      <span className="opacity-50">·</span>
      <a href={withBase(tel(b.phone))} className="hover:underline">
        {b.name} {b.phone}
      </a>
    </span>
  );
}

function Message({ m, wide }: { m: Announcement; wide: boolean }) {
  if (m.kind === "phones") return <PhonesMessage />;
  if (wide) {
    return (
      <>
        {m.text}
        <a href={withBase(m.href)} className="font-medium underline-offset-4 hover:underline">
          {m.cta}
        </a>
      </>
    );
  }
  if (m.external) {
    return (
      <a href={withBase(m.href)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:underline">
        {m.text} <IconExternal />
      </a>
    );
  }
  return (
    <a href={withBase(m.href)} className="hover:underline">
      {m.text}
      {m.cta && <span className="font-medium">{m.cta}</span>}
    </a>
  );
}

/** One vertical ticker: the current message sits in place, the next waits below, the rest above. */
function Ticker({ messages, tick, wide, className }: { messages: Announcement[]; tick: number; wide: boolean; className: string }) {
  const n = messages.length;
  const i = tick % n;
  return (
    <div className={`relative h-9 flex-1 overflow-hidden ${className}`} aria-live="off">
      {messages.map((m, k) => {
        const d = (k - i + n) % n;
        const state = d === 0 ? "on" : d === 1 ? "next" : "prev";
        return (
          <div
            key={m.id}
            aria-hidden={state !== "on"}
            inert={state !== "on"}
            className="absolute inset-0 flex items-center justify-center overflow-hidden px-1 text-center text-ellipsis whitespace-nowrap"
            style={{
              transform: state === "on" ? "translateY(0)" : state === "next" ? "translateY(100%)" : "translateY(-100%)",
              opacity: state === "on" ? 1 : 0,
              transition: "transform .7s var(--e-out), opacity .5s ease",
              pointerEvents: state === "on" ? "auto" : "none",
            }}
          >
            <span className="truncate">
              <Message m={m} wide={wide} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The blue announcement bar fixed above the header: clinic phones on the left, rotating messages in the
 * middle, the shop link on the right. Both message sets are in the markup and CSS shows the one for the
 * screen width, so the server HTML and the first client render always match.
 */
export function AnnouncementBar() {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setTick((v) => v + 1), ANNOUNCEMENT_INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      role="region"
      aria-label="Clinic announcements"
      className="promo-attn fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden font-mont text-[12.5px] text-white sm:text-[13px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span aria-hidden="true" className="promo-shine pointer-events-none absolute inset-0" />
      <div className="relative grid h-full grid-cols-[auto_1fr_auto] items-center gap-2 px-2 lg:grid-cols-[1fr_minmax(0,620px)_1fr] lg:px-[var(--hpad)]">
        <div className="hidden items-center gap-4 whitespace-nowrap lg:flex">
          <IconPhone className="opacity-80" />
          {CLINICS.map((c) => (
            <a key={c.id} href={withBase(tel(c.phone))} className="underline-offset-4 hover:underline">
              <span className="opacity-75">{c.name}</span> <span className="font-medium">{c.phone}</span>
            </a>
          ))}
        </div>
        <div className="col-span-3 flex min-w-0 items-center justify-center gap-1 lg:col-span-1">
          <span className="promo-new relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-[3px] font-mont text-[10px] font-semibold tracking-[.12em] text-ndm-deep uppercase sm:inline-flex">
            <i className="promo-ping relative size-1.5 rounded-full bg-ndm-amber" />
            New
          </span>
          <Ticker messages={ANNOUNCEMENTS_MOBILE} tick={tick} wide={false} className="lg:hidden" />
          <Ticker messages={ANNOUNCEMENTS_DESKTOP} tick={tick} wide className="hidden lg:block" />
        </div>
        <div className="hidden items-center justify-end gap-4 lg:flex">
          <a href={withBase(ACTIONS.shop)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
            Shop skincare <IconExternal />
          </a>
        </div>
      </div>
    </div>
  );
}
