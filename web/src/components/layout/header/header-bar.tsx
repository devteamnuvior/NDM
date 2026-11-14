"use client";

import { useEffect, useRef, useState, type ComponentType, type MouseEvent } from "react";
import { AboutMenu } from "@/components/layout/header/about-menu";
import { ConcernsMenu } from "@/components/layout/header/concerns-menu";
import { MegaMenu, type MenuPanelProps } from "@/components/layout/header/mega-menu";
import { Button } from "@/components/ui/button";
import { IconBag, IconChevron, IconExternal, IconMenu, IconSearch, IconUser } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { useArticleSection, usePostSection } from "@/components/layout/concern-paths";
import { NAV, PAGE_SECTION } from "@/config/navigation";
import { ACTIONS, type PageId } from "@/config/routes";
import { pageLink, resolveLabel } from "@/lib/routes";
import type { NavItem, NavMenuId } from "@/types/navigation";
import { withBase } from "@/lib/base-path";

export interface HeaderBarProps {
  /** Dark glass with white text: the header is sitting over a dark section. */
  dark: boolean;
  /** The open page, to mark its section and links. */
  current?: PageId;
  /** Distance from the top of the window, in px (the announcement bar's height). */
  top?: number;
  /** Fades the header out and takes it out of reach (for page intros). */
  visible?: boolean;
  cartCount?: number;
  onSearch: () => void;
  onDrawer: () => void;
  /** Leave out to hide the cart button. */
  onCart?: () => void;
}

const PANELS: ReadonlyArray<readonly [NavMenuId, ComponentType<MenuPanelProps>]> = [
  ["procedures", MegaMenu],
  ["concerns", ConcernsMenu],
  ["about", AboutMenu],
];

const GLASS = "blur(14px) saturate(160%)";
const ITEM_CLASS =
  "relative flex items-center gap-1.5 rounded-full px-2 py-2.5 font-inter text-[15px] tracking-[-0.02em] whitespace-nowrap transition-colors 2xl:px-4 2xl:text-[16px]";

function navLink(n: NavItem) {
  if (n.href === "/") return pageLink("home");
  return n.href ? { href: n.href } : resolveLabel(n.label);
}

