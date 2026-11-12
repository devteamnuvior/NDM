"use client";

import { createContext, use, useRef, type ReactNode } from "react";
import { useFilm, type Film } from "@/hooks/use-film";
import { useOnScroll } from "@/hooks/use-on-scroll";

const HeroFilmContext = createContext<Film | null>(null);

function useHeroFilm(): Film {
  const ctx = use(HeroFilmContext);
  if (!ctx) throw new Error("Hero film parts must be rendered inside <HeroStage>");
  return ctx;
}

/**
 * The hero's moving parts. It owns the film's play state and the scroll effect (the film drifts down a
 * little and the words fade as the page scrolls); everything inside it is rendered on the server.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const film = useFilm();

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
    <HeroFilmContext value={film}>
      <section ref={section} id="top" data-nav="dark" aria-labelledby="hero-title" className="hf">
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
      <video ref={video} muted loop playsInline preload="metadata" poster={poster}>
        <source src={mobile} type="video/mp4" media="(max-width: 760px)" />
        <source src={desktop} type="video/mp4" />
      </video>
    </div>
  );
}

export function HeroFilmToggle() {
  const { paused, toggle } = useHeroFilm();
  return (
    <button type="button" onClick={toggle} className="hf-toggle" aria-label={paused ? "Play background video" : "Pause background video"}>
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
