import { useEffect, useRef, useState, type RefObject } from "react";

export interface Film {
  /** Put this on the <video>. */
  video: RefObject<HTMLVideoElement | null>;
  paused: boolean;
  /** The viewer's play / pause button: their choice then wins over scrolling. */
  toggle: () => void;
}

/**
 * Plays a muted background film only while it is on screen; never with reduced motion or data saver.
 * @param early start loading and playing one screen before the film scrolls into view
 */
export function useFilm(early = false): Film {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    /* browsers only allow a film to start on its own while it is muted */
    v.muted = true;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || saveData) {
      v.pause();
      const raf = requestAnimationFrame(() => setPaused(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          v.play().catch(() => {});
          setPaused(false);
        } else if (!entry.isIntersecting) {
          v.pause();
        }
      },
      early ? { rootMargin: "100% 0px" } : { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [early]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
      setPaused(false);
    } else {
      userPaused.current = true;
      v.pause();
      setPaused(true);
    }
  };

  return { video, paused, toggle };
}