/** The fixed site header: logo, primary navigation with its three dropdown panels, and the actions. */
export function HeaderBar({ dark, current, top = 36, visible = true, cartCount = 0, onSearch, onDrawer, onCart }: HeaderBarProps) {
  const [open, setOpen] = useState<NavMenuId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapRef = useRef<HTMLElement>(null);
  const postSection = usePostSection();
  const articleSection = useArticleSection();
  const section = current ? PAGE_SECTION[current] : (postSection ?? articleSection);

  const enter = (id: NavMenuId) => {
    clearTimeout(timer.current);
    setOpen(id);
  };
  const leave = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(null), 160);
  };
  const close = () => setOpen(null);

  /* The dropdown photos are not needed for the first paint. On screens that show the menu they are
     fetched once the browser is idle (or as soon as the pointer reaches the menu), so a panel never
     opens with an empty photo card. Phones never fetch them. */
  const [primed, setPrimed] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1280px)").matches) return;
    const prime = () => setPrimed(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prime, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prime, 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      clearTimeout(timer.current);
    };
  }, []);

  const tone = dark && !open; /* the bar turns solid white while a menu is open */
  const hover = tone ? "hover:bg-white/10" : "hover:bg-black/5";
  const active = tone ? "bg-white/10" : "bg-black/5";
  const icon = `grid place-items-center size-10 rounded-[8px] transition-colors ${hover}`;
  const hereClass = `nav-is-here ${tone ? "is-dark" : ""}`;

  return (
    <header
      ref={wrapRef}
      className="fixed inset-x-0 z-50"
      style={{
        top,
        transition: "top .5s var(--e-out), opacity .8s ease, transform .9s var(--e-out)",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(-14px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        aria-hidden="true"
        onClick={close}
        data-open={!!open}
        className="menu-scrim fixed inset-0 -z-10 hidden xl:block"
        style={{
          background: "rgba(11,15,19,.42)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
        }}
      />
      <div
        className="hdr-bar relative w-full transition-colors duration-300"
        style={{
          color: tone ? "#fff" : "#333",
          backgroundColor: open ? "#fff" : dark ? "rgba(10,13,16,.38)" : "rgba(250,250,248,.78)",
          boxShadow: tone ? "inset 0 -1px 0 rgba(255,255,255,.08)" : "inset 0 -1px 0 rgba(17,24,28,.06)",
          backdropFilter: GLASS,
          WebkitBackdropFilter: GLASS,
        }}
      >
        <div className="mx-auto grid h-[64px] max-w-[1920px] grid-cols-[auto_1fr_auto] items-center gap-4 px-[var(--gx)] xl:h-[84px] xl:grid-cols-[1fr_auto_1fr] xl:gap-3 2xl:gap-4">
          <SiteLink to={pageLink("home")} aria-label="NewDermaMed home" className="relative block h-[30px] justify-self-start sm:h-[34px] xl:h-[34px] 2xl:h-[42px]">
            {/* eslint-disable @next/next/no-img-element -- SVG logos: nothing for the image optimizer to do */}
            <img src={withBase("/assets/icons/logo-color.svg")} alt="" width={317} height={62} fetchPriority="high" className="h-full w-auto object-contain object-left transition-opacity duration-500" style={{ opacity: tone ? 0 : 1 }} />
            <img src={withBase("/assets/icons/logo-white.svg")} alt="" width={255} height={49} fetchPriority="high" className="absolute top-0 left-0 h-full w-auto object-contain object-left transition-opacity duration-500" style={{ opacity: tone ? 1 : 0 }} />
            {/* eslint-enable @next/next/no-img-element */}
          </SiteLink>

          <nav aria-label="Primary" className="hidden xl:block" onMouseEnter={() => setPrimed(true)} onMouseLeave={leave}>
            <ul className="flex items-center gap-0 2xl:gap-2" role="list">
              {NAV.map((n) => {
                const here = section === n.id;
                const menu = n.menu;
                return (
                  <li key={n.id} className="relative" onMouseEnter={() => (menu ? enter(menu) : leave())}>
                    {menu ? (
                      <button
                        type="button"
                        aria-expanded={open === menu}
                        aria-haspopup="true"
                        onClick={() => setOpen(open === menu ? null : menu)}
                        className={`${ITEM_CLASS} ${hover} ${open === menu ? active : ""} ${here ? hereClass : ""}`}
                      >
                        {n.label}
                        {here && (
                          <>
                            <span className="sr-only"> (current section)</span>
                            <i aria-hidden="true" className={`nav-here ${tone ? "is-dark" : ""}`} />
                          </>
                        )}
                        <IconChevron className={`opacity-60 transition-transform duration-300 ${open === menu ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <SiteLink
                        to={navLink(n)}
                        {...(n.external ? { target: "_blank", rel: "noopener" } : {})}
                        {...(here ? { "aria-current": "page" as const } : {})}
                        className={`${ITEM_CLASS} ${hover} ${here ? hereClass : ""}`}
                      >
                        {n.label}
                        {n.external && <IconExternal className="opacity-60" />}
                        {here && <i aria-hidden="true" className={`nav-here ${tone ? "is-dark" : ""}`} />}
                      </SiteLink>
                    )}
                  </li>
                );
              })}
            </ul>
            <div
              className={`absolute inset-x-0 top-full pt-2.5 ${open ? "" : "pointer-events-none"}`}
              onMouseEnter={() => clearTimeout(timer.current)}
              onClick={(e: MouseEvent<HTMLDivElement>) => {
                if (!(e.target as Element).closest(".panel")) close();
              }}
            >
              <div className="mx-auto max-w-[1920px] px-[var(--gx)]">
                <div className="relative">
                  {PANELS.map(([id, Panel]) => (
                    <div key={id} className={open === id ? "relative z-10" : "pointer-events-none absolute inset-x-0 top-0"}>
                      <Panel open={open === id} current={current} onLink={close} eager={primed} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-1 justify-self-end sm:gap-1.5">
            <button type="button" onClick={onSearch} aria-label="Search treatments" className={`max-md:hidden! ${icon}`}>
              <IconSearch size={21} />
            </button>
            <SiteLink to={pageLink("account")} aria-label="My account" className={`grid ${icon}`}>
              <IconUser size={21} />
            </SiteLink>
            {onCart && (
              <button type="button" onClick={onCart} aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`} className={`relative ${icon}`}>
                <IconBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-ndm-blue px-1 font-inter text-[10.5px] leading-none font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <Button href={ACTIONS.book} v="book" hot className="ml-1.5 hidden! sm:flex!">
              Book Free Consultation
            </Button>
            <a
              href={withBase(ACTIONS.book)}
              className="ml-1 inline-flex h-9 items-center rounded-full bg-ndm-amber px-4 font-inter text-[14px] font-medium text-white shadow-[0_10px_22px_-12px_rgba(255,166,23,.9)] transition-colors hover:bg-[#F29A0A] sm:hidden"
            >
              Book<span className="sr-only"> a free consultation</span>
            </a>
            <button type="button" onClick={onDrawer} aria-label="Open menu" className={`xl:hidden ${icon}`}>
              <IconMenu />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
