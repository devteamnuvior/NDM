import type { ComponentType } from "react";
import { SocialPhone } from "@/components/home/social-phone";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconFacebook, IconInstagram, IconLinkedIn, IconX, IconYouTube } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { HOME_COPY } from "@/config/home";
import { SOCIAL, type SocialNetwork } from "@/config/social";
import type { HomeCopy } from "@/types/home";
import { withBase } from "@/lib/base-path";

export const SOCIAL_ICONS: [network: SocialNetwork, Icon: ComponentType, name: string][] = [
  ["instagram", IconInstagram, "Instagram"],
  ["facebook", IconFacebook, "Facebook"],
  ["youtube", IconYouTube, "YouTube"],
  ["x", IconX, "X"],
  ["linkedin", IconLinkedIn, "LinkedIn"],
];

/** @newdermamed: the invitation to follow along, beside a phone playing the clinic's reels. */
export function Social({ copy = HOME_COPY.social }: { copy?: HomeCopy["social"] }) {
  return (
    <RevealSection aria-labelledby="social" className="relative z-10 overflow-hidden bg-ndm-paper px-[var(--gx)] pt-[clamp(40px,4.5vw,72px)]">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="pb-[clamp(8px,4vw,96px)]">
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="social"
            className="rv mt-5"
            lead={
              <>
                {copy.lead}
                <br className="hidden sm:block" />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".06s" }}
          />
          <p className="rv mt-5 max-w-[44ch] font-inter text-[16px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
            {copy.text}
          </p>
          <div className="rv mt-8 flex flex-wrap items-center gap-4" style={{ transitionDelay: ".14s" }}>
            <Button href={SOCIAL.instagram} target="_blank" rel="noopener" v="ink">
              {copy.button}
            </Button>
            <ul className="flex gap-2" role="list">
              {SOCIAL_ICONS.map(([net, Icon, name]) => (
                <li key={net}>
                  <a href={withBase(SOCIAL[net])} target="_blank" rel="noopener" aria-label={`NewDermaMed on ${name}`} data-net={net} className="soc-ico soc-ico-line grid size-11 place-items-center rounded-full border border-ndm-ink/15 text-ndm-ink">
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="rv mt-6 font-inter text-[12px] text-ndm-muted" style={{ transitionDelay: ".18s" }}>
            {copy.note}
          </p>
        </div>
        <div className="rv -mb-[clamp(24px,5vw,90px)]" style={{ transitionDelay: ".12s" }}>
          <SocialPhone />
        </div>
      </div>
    </RevealSection>
  );
}
