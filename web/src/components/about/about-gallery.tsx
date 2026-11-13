"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AwardsMotion } from "@/components/about/awards-motion";
import { GalleryPhoto } from "@/components/about/gallery-photo";
import { Lightbox } from "@/components/about/lightbox";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Stars } from "@/components/ui/icons";
import { ABOUT_GALLERY_COLUMNS } from "@/config/about";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import { lockScroll } from "@/lib/scroll-lock";
import type { AboutCopy } from "@/types/about";

/**
 * Gallery with awards and recognition: a mosaic of clinic photos in columns of different heights that
 * drift slightly apart on scroll, the awards text under the middle columns. A tile opens the viewer.
 */
export function AboutGallery({ copy }: { copy: AboutCopy["gallery"] }) {
  const photos = copy.photos;
  const section = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useReveal(section);
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  useOnScroll(() => {
    const el = section.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp01((vh - r.top) / (vh + r.height)) - 0.5;
    el.querySelectorAll<HTMLElement>("[data-drift]").forEach((c) => {
      c.style.transform = `translate3d(0,${(p * Number(c.dataset.drift) * -2).toFixed(1)}px,0)`;
    });
  });
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);
  const close = useCallback(() => {
    setIndex(null);
    const b = opener.current;
    requestAnimationFrame(() => {
      if (b && b.isConnected) b.focus({ preventScroll: true });
    });
  }, []);
  const step = useCallback((d: number) => setIndex((i) => ((i ?? 0) + d + photos.length) % photos.length), [photos.length]);

  return (
    <section ref={section} id="gallery" aria-labelledby="awards-title" className="relative z-10 scroll-mt-[100px] overflow-hidden bg-ndm-paper px-[var(--gx)] py-[clamp(72px,8vw,120px)]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-4 gap-x-2.5 gap-y-8 md:grid-cols-8 md:gap-x-[clamp(10px,1.3vw,18px)] md:gap-y-0">
        {ABOUT_GALLERY_COLUMNS.map((col, ci) => (
          <div key={ci} data-drift={col.drift} className={`gal-col flex-col gap-2.5 md:gap-[clamp(10px,1.3vw,18px)] ${col.place}`} style={{ paddingTop: `${col.top}%` }}>
            {col.tiles.map(([photo, ratio], ti) => {
              const g = photos[photo];
              /* a place of the mosaic without a photo stays empty */
              if (!g) return null;
              return (
                <button
                  key={photo}
                  type="button"
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setIndex(photo);
                  }}
                  aria-label={`View photo: ${g.title}`}
                  /* phones: the outer columns keep two photos so all four columns end level */
                  className={`rv rv-clip gal-tile group relative w-full overflow-hidden rounded-[14px] bg-ndm-line md:rounded-[18px] ${ti === 2 ? "hidden md:block" : "block"}`}
                  style={{ aspectRatio: ratio, transitionDelay: `${(Math.abs(ci - 3.5) * 0.07).toFixed(2)}s` }}
                >
                  <GalleryPhoto src={g.src} alt={g.alt} sizes="(min-width: 768px) 160px, 25vw" className="gal-photo absolute inset-0 h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        ))}
        <div id="awards" className="col-span-4 col-start-1 row-start-2 scroll-mt-[120px] pt-2 text-center md:col-span-4 md:col-start-3 md:row-start-2 md:pt-[clamp(20px,2.4vw,36px)]">
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <div className="rv mt-6 flex flex-col items-center gap-2" style={{ transitionDelay: ".04s" }}>
            <Stars className="justify-center" />
            <p className="font-inter text-[14px] text-ndm-slate">{copy.line}</p>
          </div>
          <h2 id="awards-title" className="rv mx-auto mt-4 font-aeonik text-[clamp(28px,2.8vw,44px)] leading-[1.08] font-normal tracking-[-0.035em] [text-wrap:balance] text-ndm-ink" style={{ transitionDelay: ".08s" }}>
            {copy.lead}
            <br className="hidden md:block" /> {copy.strong}
          </h2>
          <p className="rv mx-auto mt-4 max-w-[60ch] font-inter text-[15px] leading-[1.6] [text-wrap:balance] text-ndm-muted" style={{ transitionDelay: ".12s" }}>
            {copy.text}
          </p>
          <AwardsMotion className="mt-8" />
        </div>
      </div>
      {open && <Lightbox items={photos} index={index} onClose={close} onStep={step} onPick={setIndex} />}
    </section>
  );
}
