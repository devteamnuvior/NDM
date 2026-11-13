import Image from "next/image";
import clinicPhoto from "@/assets/images/clinic/clinic-4.jpg";
import { PANEL_CLASS, type MenuPanelProps } from "@/components/layout/header/mega-menu";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { SiteLink } from "@/components/ui/site-link";
import { CONCERNS } from "@/config/navigation";
import { ACTIONS } from "@/config/routes";
import { useMenuLink } from "@/components/layout/concern-paths";
import { withBase } from "@/lib/base-path";

/** Concerns: four groups of concerns, then the skin-analysis photo card. */
export function ConcernsMenu({ open, current, onLink, eager }: MenuPanelProps) {
  const menuLink = useMenuLink();
  return (
    <div className={PANEL_CLASS} data-open={open}>
      <div className="grid grid-cols-[1fr_340px] gap-4 p-4 2xl:p-5">
        <div className="px-5 py-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-ndm-line pb-4">
            <div>
              <p className="font-aeonik text-[26px] leading-tight">Concerns</p>
              <p className="mt-1 max-w-[52ch] text-[13.5px] text-ndm-muted">Start from what you notice in the mirror, we’ll match you with the options that suit your skin.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-6">
            {CONCERNS.map((g) => (
              <div key={g.title}>
                <p className="mb-2 font-mont text-[11px] tracking-[.14em] text-ndm-muted uppercase">{g.title}</p>
                <ul role="list">
                  {g.items.map((it) => (
                    <li key={it}>
                      <SiteLink to={menuLink(it)} current={current} onClick={onLink} className="menu-item group font-mont">
                        <span className="min-w-0">{it}</span>
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
          <Image src={withBase(clinicPhoto)} alt="" fill loading={eager ? "eager" : "lazy"} sizes="340px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-linear-to-t/srgb from-[#0B0F13]/85 via-[#0B0F13]/25 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-5">
            <span className="block font-mont text-[11px] tracking-[.14em] text-white/75 uppercase">Not sure what you need?</span>
            <span className="mt-2 block font-aeonik text-[22px] leading-[1.2]">Start with a VISIA® skin analysis</span>
            <Button as="span" v="book" onDark className="btn-g mt-4">
              Book Free Consultation
            </Button>
          </span>
        </a>
      </div>
    </div>
  );
}
