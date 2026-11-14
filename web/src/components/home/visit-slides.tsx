"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base-path";

interface VisitSlidesProps {
  images: StaticImageData[];
  /** Alt text of the photo on show. */
  alt: string;
  /** Position of the card in its row: the second card runs half a beat behind the first. */
  index: number;
}

const BEAT_MS = 4800;

/** A clinic's photos, cross-fading with a slow zoom while the card is on screen. */
export function VisitSlides({ images, alt, index }: VisitSlidesProps) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el || images.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let beat: ReturnType<typeof setInterval> | undefined;
    let delay: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        clearInterval(beat);
        clearTimeout(delay);
        if (e.isIntersecting) {
          delay = setTimeout(() => {
            beat = setInterval(() => setK((v) => (v + 1) % images.length), BEAT_MS);
          }, index * (BEAT_MS / 2));
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(beat);
      clearTimeout(delay);
    };
  }, [images.length, index]);

  return (
    <div ref={box} className="absolute inset-0">
      {images.map((src, j) => (
        <Image key={src.src} src={withBase(src)} alt={j === k ? alt : ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className={`visit-slide object-cover ${j === k ? "is-on" : ""}`} />
      ))}
      <span aria-hidden="true" className="absolute right-3 bottom-3 flex gap-1 rounded-full bg-black/25 px-2 py-1.5 backdrop-blur-[6px]">
        {images.map((src, j) => (
          <i key={src.src} className={`h-1 rounded-full bg-white transition-all duration-500 ${j === k ? "w-4" : "w-1 opacity-60"}`} />
        ))}
      </span>
    </div>
  );
}
