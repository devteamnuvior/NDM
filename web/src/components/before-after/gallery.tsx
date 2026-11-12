"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconClose, IconInfo } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import type { GalleryCase } from "@/config/gallery";
import { ACTIONS } from "@/config/routes";
import { useReveal } from "@/hooks/use-reveal";

interface GalleryProps {
  eyebrow: string;
  lead: string;
  strong: string;
  subs: string[];
  labels: string[];
  note: string;
  cases: GalleryCase[];
}

const altOf = (c: GalleryCase) => (c.label ? `${c.label}, before and after` : "Before and after");

/**
 * The before & after gallery: every case, a filter by treatment and a full-size view.
 * Fixed here (2026-11-12, asked by the user): in the prototype the full-size view lives inside this section's
 * layer (z-10), so the site header stayed above it and covered its Close button. While the view is open the
 * section now rises above the header, so the view covers the whole page and Close can be clicked.
 */
export function Gallery({ eyebrow, lead, strong, subs, labels, note, cases }: GalleryProps) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  const [on, setOn] = useState("All");
  const [open, setOpen] = useState<GalleryCase | null>(null);
  const list = cases.filter((c) => on === "All" || c.label === on);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  return (
    <section ref={section} aria-labelledby="gallery-title" className={`ba-gallery relative ${open ? "z-[95]" : "z-10"} bg-ndm-paper px-[var(--gx)] pt-[clamp(160px,14vw,210px)] pb-[clamp(72px,8vw,120px)]`}>
      <div className="mx-auto max-w-[860px] text-center">
        <Eyebrow className="rv">{eyebrow}</Eyebrow>
        <TwoTone
          as="h1"
          id="gallery-title"
          className="rv mx-auto mt-5"
          size="text-[clamp(34px,4.2vw,62px)]"
          lead={
            <>
              {lead}
              <br />
            </>
          }
          strong={strong}
          style={{ transitionDelay: ".06s" }}
        />
        {subs.map((s, i) => (
          <p key={s} className={`rv mx-auto mt-4 max-w-[56ch] font-inter leading-[1.6] ${i ? "text-[15px] text-ndm-muted" : "text-[17px] text-ndm-ink/85"}`} style={{ transitionDelay: ".1s" }}>
            {s}
          </p>
        ))}
      </div>
      <div className="rv mx-auto mt-[clamp(28px,3.4vw,44px)] flex max-w-[1180px] flex-wrap justify-center gap-1.5" role="group" aria-label="Filter by treatment">
        {["All", ...labels].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setOn(l)}
            aria-pressed={on === l}
            className={`rounded-full px-3.5 py-2 font-inter text-[13.5px] transition-colors ${on === l ? "bg-ndm-deep text-white" : "bg-white text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <ul className="mx-auto mt-7 grid max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4" role="list">
        {list.map((c, i) => (
          <li key={c.photo.src} className="rv in">
            <button type="button" onClick={() => setOpen(c)} className="group block w-full overflow-hidden rounded-[18px] bg-white p-2 text-left shadow-[0_22px_44px_-36px_rgba(27,36,43,.35)] ring-1 ring-ndm-ink/[.06]">
              <span className="peach relative block aspect-[4/3] overflow-hidden rounded-[12px] bg-ndm-mist">
                <Image
                  src={c.photo}
                  alt={altOf(c)}
                  sizes="(min-width: 1024px) 290px, (min-width: 768px) 33vw, 50vw"
                  loading={i < 8 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                />
              </span>
              <span className="flex items-center justify-between gap-2 px-1.5 pt-2.5 pb-1">
                <span className="font-inter text-[13.5px] font-medium text-ndm-ink">{c.label || "Before & after"}</span>
                <span className="font-inter text-[12px] text-ndm-muted">View</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 flex max-w-[1180px] items-start gap-2.5 font-inter text-[13px] leading-[1.5] text-ndm-muted">
        <IconInfo className="mt-0.5 shrink-0" />
        {note}
      </p>
      <div className="mt-10 flex justify-center">
        <Button href={ACTIONS.book} v="book" hot>
          Book Free Consultation
        </Button>
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={open.label || "Before and after"} className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0B0F13]/85 p-4" onClick={() => setOpen(null)}>
          <figure className="m-0 max-h-full max-w-[1100px]" onClick={(e) => e.stopPropagation()}>
            <Image src={open.photo} alt={altOf(open)} unoptimized className="max-h-[80vh] w-auto max-w-full rounded-[14px] object-contain" />
            <figcaption className="mt-3 flex items-center justify-between font-inter text-[14px] text-white/85">
              <span>{open.label}</span>
              <span className="text-white/60">Individual results may vary</span>
            </figcaption>
          </figure>
          <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <IconClose />
          </button>
        </div>
      )}
    </section>
  );
}
