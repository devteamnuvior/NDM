"use client";

import { createContext, use, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useFilm, type Film } from "@/hooks/use-film";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { withBase } from "@/lib/base-path";
import type { HeroPhoto } from "@/types/home";

/** The film, or with header photos the photo in view (`slide`) and how many there are (`slides`). */
interface HeroPlay extends Film {
  slide: number;
  slides: number;
  go: (i: number) => void;
}

/** How long each header photo stays before the next comes in. */
const PHOTO_MS = 6500;

/*
 * The film's motion, played on the photos (user, 2026-11-17): each time a photo dissolves in it takes, at random, one slow
 * camera move (a push, pull, pan or rise); no light effects (user). The first photo's move is fixed, so the page the server
 * sends matches the first paint.
 */
const MOVES = ["push", "pull", "pan-l", "pan-r", "rise"] as const;
interface Look {
  move: (typeof MOVES)[number];
  n: number;
}
const FIRST: Look = { move: "push", n: 0 };
function pick<T>(list: readonly T[], not?: T): T {
  const rest = list.filter((x) => x !== not);
  return rest[Math.floor(Math.random() * rest.length)];
}
function nextLook(prev: Look, n: number): Look {
  return { move: pick(MOVES, prev.move), n };
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const reducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
function watchReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

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
  /* header photos: the next one fades in every few seconds; the pause button holds them (held from the start with reduced motion) */
  const [slide, setSlide] = useState(0);
  /* with reduced motion the photos start held, as in the prototype: the button then reads Play, and pressing it runs them */
  const reduced = useSyncExternalStore(watchReducedMotion, reducedMotion, () => false);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const held = chosen ?? reduced;
  const [seen, setSeen] = useState(true);
  /* the photos run only while the header is on screen and the tab is visible */
  useEffect(() => {
    const el = section.current;
    if (!el || !slides) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    const vis = () => setSeen(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [slides]);
  useEffect(() => {
    if (slides < 2 || held || !seen) return;
    const t = setTimeout(() => setSlide((s) => (s + 1) % slides), PHOTO_MS);
    return () => clearTimeout(t);
  }, [slides, held, seen, slide]);
  const go = (i: number) => setSlide(((i % slides) + slides) % slides);
  const play: HeroPlay = slides
    ? { video: film.video, paused: held, toggle: () => setChosen(!held), slide, slides, go }
    : { ...film, slide: 0, slides: 0, go: () => {} };

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
      <section ref={section} id="top" data-nav="dark" data-float-hold="" aria-labelledby="hero-title" className={`hf ${slides && held ? "hs-paused" : ""}`}>
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
  /* each photo keeps the look it last came in with, so a photo that is fading out does not jump */
  const [looks, setLooks] = useState<Look[]>(() => photos.map((_, i) => ({ ...FIRST, n: i })));
  const [shown, setShown] = useState(0);
  if (slide !== shown) {
    setShown(slide);
    setLooks((L) => L.map((l, i) => (i === slide ? nextLook(L[shown], Math.max(...L.map((x) => x.n)) + 1) : l)));
  }
  return (
    <div data-hero-media className="hf-media">
      {photos.map((p, i) => {
        const l = looks[i] ?? FIRST;
        return (
          <div key={i} className={`hs-slide ${i === slide ? "is-on" : ""}`} style={{ "--hs-dim": p.dim ?? 0 } as CSSProperties}>
            <picture key={l.n} className={`hs-pic mv-${l.move}`}>
              <source media="(max-width: 760px)" srcSet={p.mobile} />
              {/* a WordPress photo as it is, like the site's other WordPress photos (no image optimizer); photos out of view have no alt */}
              <img src={p.desktop} alt={i === slide ? p.alt : ""} draggable={false} decoding="async" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
            </picture>
          </div>
        );
      })}
    </div>
  );
}

/** One small bar for each header photo: it fills while the photo shows, and a click shows that photo. */
function HeroDots() {
  const { slide, slides, go } = useHeroFilm();
  if (slides < 2) return null;
  return (
    <div className="hs-dots" role="group" aria-label="Header photos">
      {Array.from({ length: slides }, (_, i) => (
        <button key={i} type="button" onClick={() => go(i)} aria-label={`Show header photo ${i + 1}`} aria-current={i === slide || undefined} className={`hs-dot ${i === slide ? "is-on" : ""}`}>
          <i key={i === slide ? `on-${slide}` : "off"} style={{ animationDuration: `${PHOTO_MS}ms` }} />
        </button>
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
    <>
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
    <HeroDots />
    </>
  );
}
