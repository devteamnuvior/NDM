"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { categoryOf } from "@/components/layout/header/mega-menu";
import { Button } from "@/components/ui/button";
import { IconArrow, IconChevron, IconClose, IconExternal } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { useMenuLink, usePostSection } from "@/components/layout/concern-paths";
import { ABOUT_LINKS, CONCERNS, PAGE_SECTION, PROCEDURES } from "@/config/navigation";
import { ACTIONS, type PageId } from "@/config/routes";
import { CLINICS } from "@/config/site";
import { useDeferredOpen } from "@/hooks/use-deferred-open";
import { pageLink, tel } from "@/lib/routes";
import type { NavSectionId, ResolvedLink } from "@/types/navigation";

export interface MobileDrawerProps {
  open: boolean;
  current?: PageId;
  onClose: () => void;
}

type Section = "procedures" | "concerns" | "about";

const TOP_CLASS = "font-aeonik text-[22px]";

function SectionRow({ children, expanded, here, onClick }: { children: ReactNode; expanded: boolean; here?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={expanded} className={`flex w-full items-center justify-between py-4 text-left ${TOP_CLASS} ${here ? "nav-is-here" : ""}`}>
      <span className="relative">
        {children}
        {here && <i aria-hidden="true" className="nav-here is-left" />}
      </span>
      <IconChevron className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
    </button>
  );
}

function TopLink({ to, here, onClick, children }: { to: ResolvedLink; here: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <SiteLink to={to} onClick={onClick} {...(here ? { "aria-current": "page" as const } : {})} className={`block py-4 ${TOP_CLASS} ${here ? "nav-is-here" : ""}`}>
      <span className="relative">
        {children}
        {here && <i aria-hidden="true" className="nav-here is-left" />}
      </span>
    </SiteLink>
  );
}

function SubLink({ label, current, onClick, nowrap }: { label: string; current?: PageId; onClick: () => void; nowrap?: boolean }) {
  const menuLink = useMenuLink();
  return (
    <SiteLink to={menuLink(label)} current={current} onClick={onClick} className="menu-item-m font-mont">
      <span className={`min-w-0 ${nowrap ? "whitespace-nowrap" : ""}`}>{label}</span>
      <IconArrow size={11} className="shrink-0 text-ndm-blue" />
    </SiteLink>
  );
}

/** The phone and tablet menu: a panel from the right with the same navigation as the desktop header. */
export function MobileDrawer({ open, current, onClose }: MobileDrawerProps) {
  const shown = useDeferredOpen(open);
  const [sec, setSec] = useState<Section | null>(null);
  const [cat, setCat] = useState<string | null>(() => categoryOf(current) ?? null);
  const postSection = usePostSection();
  const section: NavSectionId | undefined = current ? PAGE_SECTION[current] : postSection;
  const toggle = (s: Section) => setSec(sec === s ? null : s);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[75] overflow-hidden ${shown ? "" : "pointer-events-none"}`}
      style={{ visibility: shown ? "visible" : "hidden", transition: `visibility 0s linear ${shown ? "0s" : ".5s"}` }}
      aria-hidden={!shown}
    >
      <div onClick={onClose} className={`absolute inset-0 bg-[#0B0F13]/50 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="absolute top-0 right-0 flex h-full w-full flex-col bg-white text-ndm-ink transition-transform duration-500 sm:w-[440px]"
        style={{ transform: shown ? "none" : "translateX(100%)", transitionTimingFunction: "var(--e-out)" }}
      >
        <div className="flex items-center justify-between border-b border-ndm-line px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
          <img src="/assets/icons/logo-color.svg" alt="NewDermaMed" width={317} height={62} className="h-9 w-auto" />
          <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-11 place-items-center rounded-full hover:bg-ndm-mist">
            <IconClose />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 divide-y divide-ndm-line overflow-y-auto px-5">
          <TopLink to={pageLink("home")} here={section === "home"} onClick={onClose}>
            Home
          </TopLink>
          <div>
            <SectionRow onClick={() => toggle("procedures")} expanded={sec === "procedures"} here={section === "procedures"}>
              Procedures
            </SectionRow>
            {sec === "procedures" && (
              <ul className="pb-4" role="list">
                {PROCEDURES.map((c) => (
                  <li key={c.id} className="border-t border-ndm-line/70">
                    <button type="button" onClick={() => setCat(cat === c.id ? null : c.id)} aria-expanded={cat === c.id} className="flex w-full items-center justify-between py-3 font-mont text-[15px]">
                      {c.label}
                      <span className="text-[18px] leading-none text-ndm-muted">{cat === c.id ? "–" : "+"}</span>
                    </button>
                    {cat === c.id &&
                      c.groups.map((g) => (
                        <div key={g.title ?? "g"} className="pb-3 pl-3">
                          {g.title && <p className="mt-1 mb-1 font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">{g.title}</p>}
                          {g.items.map((it) => (
                            <SubLink key={it} label={it} current={current} onClick={onClose} />
                          ))}
                        </div>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <SectionRow onClick={() => toggle("concerns")} expanded={sec === "concerns"}>
              Concerns
            </SectionRow>
            {sec === "concerns" && (
              <div className="space-y-3 pb-4">
                {CONCERNS.map((g) => (
                  <div key={g.title}>
                    <p className="mb-1 font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">{g.title}</p>
                    {g.items.map((it) => (
                      <SubLink key={it} label={it} current={current} onClick={onClose} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <TopLink to={pageLink("pricing")} here={section === "pricing"} onClick={onClose}>
            Pricing
          </TopLink>
          <TopLink to={pageLink("promotion")} here={section === "promotion"} onClick={onClose}>
            Promotion
          </TopLink>
          <div>
            <SectionRow onClick={() => toggle("about")} expanded={sec === "about"} here={section === "about"}>
              About
            </SectionRow>
            {sec === "about" && (
              <ul className="space-y-1 pb-4" role="list">
                {CLINICS.map((c) => (
                  <li key={c.id}>
                    <SiteLink to={pageLink("about")} onClick={onClose} className="block py-1.5 font-mont text-[15px]">
                      {c.name} Clinic <span className="text-[13px] text-ndm-muted">· {c.note}</span>
                    </SiteLink>
                  </li>
                ))}
                {ABOUT_LINKS.map((l) => (
                  <li key={l}>
                    <SubLink label={l} current={current} onClick={onClose} nowrap />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a href={ACTIONS.shop} target="_blank" rel="noopener" className={`flex items-center gap-2 py-4 ${TOP_CLASS}`}>
            Skincare shop <IconExternal size={16} />
          </a>
        </nav>
        <div className="space-y-3 border-t border-ndm-line p-5">
          <div className="grid grid-cols-2 gap-2">
            {CLINICS.map((c) => (
              <a key={c.id} href={tel(c.phone)} className="rounded-[14px] bg-ndm-mist px-4 py-3">
                <span className="block font-mont text-[11px] tracking-[.12em] text-ndm-muted uppercase">{c.name}</span>
                <span className="block font-mont text-[14px] font-medium">{c.phone}</span>
              </a>
            ))}
          </div>
          <Button href={ACTIONS.book} onClick={onClose} v="book" hot block>
            Book Free Consultation
          </Button>
        </div>
      </aside>
    </div>
  );
}
