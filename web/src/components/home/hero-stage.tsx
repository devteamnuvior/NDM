"use client";

import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { useFilm, type Film } from "@/hooks/use-film";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { withBase } from "@/lib/base-path";
import type { HeroPhoto } from "@/types/home";

/** The film, or with header photos the photo in view (`slide`) and how many there are (`slides`). */
interface HeroPlay extends Film {
  slide: number;
  slides: number;
}

/** How long each header photo stays before the next fades in. */
const PHOTO_MS = 6000;

const HeroFilmContext = createContext<HeroPlay | null>(null);

function useHeroFilm(): HeroPlay {
  const ctx = use(HeroFilmContext);
  if (!ctx) throw new Error("Hero film parts must be rendered inside <HeroStage>");
  return ctx;
}

/**
 * The hero's moving parts. It owns the film's play state and the scroll effect (the film drifts down a
 * little and the words fade as the page scrolls); everything inside it is rendered on the server.
 */
export function HeroStage({ children, slides = 0 }: { children: ReactNode; slides?: number }) {
  const section = useRef<HTMLElement>(null);
  const film = useFilm();
  /* header photos: the next one fades in every few seconds, never with reduced motion; the pause button holds them */
  const [slide, setSlide] = useState(0);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (slides < 2 || held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides), PHOTO_MS);
    return () => clearInterval(t);
  }, [slides, held]);
  const play: HeroPlay = slides ? { video: film.video, paused: held, toggle: () => setHeld((h) => !h), slide, slides } : { ...film, slide: 0, slides: 0 };

  useOnScroll(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const y = window.scrollY;
    const h = window.innerHeight;
    if (y > h * 1.3) return;
    const media = el.querySelector<HTMLElement>("[data-hero-media]");
    const words = el.querySelector<HTMLElement>("[data-hero-words]");
    if (media) media.style.transform = `translate3d(0,${(y * 0.32).toFixed(1)}px,0)`;
    if (words) words.style.opacity = Math.max(0, 1 - y / (h * 0.75)).toFixed(3);
  });

  return (
    <HeroFilmContext value={play}>
      <section ref={section} id="top" data-nav="dark" data-float-hold="" aria-labelledby="hero-title" className="hf">
        {children}
      </section>
    </HeroFilmContext>
  );
}

/** The background film: a smaller file on phones, the poster until it plays. */
export function HeroFilm({ poster, mobile, desktop }: { poster: string; mobile: string; desktop: string }) {
  const { video } = useHeroFilm();
  return (
    <div data-hero-media className="hf-media" aria-hidden="true">
      <video ref={video} muted loop playsInline preload="metadata" poster={withBase(poster)}>
        <source src={withBase(mobile)} type="video/mp4" media="(max-width: 760px)" />
        <source src={withBase(desktop)} type="video/mp4" />
      </video>
    </div>
  );
}

/**
 * The header photos (WordPress "Header photos"), one after another in place of the film: each in two versions,
 * the phone photo on screens up to 760px wide. Only the photo in view is read out.
 */
export function HeroPhotos({ photos }: { photos: HeroPhoto[] }) {
  const { slide } = useHeroFilm();
  return (
    <div data-hero-media className="hf-media">
      {photos.map((p, i) => (
        <picture key={i} className={`hf-photo ${i === slide ? "is-on" : ""}`}>
          <source media="(max-width: 760px)" srcSet={p.mobile} />
          {/* a WordPress photo as it is, like the site's other WordPress photos (no image optimizer); photos out of view have no alt */}
          <img src={p.desktop} alt={i === slide ? p.alt : ""} decoding="async" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
        </picture>
      ))}
    </div>
  );
}

export function HeroFilmToggle() {
  const { paused, toggle, slides } = useHeroFilm();
  /* one photo has nothing to pause */
  if (slides === 1) return null;
  const what = slides ? "header photos" : "background video";
  return (
    <button type="button" onClick={toggle} className="hf-toggle" aria-label={paused ? `Play ${what}` : `Pause ${what}`}>
      {paused ? (
        <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M3 1.5v11l9.5-5.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor" aria-hidden="true">
          <rect x="2" y="1" width="3.5" height="12" rx="1" />
          <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
        </svg>
      )}
    </button>
  );
}
