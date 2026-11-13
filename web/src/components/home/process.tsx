import Image, { type StaticImageData } from "next/image";
import mirrorCheck from "@/assets/images/home/mirror-check.jpg";
import visiaConsult from "@/assets/images/home/visia-consult.jpg";
import visiaScreen from "@/assets/images/home/visia-screen.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { HOME_COPY, PROCESS_LINKS } from "@/config/home";
import type { HomeCopy } from "@/types/home";

const PHOTOS: StaticImageData[] = [visiaConsult, visiaScreen, mirrorCheck];

/** How it works: the three steps, each a white card with its photo, text and button. */
export function Process({ copy = HOME_COPY.process }: { copy?: HomeCopy["process"] }) {
  /* three steps: each has its photo and its link by position */
  const steps = copy.steps.slice(0, PROCESS_LINKS.length).map((s, i) => ({ ...s, ...PROCESS_LINKS[i] }));
  return (
    <RevealSection aria-labelledby="process" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(16px,2vw,32px)] pb-[clamp(72px,9vw,120px)]">
      <Eyebrow className="rv">{copy.tag}</Eyebrow>
      <TwoTone id="process" className="rv mt-5 max-w-[14ch]" lead={copy.lead} strong={copy.strong} style={{ transitionDelay: ".06s" }} />
      <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-5" role="list">
        {steps.map((s, i) => (
          <li key={i} className="rv proc-card flex flex-col rounded-[22px] bg-white p-3 ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.08 * i}s` }}>
            <div className="aspect-[4/3.2]">
              <a href={s.href} aria-label={s.title} className="group relative block h-full w-full overflow-hidden rounded-[22px] bg-ndm-mist shadow-[0_18px_36px_-24px_rgba(11,15,19,.22)]">
                <Image src={PHOTOS[i]} alt={s.photoAlt} fill sizes="(min-width: 768px) 34vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" style={{ transitionTimingFunction: "var(--e-out)" }} />
              </a>
            </div>
            <div className="px-2 pt-5">
              <a href={s.href} className="group block">
                <span className="block font-inter text-[13px] tracking-[.14em] text-ndm-deep uppercase">
                  Step 0{i + 1} <span className="text-ndm-muted">/ 0{steps.length}</span>
                </span>
                {/* a non-breaking hyphen keeps "follow-up" on one line */}
                <h3 className="mt-3 font-aeonik text-[clamp(24px,2.1vw,31px)] leading-[1.08] font-normal tracking-[-0.03em] text-ndm-ink transition-colors [hyphens:manual] group-hover:text-ndm-deep">{s.title.replace("follow-up", "follow‑up")}</h3>
                <p className="mt-3 max-w-[42ch] font-inter text-[16.5px] leading-[1.6] text-ndm-muted">{s.text}</p>
              </a>
            </div>
            <div className="mt-auto px-2 pt-5 pb-2">
              <Button href={s.href} v={s.buttonStyle}>
                {s.button}
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </RevealSection>
  );
}
