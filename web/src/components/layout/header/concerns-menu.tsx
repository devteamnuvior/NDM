"use client";

import clinicPhoto from "@/assets/images/clinic/clinic-4.jpg";
import { PANEL_CLASS, type MenuPanelProps } from "@/components/layout/header/mega-menu";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { useMenuLink } from "@/components/layout/concern-paths";
import { MenuPhoto, menuEntryLink } from "@/components/layout/header/menu-items";
import { useSiteSettings } from "@/components/layout/site-settings";
import { withBase } from "@/lib/base-path";

/** Concerns: four groups of concerns, then the skin-analysis photo card. */
export function ConcernsMenu({ open, current, onLink, eager }: MenuPanelProps) {
  const menuLink = useMenuLink();
  const { menu, header } = useSiteSettings();
  const panel = menu.concerns;
  return (
    <div className={PANEL_CLASS} data-open={open}>
      <div className="grid grid-cols-[1fr_340px] gap-4 p-4 2xl:p-5">
        <div className="px-5 py-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-ndm-line pb-4">
            <div>
              <p className="font-aeonik text-[26px] leading-tight">{panel.title}</p>
              {panel.text && <p className="mt-1 max-w-[52ch] text-[13.5px] text-ndm-muted">{panel.text}</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-6">
            {panel.groups.map((g, gi) => (
              <div key={`${gi}-${g.title}`}>
                {g.title && <p className="mb-2 font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">{g.title}</p>}
                <ul role="list">
                  {g.items.map((it) => (
                    <li key={it.label}>
                      <SiteLink to={menuEntryLink(it, menuLink)} current={current} onClick={onLink} className="menu-item group font-mont">
                        <span className="min-w-0">{it.label}</span>
                        <IconArrow size={11} className="menu-arrow" />
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <a href={withBase(ACTIONS.book)} onClick={onLink} className="group relative min-h-[360px] overflow-hidden rounded-[16px] text-white">
          <MenuPhoto src={panel.card.photo} fallback={clinicPhoto} eager={eager} sizes="340px" />
          <span className="absolute inset-0 bg-linear-to-t/srgb from-[#0B0F13]/85 via-[#0B0F13]/25 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-5">
            <span className="block font-mont text-[11px] tracking-[.14em] text-white/75 uppercase">{panel.card.tag}</span>
            <span className="mt-2 block font-aeonik text-[22px] leading-[1.2]">{panel.card.title}</span>
            <Button as="span" v="book" onDark className="btn-g mt-4">
              {header.bookLabel}
            </Button>
          </span>
        </a>
      </div>
    </div>
  );
}
