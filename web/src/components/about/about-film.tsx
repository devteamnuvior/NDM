"use client";

import { Fragment, useEffect, useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { ABOUT_FILM } from "@/config/about";
import { ACTIONS } from "@/config/routes";
import { useReveal } from "@/hooks/use-reveal";
import { scrollToY } from "@/lib/smooth-scroll";
import { byId } from "@/lib/dom";
import type { AboutCopy } from "@/types/about";
import { withBase } from "@/lib/base-path";

/** A number of the header: a whole number counts up, its sign ("+") stays after it; anything else is shown as typed. */
function Figure({ figure }: { figure: string }) {
  const [, number, suffix] = /^(\d+)(.*)$/.exec(figure) ?? [];
  if (!number) return <span className="tabular-nums">{figure}</span>;
  return <CountUp to={Number(number)} suffix={suffix} within=".about-stats" threshold={0.4} className="tabular-nums" />;
}

/** The page header: the clinic film at full width, the page title, the clinic in one sentence and four numbers. */
export function AboutFilm({ copy }: { copy: AboutCopy["header"] }) {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useReveal(section);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || saveData) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const toTeam = (e: MouseEvent) => {
    const el = byId("team");
    if (!el) return;
    e.preventDefault();
    scrollToY(el.getBoundingClientRect().top + window.scrollY - 100);
  };
  return (
    <section ref={section} id="top" aria-labelledby="about-ndm-title" data-nav="dark" className="relative z-10 bg-ndm-night">
      <div className="cf-frame is-hero" style={{ "--p": 1 } as React.CSSProperties}>
        <video ref={video} muted loop playsInline preload="auto" poster={withBase(ABOUT_FILM.poster)} aria-hidden="true">
          <source src={withBase(ABOUT_FILM.src)} type="video/mp4" />
        </video>
        <div className="absolute inset-x-0 bottom-0 z-[2] grid gap-8 px-[var(--gx)] pb-[clamp(28px,4.5vw,64px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <Eyebrow dark className="rv">
              {copy.tag}
            </Eyebrow>
            <TwoTone
              as="h1"
              dark
              id="about-ndm-title"
              className="rv mt-4"
              size="text-[clamp(38px,4.8vw,72px)]"
              lead={
                <>
                  {copy.lead}
                  <br />
                </>
              }
              strong={copy.strong}
              style={{ transitionDelay: ".05s" }}
            />
            <p className="rv mt-3 max-w-[56ch] font-inter text-[15.5px] leading-[1.6] text-white/80" style={{ transitionDelay: ".1s" }}>
              {copy.text}
            </p>
            <div className="rv mt-7 flex flex-wrap gap-3" style={{ transitionDelay: ".14s" }}>
              <Button href={ACTIONS.book} v="book" onDark>
                Book Free Consultation
              </Button>
              <Button href="#team" onClick={toTeam} v="glass">
                Meet our team
              </Button>
            </div>
          </div>
          <ul className="about-stats rv grid grid-cols-2 gap-y-5 border-t border-white/15 pt-6 sm:flex sm:items-center lg:border-0 lg:pt-0" role="list" style={{ transitionDelay: ".18s" }}>
            {copy.stats.map(({ figure, unit, label }, k) => (
              <Fragment key={k}>
                <li className="min-w-0 px-1 py-1 text-center sm:flex-1 lg:w-[clamp(160px,11.5vw,220px)] lg:flex-none">
                  <span className="block font-inter text-[14px] leading-[1.3] font-medium text-white sm:text-[15px]">
                    <Figure figure={figure} />{" "}
                    {unit}
                  </span>
                  <span className="mt-1.5 block font-inter text-[12px] leading-[1.35] text-ndm-soft sm:mt-2.5 sm:text-[13px]">{label}</span>
                </li>
                {k < copy.stats.length - 1 && <li role="presentation" aria-hidden="true" className="hidden h-[50px] w-px shrink-0 bg-[#B9B9B9]/60 sm:block" />}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
