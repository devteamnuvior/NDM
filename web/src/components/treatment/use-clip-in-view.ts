import { useEffect, type RefObject } from "react";

/** Plays a muted clip only while its section is on screen; nothing is downloaded before that (preload none, a poster shows first). */
export function useClipInView(section: RefObject<HTMLElement | null>, video: RefObject<HTMLVideoElement | null>): void {
  useEffect(() => {
    const el = section.current;
    const v = video.current;
    if (!el || !v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduced) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [section, video]);
}
