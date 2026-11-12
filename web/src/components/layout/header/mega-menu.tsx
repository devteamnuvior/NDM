"use client";

import Image from "next/image";
import { useState } from "react";
import clinicPhoto from "@/assets/images/clinic/clinic-2.jpg";
import { Button } from "@/components/ui/button";
import { IconArrow, IconCheckBadge } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { PROCEDURES } from "@/config/navigation";
import { ACTIONS, type PageId } from "@/config/routes";
import { NAMICA_SPHERE_SRC } from "@/config/site";
import { pageLink, resolveLabel } from "@/lib/routes";

export interface MenuPanelProps {
  open: boolean;
  /** The open page, to mark its link. */
  current?: PageId;
  /** Called when a link is followed, so the panel closes. */
  onLink: () => void;
  /** Load the panel's photos now, instead of waiting until it is first opened. */
  eager?: boolean;
}

export const PANEL_CLASS =
  "panel w-full rounded-[28px] border border-black/5 bg-white text-ndm-ink shadow-[0_50px_90px_-40px_rgba(11,15,19,.45)]";

/** The procedure category that holds the open page, if any. */
export function categoryOf(current?: PageId): string | undefined {
  if (!current) return undefined;
  return PROCEDURES.find((c) => c.groups.some((g) => g.items.some((it) => resolveLabel(it).page === current)))?.id;
}

/* Aptos in the procedures menu: the treatment links, beside the NAMICA story card */
function AptosLinks({ items, current, onLink }: { items: string[]; current?: PageId; onLink: () => void }) {
  return (
    <div className="mt-4">
      <p className="mb-1 font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">Treatment</p>
      <ul role="list">
        {items.map((it) => (
          <li key={it}>
            <SiteLink to={resolveLabel(it)} current={current} onClick={onLink} className="menu-item group font-mont">
              <span className="min-w-0">{it}</span>
              <IconArrow size={12} className="menu-arrow" />
            </SiteLink>
          </li>
        ))}
        <li>
          <SiteLink to={pageLink("aptos")} current={current} onClick={onLink} className="menu-item group font-mont">
            <span className="min-w-0">Aptos Thread Lift</span>
            <IconArrow size={12} className="menu-arrow" />
          </SiteLink>
        </li>
      </ul>
    </div>
  );
}

/* NAMICA: the purple frame, the same size as the consultation photo card beside it */
function AptosCard({ onLink, eager }: { onLink: () => void; eager?: boolean }) {
  return (
    <SiteLink to={pageLink("aptos")} onClick={onLink} className="namica group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[16px] p-5 text-white">
      {/* eslint-disable @next/next/no-img-element -- remote badge art, shown at a fixed small size */}
      <img src={NAMICA_SPHERE_SRC} alt="" aria-hidden="true" loading={eager ? "eager" : "lazy"} width={240} height={240} className="namica-sphere pointer-events-none absolute -top-10 -right-8 w-[190px] opacity-90 transition-transform duration-700 group-hover:scale-105" />
      <img src={NAMICA_SPHERE_SRC} alt="" aria-hidden="true" loading={eager ? "eager" : "lazy"} width={240} height={240} className="namica-sphere namica-sphere-2 pointer-events-none absolute top-[18%] left-[16%] w-[30px] opacity-70 blur-[1px]" />
      {/* eslint-enable @next/next/no-img-element */}
      <span className="relative block font-mont text-[11px] tracking-[.14em] text-[#C9C2F4] uppercase">NAMICA technology</span>
      <span className="relative mt-2 block font-aeonik text-[22px] leading-[1.2]">Biostimulation threads</span>
      <span className="relative mt-1.5 block font-inter text-[12.5px] font-medium tracking-[.04em] text-[#C9C2F4]">P(LA/CL) + HA</span>
      <span className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-inter text-[12px] text-white/90">
        <IconCheckBadge size={14} />
        Licensed by Health Canada
      </span>
    </SiteLink>
  );
}

