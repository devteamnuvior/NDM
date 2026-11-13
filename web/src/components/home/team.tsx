"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { TeamProfile } from "@/components/team/team-profile";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { HOME_COPY } from "@/config/home";
import { ACTIONS } from "@/config/routes";
import { TEAM, TEAM_DRIFT, TEAM_ORDER, type TeamMember } from "@/config/team";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import type { HomeCopy } from "@/types/home";
import { withBase } from "@/lib/base-path";

const PEOPLE = TEAM_ORDER.map((id) => TEAM.find((m) => m.id === id)).filter((m): m is TeamMember => !!m);

function TeamPortrait({ member: m, index, onOpen }: { member: TeamMember; index: number; onOpen: (e: MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <div className={`team-port team-port-${index}`} style={{ "--i": index } as CSSProperties}>
      <button
        type="button"
        onClick={m.sample ? undefined : onOpen}
        disabled={!!m.sample}
        aria-haspopup={m.sample ? undefined : "dialog"}
        aria-label={m.sample ? `${m.name}, ${m.role}, profile coming soon` : `View profile of ${m.name}, ${m.role}`}
        className="group block w-full text-left disabled:cursor-default"
      >
        <span className="team-port-pic relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-ndm-mist shadow-[0_30px_60px_-36px_rgba(27,36,43,.55)]">
          {/* eslint-disable-next-line @next/next/no-img-element -- the prototype's own portrait file and crop */}
          <img src={withBase(m.img)} alt="" width="800" height="1000" decoding="async" className="team-port-img absolute inset-0 h-full w-full object-cover object-[50%_15%]" />
          <span aria-hidden="true" className="team-port-shade absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t/srgb from-ndm-ink/60 to-transparent" />
          {!m.sample && (
            <span aria-hidden="true" className="team-port-more absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[6px]">
              View profile
            </span>
          )}
        </span>
        <span className="team-port-cap mt-3 block font-aeonik text-[15px] leading-[1.2] tracking-[-0.01em] text-ndm-ink sm:text-[18px] lg:text-[19px]">{m.name}</span>
        <span className="team-port-cap mt-1 block font-inter text-[11px] leading-[1.35] tracking-[.12em] text-ndm-muted uppercase sm:text-[12px]">{m.tag}</span>
      </button>
    </div>
  );
}

/**
 * Meet the team: copy on the left, four staggered portraits on the right. The portraits wipe up one after
 * another when the row comes into view, drift at different speeds while scrolling, and each one opens the
 * profile dialog.
 */
interface TeamProps {
  /** Inner pages: the tag reads "Our team" and the section has more room below it. */
  inner?: boolean;
  /** The home page's own words (edited in WordPress); other pages show the built-in ones. */
  copy?: HomeCopy["team"];
}

export function Team({ inner = false, copy = HOME_COPY.team }: TeamProps) {
  const section = useRef<HTMLElement>(null);
  const row = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useReveal(section);
  const [shown, setShown] = useState(false);
  const [selected, setSelected] = useState<TeamMember | null>(null);

  /* the row and the line art behind it play once, when a quarter of the row is on screen */
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const closed = useCallback(() => {
    setSelected(null);
    const b = opener.current;
    requestAnimationFrame(() => {
      if (b && b.isConnected) b.focus({ preventScroll: true });
    });
  }, []);

  useOnScroll(() => {
    const el = row.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp01((vh - r.top) / (vh + r.height)) - 0.5;
    Array.from(el.children).forEach((c, i) => {
      (c as HTMLElement).style.transform = `translate3d(0,${(p * TEAM_DRIFT[i] * 2).toFixed(1)}px,0)`;
    });
  });

  return (
    <section ref={section} aria-labelledby="team" className={`relative z-10 overflow-hidden bg-ndm-paper px-[var(--gx)] pt-[clamp(120px,12vw,188px)] ${inner ? "pb-[clamp(96px,10vw,160px)]" : "pb-[clamp(40px,4.5vw,72px)]"}`}>
      {/* fine line art behind the portraits, drawn in when the row appears */}
      <svg aria-hidden="true" className={`team-lines pointer-events-none absolute top-1/2 right-0 h-[130%] w-[min(70vw,1100px)] -translate-y-1/2 ${shown ? "in" : ""}`} viewBox="0 0 1100 900" fill="none" preserveAspectRatio="xMaxYMid slice">
        <path pathLength="1" d="M40 700C220 520 360 760 560 600S880 260 1100 330" stroke="#1B242B" strokeOpacity=".09" />
        <path pathLength="1" d="M120 880C260 640 420 820 620 640S900 420 1100 470" stroke="#1B242B" strokeOpacity=".07" />
        <path pathLength="1" d="M0 420C200 360 300 160 520 200S820 520 1100 160" stroke="#0F80C3" strokeOpacity=".22" />
        <circle pathLength="1" cx="760" cy="430" r="330" stroke="#1B242B" strokeOpacity=".06" />
        <circle pathLength="1" cx="760" cy="430" r="230" stroke="#0F80C3" strokeOpacity=".12" strokeDasharray=".004 .012" />
      </svg>
      <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-[clamp(40px,5vw,96px)]">
        <div>
          <Eyebrow className="rv">{inner ? "Our team" : copy.tag}</Eyebrow>
          <TwoTone
            id="team"
            lead={
              <>
                {copy.lead}
                <br className="hidden sm:block" />
              </>
            }
            strong={copy.strong}
            className="rv mt-5"
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mt-5 max-w-[46ch] font-inter text-[16px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {copy.text}
          </p>
          <div className="rv mt-8" style={{ transitionDelay: ".14s" }}>
            <Button href={ACTIONS.book} v="book">
              Book Free Consultation
            </Button>
          </div>
        </div>
        <ul ref={row} role="list" className={`team-ports grid grid-cols-2 items-start gap-[clamp(10px,1.6vw,24px)] pb-[clamp(28px,3.4vw,56px)] sm:grid-cols-4 ${shown ? "in" : ""}`}>
          {PEOPLE.map((m, i) => (
            <li key={m.id} className="will-change-transform">
              <TeamPortrait
                member={m}
                index={i}
                onOpen={(e) => {
                  opener.current = e.currentTarget;
                  setSelected(m);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      {selected && createPortal(<TeamProfile member={selected} onClose={closed} />, document.body)}
    </section>
  );
}
