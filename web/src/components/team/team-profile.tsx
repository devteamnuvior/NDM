"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TEAM_ICONS } from "@/components/team/team-icons";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/ui/icons";
import { ACTIONS } from "@/config/routes";
import type { TeamMember } from "@/config/team";
import { lockScroll } from "@/lib/scroll-lock";
import { withBase } from "@/lib/base-path";

const LABEL = "font-inter text-[11.5px] font-[550] uppercase tracking-[.14em] text-ndm-muted";
const CRED = "font-inter text-[11.5px] font-[550] uppercase leading-[1.5] tracking-[.16em] text-ndm-deep";

function TeamFocus({ items, labelledBy, className = "" }: { items: NonNullable<TeamMember["focus"]>; labelledBy: string; className?: string }) {
  return (
    <ul role="list" aria-labelledby={labelledBy} className={`grid gap-2.5 ${className}`}>
      {items.map(({ icon, label }, i) => {
        const Icon = TEAM_ICONS[icon];
        return (
          <li key={label} className="flex items-center gap-3 font-inter text-[14px] leading-[1.35] text-ndm-ink/85">
            <span aria-hidden="true" className="team-chip grid size-8 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep" style={{ transitionDelay: `${i * 60}ms` }}>
              <Icon />
            </span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function TeamFacts({ facts, className = "" }: { facts: NonNullable<TeamMember["facts"]>; className?: string }) {
  return (
    <dl className={`grid gap-3.5 ${className}`}>
      {facts.map(([k, v]) => (
        <div key={k} className="border-t border-ndm-ink/10 pt-3">
          <dt className={LABEL}>{k}</dt>
          <dd className="mt-1 font-aeonik text-[19px] leading-[1.3] tracking-[-0.01em] text-ndm-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A team member's profile dialog. Render it in a portal on <body> so it sits above the fixed header.
 * A bottom sheet under 640px, a centred card above. Focus stays inside; Escape, the close button and the
 * dimmed page close it.
 */
export function TeamProfile({ member: m, onClose }: { member: TeamMember; onClose: () => void }) {
  const [on, setOn] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const leaving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const close = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    setOn(false);
    timer.current = setTimeout(onClose, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420);
  }, [onClose]);

  useEffect(() => {
    lockScroll(true);
    closeBtn.current?.focus({ preventScroll: true });
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(timer.current);
      lockScroll(false);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      const el = box.current;
      if (e.key !== "Tab" || !el) return;
      const f = el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      const cur = document.activeElement;
      if (!el.contains(cur)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && cur === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && cur === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const facts = m.facts ?? [];
  return (
    <div className={`team-pop fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-6 ${on ? "is-on" : ""}`}>
      <div aria-hidden="true" onClick={close} className="team-pop-scrim absolute inset-0" />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-profile-title"
        className="team-pop-card relative w-full max-w-[880px] overflow-hidden rounded-t-[28px] bg-ndm-paper shadow-[0_40px_90px_-30px_rgba(11,15,19,.55)] sm:rounded-[28px]"
      >
        <div data-lenis-prevent="" className="team-pop-scroll max-h-[90vh] overflow-y-auto overscroll-contain sm:max-h-[88vh]">
          {/* the close button lives inside the scroller (sticky, zero-height row) so arrow keys scroll the profile while it has focus */}
          <div className="pointer-events-none sticky top-0 z-10 flex h-0 justify-end">
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              aria-label="Close profile"
              className="pointer-events-auto mt-3 mr-3 grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-ndm-ink shadow-[0_8px_20px_-12px_rgba(11,15,19,.45)] transition-colors hover:bg-ndm-ink hover:text-white sm:mt-4 sm:mr-4"
            >
              <IconClose size={18} />
            </button>
          </div>
          <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-10 rounded-full bg-ndm-ink/15 sm:hidden" />
          <div className="grid gap-8 p-6 pt-5 pb-[max(28px,env(safe-area-inset-bottom))] sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-9 sm:p-9 md:grid-cols-[248px_minmax(0,1fr)] md:gap-10 md:p-10">
            <aside className="hidden sm:block">
              <div className="team-pop-aside">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-ndm-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element -- already loaded by the portrait card */}
                  <img src={withBase(m.img)} alt={`Portrait of ${m.name}`} width="800" height="1000" className="absolute inset-0 h-full w-full object-cover object-[50%_15%]" />
                </div>
                <TeamFacts facts={facts} className="mt-6" />
              </div>
            </aside>
            <div className="min-w-0">
              <p className={`pr-12 ${CRED}`}>{m.cred}</p>
              <div className="mt-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- already loaded by the portrait card */}
                <img src={withBase(m.img)} alt="" width="800" height="1000" className="aspect-[4/5] w-[72px] shrink-0 rounded-[14px] bg-ndm-mist object-cover object-[50%_15%] sm:hidden" />
                <div className="min-w-0">
                  <h2 id="team-profile-title" className="font-aeonik text-[clamp(28px,3.4vw,36px)] leading-[1.05] font-normal tracking-[-0.03em] text-ndm-ink">
                    {m.name}
                  </h2>
                  <p className="mt-2 font-inter text-[12px] leading-[1.45] font-[550] tracking-[.14em] text-ndm-deep uppercase">{m.role}</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 font-inter text-[15px] leading-[1.65] text-ndm-muted">
                {(m.bio ?? []).map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
              <p className="mt-7 border-l-2 border-ndm-blue pl-4 font-aeonik text-[19px] leading-[1.4] tracking-[-0.01em] text-ndm-ink sm:text-[20px]">{m.highlight}</p>
              <TeamFacts facts={facts} className="mt-8 sm:hidden" />
              <p id="team-profile-focus" className={`mt-8 ${LABEL}`}>
                {m.focusLabel}
              </p>
              <TeamFocus items={m.focus ?? []} labelledBy="team-profile-focus" className="mt-4 md:grid-cols-2" />
              <div className="mt-9">
                <Button href={ACTIONS.book} v="book" onClick={close}>
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