/** Procedures: categories on the left, the open category's treatments, then the consultation photo card. */
export function MegaMenu({ open, current, onLink, eager }: MenuPanelProps) {
  const hereCat = categoryOf(current);
  const [act, setAct] = useState(hereCat ?? "aptos");
  const cat = PROCEDURES.find((c) => c.id === act) ?? PROCEDURES[0];
  const catLink = resolveLabel(cat.label);
  const isAptos = act === "aptos";

  return (
    <div className={PANEL_CLASS} data-open={open}>
      <div
        className={`grid gap-4 p-4 2xl:p-5 ${
          isAptos
            ? "grid-cols-[210px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)]"
            : "grid-cols-[210px_1fr_340px] 2xl:grid-cols-[260px_1fr_340px]"
        }`}
      >
        <ul className="rounded-[16px] bg-ndm-mist/70 p-2" role="list">
          {PROCEDURES.map((c) => {
            const on = c.id === act;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseEnter={() => setAct(c.id)}
                  onFocus={() => setAct(c.id)}
                  onClick={() => setAct(c.id)}
                  aria-pressed={on}
                  className={`flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-left font-mont text-[14px] transition-colors ${on ? "bg-white text-ndm-blue shadow-xs" : "text-ndm-ink hover:bg-white/70"}`}
                >
                  <span className="flex items-center gap-2">
                    {c.label}
                    {c.id === hereCat && <i aria-hidden="true" className="size-1.5 rounded-full bg-ndm-blue shadow-[0_0_0_3px_rgba(32,158,217,.18)]" />}
                  </span>
                  <IconArrow className={`transition-transform ${on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="h-[516px] px-5 py-4 2xl:h-[456px]">
          <div className="flex items-baseline justify-between gap-4 border-b border-ndm-line pb-4">
            <div>
              {catLink.page && !isAptos ? (
                <SiteLink to={catLink} onClick={onLink} className="group inline-flex items-center gap-2 font-aeonik text-[26px] leading-tight hover:text-ndm-deep">
                  {cat.label}
                  <IconArrow size={14} className="text-ndm-deep transition-transform group-hover:translate-x-0.5" />
                </SiteLink>
              ) : (
                <p className="font-aeonik text-[26px] leading-tight">{cat.label}</p>
              )}
              <p className="mt-1 max-w-[46ch] text-[13.5px] text-ndm-muted">{cat.blurb}</p>
            </div>
          </div>
          {isAptos ? (
            <AptosLinks items={cat.groups[0].items.filter((it) => it !== cat.label)} current={current} onLink={onLink} />
          ) : (
            <div className={`mt-4 grid gap-6 ${cat.groups.length > 1 ? "grid-cols-[1.9fr_1fr]" : ""}`}>
              {cat.groups.map((g) => (
                <div key={g.title ?? "g"}>
                  {g.title && <p className="mb-2 font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">{g.title}</p>}
                  <ul className={g.items.length > 7 ? "columns-2 gap-6" : ""} role="list">
                    {g.items
                      .filter((it) => it !== cat.label)
                      .map((it) => (
                        <li key={it} className="break-inside-avoid">
                          <SiteLink to={resolveLabel(it)} current={current} onClick={onLink} className="menu-item group font-mont">
                            <span className="min-w-0">{it}</span>
                            <IconArrow size={11} className="menu-arrow" />
                          </SiteLink>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        {isAptos && <AptosCard onLink={onLink} eager={eager} />}
        <a href={ACTIONS.book} onClick={onLink} className="group relative min-h-[380px] overflow-hidden rounded-[16px] text-white">
          <Image src={clinicPhoto} alt="" fill loading={eager ? "eager" : "lazy"} sizes="(min-width: 1536px) 420px, 340px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-linear-to-t/srgb from-[#0B0F13]/85 via-[#0B0F13]/25 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-5">
            <span className="block font-mont text-[11px] tracking-[.14em] text-white/75 uppercase">Not sure where to start?</span>
            <span className="mt-2 block font-aeonik text-[22px] leading-[1.2]">Free consultation &amp; VISIA® skin analysis</span>
            <Button as="span" v="book" onDark className="btn-g mt-4">
              Book Free Consultation
            </Button>
          </span>
        </a>
      </div>
    </div>
  );
}
