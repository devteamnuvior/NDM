"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import type { HomeCopy } from "@/types/home";
import { withBase } from "@/lib/base-path";

/** The one clinic film (also used by the Botox and pricing pages). */
export const CLINIC_FILM = { src: "/assets/clinic/ndm-clinic.mp4", poster: "/assets/clinic/ndm-clinic-poster.jpg" };

export function IconSound({ on, size = 18 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <path d="m16 9 5 6" />
          <path d="m21 9-5 6" />
        </>
      )}
    </svg>
  );
}

/**
 * Inside our clinics: the clinic film in a large frame that opens out to both sides as it scrolls into
 * view. The film is fetched only when the section is about two screens away, plays muted while on
 * screen, and the sound button turns the voice on.
 */
export function Space({ copy }: { copy: HomeCopy["space"] }) {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useReveal(section);
  const [seen, setSeen] = useState(false);
  const [near, setNear] = useState(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 });
    const pre = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          pre.disconnect();
        }
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    pre.observe(el);
    return () => {
      io.disconnect();
      pre.disconnect();
    };
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v || !near) return;
    if (seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
    else v.pause();
  }, [seen, near]);

  useEffect(() => {
    if (video.current) video.current.muted = !sound;
  }, [sound]);

  useOnScroll(() => {
    const el = frame.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const h = window.innerHeight;
    el.style.setProperty("--p", clamp01((h - el.getBoundingClientRect().top) / (h * 0.85)).toFixed(3));
  });

  return (
    <section ref={section} aria-labelledby="space" className="relative z-10 bg-ndm-paper py-[clamp(24px,3vw,44px)]">
      <div ref={frame} data-nav="dark" className="cl-frame" role="region" aria-label="Inside our clinics, film">
        <video ref={video} className="cl-vid" muted loop playsInline preload="none" poster={withBase(CLINIC_FILM.poster)} src={withBase(near ? CLINIC_FILM.src : undefined)} aria-label="A walk through the NewDermaMed clinic" />
        <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-wrap items-end justify-between gap-6 px-[var(--gx)] pb-[clamp(28px,4.5vw,60px)]">
          <div>
            <Eyebrow dark className="rv">
              {copy.tag}
            </Eyebrow>
            <TwoTone
              dark
              id="space"
              className="rv mt-4"
              size="text-[clamp(34px,4.2vw,62px)]"
              lead={
                <>
                  {copy.lead}
                  <br />
                </>
              }
              strong={copy.strong}
              style={{ transitionDelay: ".05s" }}
            />
            <p className="rv mt-4 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-inter text-[14px] text-white backdrop-blur-[12px]" style={{ transitionDelay: ".1s" }}>
              <b className="font-semibold">Uptown, Yonge &amp; Sheppard</b>
              <span aria-hidden="true" className="text-white/50">
                ·
              </span>
              <b className="font-semibold">Downtown, Bay &amp; College</b>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSound((x) => !x)}
            aria-pressed={sound}
            aria-label={sound ? "Turn the sound off" : "Turn the sound on"}
            className="cl-sound grid size-12 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-[12px] transition-colors hover:bg-white/20"
          >
            <IconSound on={sound} />
          </button>
        </div>
      </div>
    </section>
  );
}
