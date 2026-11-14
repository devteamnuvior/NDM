"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SOCIAL_ICONS } from "@/components/home/social";
import { Button } from "@/components/ui/button";
import { IconAward, IconCheckBadge, IconMail, IconPin } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { CLINICS } from "@/config/site";
import { useSiteSettings } from "@/components/layout/site-settings";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01, easeOut } from "@/lib/math";
import { contentLink, pageLink, resolveLabel, tel } from "@/lib/routes";
import { withBase } from "@/lib/base-path";

const GLASS = { background: "rgba(11,15,19,.35)", backdropFilter: "blur(22px) saturate(130%)", WebkitBackdropFilter: "blur(22px) saturate(130%)" };

function Tile({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] text-white" style={{ background: "rgba(255,255,255,.12)" }}>
      {children}
    </span>
  );
}

/**
 * The site footer: a rounded panel over a slow film, with the closing call to action and a glass card
 * holding the logo, link columns, clinic contacts, social links and the legal line.
 */
export function SiteFooter() {
  const { footer: s } = useSiteSettings();
  const panel = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  useReveal(panel);

  /* the film plays on its own, but never with reduced motion */
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) film.current?.play().catch(() => {});
  }, []);

  /* the film eases out of a slight zoom as the footer scrolls into view */
  useOnScroll(() => {
    const el = panel.current;
    const v = film.current;
    if (!el || !v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const p = clamp01((window.innerHeight - el.getBoundingClientRect().top) / (window.innerHeight * 1.2));
    v.style.transform = `scale(${(1.14 - 0.14 * easeOut(p)).toFixed(4)})`;
  });

  return (
    <footer className="relative z-10 bg-ndm-paper px-[var(--gx)] pb-[clamp(12px,2vw,24px)]">
      <div ref={panel} data-nav="dark" className="relative overflow-hidden rounded-[26px] bg-ndm-slate">
        <video ref={film} muted loop playsInline preload="metadata" aria-hidden="true" poster={withBase(s.film.poster)} src={withBase(s.film.src)} className="absolute inset-0 h-full w-full object-cover will-change-transform" style={{ transformOrigin: "50% 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(18,14,11,.55) 0%,rgba(18,14,11,.15) 50%,rgba(18,14,11,0) 75%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(10,10,10,0) 40%,rgba(10,10,10,.35) 100%)" }} />

        <div className="relative px-4 pt-[clamp(56px,6vw,96px)] pb-4 md:px-10 md:pb-8">
          <div className="max-w-[640px] px-1 text-white md:px-0">
            <h2 className="rv font-aeonik text-[clamp(34px,4vw,56px)] leading-[1.12] font-normal tracking-[-0.025em] [text-shadow:0_10px_30px_rgba(0,0,0,.18)]">
              <span className="text-white">{s.cta.lead}</span> <span className="tt-strong text-ndm-sky">{s.cta.strong}</span>
            </h2>
            {s.cta.text && (
              <p className="rv mt-5 max-w-[44ch] font-inter text-[15px] leading-[1.6] text-white/85 md:text-[16px]" style={{ transitionDelay: ".1s" }}>
                {s.cta.text}
              </p>
            )}
            <div className="rv mt-8 flex flex-wrap gap-2.5" style={{ transitionDelay: ".18s" }}>
              <Button href={ACTIONS.book} v="book" onDark>
                {s.cta.book}
              </Button>
              {s.cta.second && (
                <Button href={contentLink(s.cta.second.link).href} v="glass">
                  {s.cta.second.label}
                </Button>
              )}
            </div>
          </div>

          <div className="rv mt-[clamp(48px,6vw,96px)] rounded-[22px] p-6 text-white md:p-10" style={{ ...GLASS, transitionDelay: ".05s" }}>
            <div className="grid gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-[1.35fr_.65fr_.75fr_1.25fr]">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
                <img src={withBase("/assets/icons/logo-white.svg")} alt="NewDermaMed, Cosmetic Surgery and Laser Clinic" width={255} height={49} className="h-11 w-auto" />
                {s.about && <p className="mt-5 max-w-[36ch] font-inter text-[14.5px] leading-[1.6] text-white/75">{s.about}</p>}
                {(s.badges.award || s.badges.years) && (
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-inter text-[13px] text-white/75">
                    {s.badges.award && (
                      <span className="inline-flex items-center gap-1.5">
                        <IconAward />
                        {s.badges.award}
                      </span>
                    )}
                    {s.badges.years && (
                      <span className="inline-flex items-center gap-1.5">
                        <IconCheckBadge />
                        {s.badges.years}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {s.columns.map((col, i) => (
                <nav key={`${i}-${col.title}`} aria-label={col.title || undefined}>
                  <h3 className="font-inter text-[13px] font-normal text-white/60">{col.title}</h3>
                  <ul className="mt-4 space-y-2.5" role="list">
                    {col.links.map((l, k) => (
                      <li key={`${k}-${l.label}`}>
                        <SiteLink to={l.link ? contentLink(l.link) : resolveLabel(l.label)} className="font-inter text-[15px] text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline">
                          {l.label}
                        </SiteLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
              <div>
                <h3 className="font-inter text-[13px] font-normal text-white/60">{s.contactTitle}</h3>
                <ul className="mt-4 space-y-3.5 font-inter text-[14.5px] leading-[1.45] text-white/75" role="list">
                  {CLINICS.map((c) => (
                    <li key={c.id} className="flex items-start gap-3">
                      <Tile>
                        <IconPin />
                      </Tile>
                      <span>
                        <span className="block text-white">{c.name}</span>
                        {c.address}
                        <a href={withBase(tel(c.phone))} className="block text-white hover:underline">
                          {c.phone}
                        </a>
                      </span>
                    </li>
                  ))}
                  {s.email && (
                    <li className="flex items-center gap-3">
                      <Tile>
                        <IconMail />
                      </Tile>
                      <a href={`mailto:${s.email}`} className="hover:text-white">
                        {s.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-12 flex flex-col-reverse items-center justify-between gap-5 border-t border-white/15 pt-6 font-inter text-[13px] text-white/65 md:flex-row">
              {s.copyright ? <p>{s.copyright}</p> : <span />}
              <ul className="flex gap-2" role="list">
                {SOCIAL_ICONS.filter(([net]) => s.social[net]).map(([net, Icon, name]) => (
                  <li key={net}>
                    <a href={s.social[net]} target="_blank" rel="noopener" aria-label={`NewDermaMed on ${name}`} data-net={net} className="soc-ico grid size-9 place-items-center rounded-[10px] text-white">
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                <SiteLink to={pageLink("privacy")} className="hover:text-white">
                  Privacy
                </SiteLink>
                <SiteLink to={pageLink("terms")} className="hover:text-white">
                  Terms
                </SiteLink>
                <SiteLink to={pageLink("refunds")} className="hover:text-white">
                  Refunds
                </SiteLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
