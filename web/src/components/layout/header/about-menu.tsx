"use client";

import type { StaticImageData } from "next/image";
import uptownPhoto from "@/assets/images/clinic/clinic-4.jpg";
import downtownPhoto from "@/assets/images/clinic/downtown-3.jpg";
import { PANEL_CLASS, type MenuPanelProps } from "@/components/layout/header/mega-menu";
import { IconArrow } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { MenuPhoto, menuEntryLink } from "@/components/layout/header/menu-items";
import { useSiteSettings } from "@/components/layout/site-settings";
import { CLINICS, HOURS, type Clinic } from "@/config/site";
import { pageLink, resolveLabel } from "@/lib/routes";
import type { ResolvedLink } from "@/types/navigation";

const CLINIC_PHOTO: Record<Clinic["id"], StaticImageData> = { uptown: uptownPhoto, downtown: downtownPhoto };

/* every About link opens the About page from the top, except the blog and the policies */
function aboutLink(label: string): ResolvedLink {
  if (label === "Blog") return pageLink("blog");
  if (/^Policies/.test(label)) return resolveLabel(label);
  return pageLink("about");
}

/** About: the links on the left, then the two clinics as photo cards with address and opening hours. */
export function AboutMenu({ open, onLink, eager }: MenuPanelProps) {
  const panel = useSiteSettings().menu.about;
  return (
    <div className={PANEL_CLASS} data-open={open}>
      <div className="grid grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)] gap-4 p-4 2xl:p-5">
        <ul className="self-start rounded-[18px] bg-ndm-mist/60 px-3 py-2" role="list">
          {panel.links.map((l) => (
            <li key={l.label}>
              <SiteLink to={menuEntryLink(l, aboutLink)} onClick={onLink} className="menu-item group py-3 font-mont last:border-0">
                <span className="min-w-0 whitespace-nowrap">{l.label}</span>
                <IconArrow size={12} className="menu-arrow" />
              </SiteLink>
            </li>
          ))}
        </ul>
        {CLINICS.map((c) => (
          <SiteLink
            key={c.id}
            to={pageLink("about")}
            onClick={onLink}
            className="about-loc group flex flex-col overflow-hidden rounded-[18px] bg-ndm-mist/70 ring-1 ring-ndm-ink/[.05] transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(27,36,43,.45)]"
          >
            <span className="relative block aspect-[16/10] overflow-hidden">
              <MenuPhoto src={panel.photos[c.id]} fallback={CLINIC_PHOTO[c.id]} eager={eager} sizes="(min-width: 1280px) 34vw, 420px" />
              <span className="absolute inset-0 bg-linear-to-t/srgb from-[#0B0F13]/75 via-[#0B0F13]/10 to-transparent" />
              <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 font-inter text-[11.5px] font-medium text-ndm-ink backdrop-blur-[6px]">{c.near}</span>
              <span className="absolute inset-x-4 bottom-3 font-aeonik text-[25px] leading-none text-white">{c.name} Clinic</span>
            </span>
            <span className="flex flex-1 flex-col gap-3 p-4">
              <span className="font-inter text-[13.5px] leading-[1.45] text-ndm-muted">{c.address}</span>
              <span className="grid gap-1 rounded-[12px] bg-white px-3 py-2.5">
                {HOURS.map(([days, hours]) => (
                  <span key={days} className="flex items-center justify-between gap-3 font-inter text-[13px]">
                    <span className="text-ndm-muted">{days}</span>
                    <span className="font-medium text-ndm-ink tabular-nums">{hours}</span>
                  </span>
                ))}
              </span>
              <span className="mt-auto flex items-center justify-between gap-3 font-inter text-[13.5px] font-semibold text-ndm-deep">
                <span className="tabular-nums">{c.phone}</span>
                <span className="inline-flex items-center gap-1.5">
                  {panel.cardLink}
                  <IconArrow className="transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </span>
          </SiteLink>
        ))}
      </div>
    </div>
  );
}
