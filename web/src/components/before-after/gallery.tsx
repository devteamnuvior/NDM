"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow, IconClose, IconInfo, IconPin } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { withBase, withBaseSrcSet } from "@/lib/base-path";
import { byId } from "@/lib/dom";
import type { GalleryCase, GalleryView } from "@/lib/gallery";
import { lockScroll } from "@/lib/scroll-lock";
import { scrollToY } from "@/lib/smooth-scroll";

const HERO = { src: "/assets/hero/treatment-room.jpg", pos: "50% 50%" };
const WRAP = "mx-auto w-full max-w-[1180px]";
const NOTES: [title: string, text: string][] = [
  ["Individual results may vary", "Every photo is one person’s result. Yours depends on your skin, health, the plan and aftercare."],
  ["Shown as taken", "Photos are shared as they were taken at the clinic, with part of the face covered for privacy."],
  ["Start with a consultation", "A free consultation and VISIA® skin analysis tell you which results are realistic for you."],
];

const altOf = (c: GalleryCase) => (c.label ? `${c.label}, before and after` : "Before and after");
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The before & after page (redesign, user 2026-11-18; the prototype's before-after.html is the source): the procedure and concern
 * pages' photo header with the numbers on a glass card, a sticky treatment bar with counts, the cases in the treatment pages'
 * 1180px column and spacing, a full-size viewer with previous / next and the treatment's own page, and "Good to know".
 * Cases are the posts of the type "Before & After" in WordPress (category covers are left out by `getGallery`); photos are plain
 * images as WordPress serves them.
 */
export function Gallery({ labels, cases, pages }: Pick<GalleryView, "labels" | "cases" | "pages">) {
  const sec = useRef<HTMLElement>(null);
  const notes = useRef<HTMLElement>(null);
  useReveal(sec);
  useReveal(notes);
  const [on, setOn] = useState("All");
  const [open, setOpen] = useState(-1);
  const list = cases.filter((c) => on === "All" || c.labels.includes(on));
  const count = (l: string) => cases.filter((c) => c.labels.includes(l)).length;
  const toCases = () => {
    const el = byId("ba-cases");
    if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 160);
  };
  const go = useCallback((d: number) => setOpen((i) => (i + d + list.length) % list.length), [list.length]);
  const close = useCallback(() => setOpen(-1), []);
  const about = on !== "All" ? pages[on] : undefined;

  return (
    <>
      <GalleryHero cases={cases.length} treatments={labels.length} onBrowse={toCases} />


      <section ref={sec} id="ba-cases" aria-labelledby="ba-cases-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
        <div className={WRAP}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow className="rv">Gallery</Eyebrow>
              <TwoTone
                id="ba-cases-title"
                className="rv mt-5"
                size="text-[clamp(32px,3.4vw,52px)]"
                lead={
                  <>
                    {on === "All" ? "Every case," : `${on},`}
                    <br />
                  </>
                }
                strong={`${list.length} ${list.length === 1 ? "case" : "cases"}`}
                style={{ transitionDelay: ".06s" }}
              />
            </div>
            <p className="rv max-w-[380px] font-inter text-[15px] leading-[1.6] text-ndm-muted md:mb-2" style={{ transitionDelay: ".1s" }}>
              {about ? (
                <>
                  Open a case to see it full size.{" "}
                  <Link href={about} className="font-medium text-ndm-deep underline-offset-4 hover:underline">
                    Read about {on}
                  </Link>
                  .
                </>
              ) : (
                "Open a case to see it full size, then go on to the case before or after it."
              )}
            </p>
          </div>
          <div role="group" aria-label="Filter by treatment" className="rv mt-[clamp(24px,2.6vw,36px)] flex flex-wrap gap-2" style={{ transitionDelay: ".12s" }}>
            {["All", ...labels].map((l) => (
              <button key={l} type="button" onClick={() => setOn(l)} aria-pressed={on === l} className={`bag-chip inline-flex items-center gap-2 rounded-full py-2 pr-2.5 pl-4 font-inter text-[14px] transition-colors ${on === l ? "is-on" : ""}`}>
                {l}
                <span className="bag-chip-n rounded-full px-2 py-0.5 text-[12px] tabular-nums">{l === "All" ? cases.length : count(l)}</span>
              </button>
            ))}
          </div>
          <ul className="mt-[clamp(20px,2.2vw,32px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {list.map((c, i) => (
              <li key={c.id}>
                <button type="button" onClick={() => setOpen(i)} className="bag-card group relative block w-full overflow-hidden rounded-[24px] bg-white text-left">
                  <span className="relative block aspect-[431/310] overflow-hidden bg-ndm-mist">
                    {/* eslint-disable-next-line @next/next/no-img-element -- already sized by WordPress */}
                    <img
                      src={withBase(c.photo.src)}
                      srcSet={withBaseSrcSet(c.photo.srcSet || undefined)}
                      width={c.photo.width}
                      height={c.photo.height}
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
                      alt={altOf(c)}
                      loading={i < 6 ? "eager" : "lazy"}
                      decoding="async"
                      className="bag-card-img absolute inset-0 h-full w-full object-cover"
                    />
                    <span aria-hidden="true" className="bag-card-shade absolute inset-0" />
                    <span aria-hidden="true" className="bag-zoom absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12.5px] font-medium text-ndm-ink backdrop-blur-[8px]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      View
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3 px-5 pt-4 pb-5">
                    <span>
                      <span className="block font-aeonik text-[20px] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{c.label || "Before & after"}</span>
                      <span className="mt-1 block font-inter text-[12.5px] text-ndm-muted">Case {String(i + 1).padStart(2, "0")} · Individual results may vary</span>
                    </span>
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-ndm-paper text-ndm-deep ring-1 ring-ndm-ink/[.08] transition-colors group-hover:bg-ndm-deep group-hover:text-white">
                      <IconArrow size={13} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section ref={notes} aria-labelledby="ba-notes-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(64px,7vw,104px)]">
        <div className={WRAP}>
          <Eyebrow className="rv">Good to know</Eyebrow>
          <TwoTone
            id="ba-notes-title"
            className="rv mt-5"
            size="text-[clamp(32px,3.4vw,52px)]"
            lead={
              <>
                Reading before
                <br />
              </>
            }
            strong="and after photos"
            style={{ transitionDelay: ".06s" }}
          />
          <ol className="rv mt-[clamp(28px,3vw,44px)] grid gap-4 md:grid-cols-3" style={{ transitionDelay: ".1s" }}>
            {NOTES.map(([t, d], i) => (
              <li key={t} className="relative overflow-hidden rounded-[24px] bg-white p-[clamp(22px,2.2vw,30px)] ring-1 ring-ndm-ink/[.06]">
                <span aria-hidden="true" className="bag-note-n font-aeonik tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative block font-aeonik text-[22px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{t}</span>
                <span className="relative mt-2 block font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {open >= 0 && list[open] && <CaseViewer list={list} at={open} page={pages[list[open].label]} onClose={close} onGo={go} />}
    </>
  );
}

/** The header: the procedure pages' full-width photo, the words on the left, the numbers on a glass card on the right. */
function GalleryHero({ cases, treatments, onBrowse }: { cases: number; treatments: number; onBrowse: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const pic = useRef<HTMLImageElement>(null);
  useReveal(ref);
  /* the gallery streams in after the header has measured the page: ask it to look again, so it turns dark over this photo */
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, []);
  useOnScroll(() => {
    const img = pic.current;
    if (!img || reduced()) return;
    const h = img.parentElement?.offsetHeight ?? 0;
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.2, h * 0.1).toFixed(1)}px,0)`;
  });
  const stats: [string, string][] = [
    [String(cases), "Cases"],
    [String(treatments), "Treatments"],
    ["2", "Toronto clinics"],
  ];
  return (
    <section ref={ref} data-nav="dark" aria-labelledby="gallery-title" className="relative isolate overflow-hidden bg-ndm-night text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- the header photo, painted first */}
        <img ref={pic} src={withBase(HERO.src)} alt="" fetchPriority="high" className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform" style={{ objectPosition: HERO.pos }} />
      </div>
      <div aria-hidden="true" className="bag-shade-wide absolute inset-0 -z-10 hidden lg:block" />
      <div aria-hidden="true" className="bag-shade-tall absolute inset-0 -z-10 lg:hidden" />
      <div className="grid items-end gap-10 px-[var(--gx)] pt-[184px] pb-[clamp(36px,5vw,72px)] sm:pt-[170px] lg:min-h-[min(88svh,820px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-center xl:gap-[clamp(48px,6vw,110px)]">
        <div className="max-w-[640px]">
          <Eyebrow dark className="rv">
            Before &amp; after
          </Eyebrow>
          <TwoTone
            as="h1"
            id="gallery-title"
            dark
            className="rv mt-5"
            size="text-[clamp(44px,5.6vw,88px)]"
            lead={
              <>
                Real patients,
                <br />
              </>
            }
            strong="real results"
            style={{ transitionDelay: ".04s" }}
          />
          <p className="rv mt-5 max-w-[48ch] font-inter text-[16.5px] leading-[1.6] text-white/80" style={{ transitionDelay: ".08s" }}>
            Cases from our Uptown and Downtown clinics, by treatment. Each photo shows one person’s result, as it was taken at the clinic.
          </p>
          <p className="rv mt-3 flex items-start gap-2 font-inter text-[14px] leading-[1.5] text-white/75" style={{ transitionDelay: ".1s" }}>
            <IconPin size={15} className="mt-0.5 shrink-0 text-ndm-sky" />
            Uptown on Yonge Street and Downtown on Bay Street, Toronto
          </p>
          <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: ".14s" }}>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
            <Button
              href="#ba-cases"
              v="glass"
              onClick={(e) => {
                e.preventDefault();
                onBrowse();
              }}
            >
              Browse the cases
            </Button>
          </div>
        </div>
        <div className="bag-glass rv rounded-[26px] p-[clamp(20px,2.2vw,30px)]" style={{ transitionDelay: ".18s" }}>
          <p className="font-mont text-[11.5px] tracking-[.16em] text-white/70 uppercase">The gallery</p>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {stats.map(([n, t]) => (
              <div key={t} className="border-l border-white/15 pl-3 first:border-l-0 first:pl-0">
                <dt className="sr-only">{t}</dt>
                <dd className="font-aeonik text-[clamp(30px,2.6vw,40px)] leading-none tracking-[-0.03em] tabular-nums">
                  {n}
                  <span className="mt-1.5 block font-inter text-[12.5px] tracking-normal text-white/65">{t}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 font-inter text-[13px] leading-[1.5] text-white/75">
            <IconInfo className="mt-0.5 shrink-0" />
            Individual results may vary. Your provider explains what is realistic for you.
          </p>
        </div>
      </div>
    </section>
  );
}

/** One case at full size: previous and next (the side arrows, the buttons under it, or the keyboard), and the treatment's own page. */
function CaseViewer({ list, at, page, onClose, onGo }: { list: GalleryCase[]; at: number; page?: string; onClose: () => void; onGo: (d: number) => void }) {
  const c = list[at];
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onGo(1);
      if (e.key === "ArrowLeft") onGo(-1);
    };
    window.addEventListener("keydown", k);
    lockScroll(true);
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener("keydown", k);
      lockScroll(false);
    };
  }, [onClose, onGo]);
  const side = "bag-v-btn grid size-14 shrink-0 place-items-center rounded-full text-white transition-colors max-md:hidden";
  const step = "bag-v-btn inline-flex h-12 items-center gap-2 rounded-full px-5 font-inter text-[15px] font-medium text-white transition-colors";
  return (
    <div role="dialog" aria-modal="true" aria-label={altOf(c)} className="bag-viewer fixed inset-0 z-[95] flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-[var(--gx)] py-4" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-full bg-white/10 px-3.5 py-1.5 font-inter text-[13.5px] font-medium text-white tabular-nums">
          {at + 1} of {list.length}
        </span>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className="bag-v-btn grid size-12 place-items-center rounded-full text-white">
          <IconClose />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-5 px-[var(--gx)]">
        <button type="button" aria-label="Previous case" onClick={(e) => (e.stopPropagation(), onGo(-1))} className={side}>
          <IconArrow size={18} className="rotate-180" />
        </button>
        <figure key={c.id} className="bag-fig m-0 flex max-h-full min-h-0 w-full max-w-[780px] flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="min-h-0 flex-1 overflow-hidden rounded-[20px] bg-white p-2 shadow-[0_40px_90px_-40px_rgba(0,0,0,.9)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- the photo at its full size, as WordPress holds it */}
            <img src={withBase(c.photo.src)} width={c.photo.width} height={c.photo.height} alt={altOf(c)} decoding="async" className="h-full max-h-[62vh] w-full rounded-[14px] object-contain" />
          </div>
          <figcaption className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <span>
              <span className="block font-aeonik text-[clamp(26px,2.6vw,34px)] leading-[1.1] tracking-[-0.02em] text-white">{c.label || "Before & after"}</span>
              <span className="mt-1.5 block font-inter text-[15px] text-white/80">Individual results may vary</span>
            </span>
            {page && (
              <Link href={page} className="bag-v-about group inline-flex h-12 items-center gap-2 rounded-full px-5 font-inter text-[15px] font-medium transition-colors">
                About {c.label}
                <IconArrow size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </figcaption>
        </figure>
        <button type="button" aria-label="Next case" onClick={(e) => (e.stopPropagation(), onGo(1))} className={side}>
          <IconArrow size={18} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-3 px-[var(--gx)] pt-5 pb-6" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => onGo(-1)} className={step}>
          <IconArrow size={14} className="rotate-180" />
          Previous
        </button>
        <button type="button" onClick={() => onGo(1)} className={step}>
          Next
          <IconArrow size={14} />
        </button>
      </div>
    </div>
  );
}
