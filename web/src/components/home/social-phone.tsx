"use client";

import { useEffect, useRef, useState } from "react";
import { HAND_PHONE_SRC, REELS, SOCIAL } from "@/config/social";

/** Time on each reel. */
const REEL_MS = 5200;

/**
 * A hand holding a phone that plays the clinic's reels one after another while it is on screen. A reel's
 * file is only fetched when it is the current one or the next. With reduced motion the reels do not play.
 */
export function SocialPhone() {
  const box = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [on, setOn] = useState(false);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!on || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setCur((v) => (v + 1) % REELS.length), REEL_MS);
    return () => clearInterval(t);
  }, [on]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    videos.current.forEach((v, k) => {
      if (!v) return;
      const near = k === cur || k === (cur + 1) % REELS.length;
      if (near && !v.getAttribute("src")) v.src = REELS[k].src + (reduced ? "#t=0.5" : "");
      if (k === cur && on && !reduced) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [cur, on]);

  const reel = REELS[cur];
  return (
    <div ref={box} className="relative mx-auto w-[min(92vw,470px)] lg:mr-0 lg:ml-[-4vw] lg:w-[clamp(420px,40vw,660px)]" style={{ aspectRatio: "1288 / 1968" }}>
      {/* eslint-disable @next/next/no-img-element -- remote art and a small SVG mark, as in the prototype */}
      <img src={HAND_PHONE_SRC} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full select-none" draggable={false} />
      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noopener"
        aria-label={`${reel.tag} reel, watch @newdermamed on Instagram`}
        className="absolute z-[1] overflow-hidden bg-black"
        style={{ left: "25.5%", top: "7%", width: "49%", height: "70%", borderRadius: "15% / 7%" }}
      >
        <div className="h-full w-full transition-transform duration-[900ms]" style={{ transform: `translate3d(0,${-cur * 100}%,0)`, transitionTimingFunction: "var(--e-out)" }}>
          {REELS.map((x, k) => (
            <video
              key={x.src}
              ref={(el) => {
                videos.current[k] = el;
              }}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className="block h-full w-full bg-black object-contain"
            />
          ))}
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t/srgb from-black/60 to-transparent p-3 pt-10">
          <span className="flex items-center gap-2 font-inter text-[12px] text-white">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white">
              <img src="/assets/icons/logo-mark.svg" alt="" className="size-4" />
            </span>
            newdermamed
            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#3897F0" d="M12 1.5 14.6 4l3.5-.4.9 3.4 3 1.9-1.4 3.2 1.4 3.2-3 1.9-.9 3.4-3.5-.4L12 22.5 9.4 20l-3.5.4-.9-3.4-3-1.9L3.4 12 2 8.9l3-1.9.9-3.4 3.5.4Z" />
              <path d="m8.2 12.2 2.5 2.5 5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span key={cur} className="space-in mt-1 block font-inter text-[12px] text-white/80">
            {reel.tag}
          </span>
        </span>
      </a>
      {/* eslint-enable @next/next/no-img-element */}
      {/* a fade in the section colour over the wrist, so the cropped bottom of the hand dissolves into the page */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-x-[30%] bottom-0 z-[2] h-[34%]" style={{ background: "linear-gradient(0deg,#FAFAF8 0%,#FAFAF8 22%,rgba(250,250,248,.85) 55%,rgba(250,250,248,0) 100%)" }} />
    </div>
  );
}
