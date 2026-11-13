import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";
import uptown2 from "@/assets/images/clinic/clinic-1.jpg";
import uptown3 from "@/assets/images/clinic/clinic-2.jpg";
import uptown1 from "@/assets/images/clinic/clinic-4.jpg";
import downtown4 from "@/assets/images/clinic/downtown-1.jpg";
import downtown3 from "@/assets/images/clinic/downtown-2.jpg";
import downtown1 from "@/assets/images/clinic/downtown-3.jpg";
import downtown2 from "@/assets/images/clinic/downtown-4.jpg";
import uptown4 from "@/assets/images/hero/clinic-reception.jpg";
import { VisitSlides } from "@/components/home/visit-slides";
import { Button } from "@/components/ui/button";
import { IconPhone, IconPin } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SectionHead } from "@/components/ui/section-head";
import { ACTIONS } from "@/config/routes";
import { CLINICS, HOURS, type Clinic } from "@/config/site";
import { tel } from "@/lib/routes";
import type { HomeCopy } from "@/types/home";

const PHOTOS: Record<Clinic["id"], StaticImageData[]> = {
  uptown: [uptown1, uptown2, uptown3, uptown4],
  downtown: [downtown1, downtown2, downtown3, downtown4],
};

function Chip({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
      {children}
    </span>
  );
}

function VisitCard({ c, i }: { c: Clinic; i: number }) {
  const hid = `visit-${c.id}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`NewDermaMed ${c.address}`)}`;
  return (
    <div className="rv visit-cell flex" style={{ transitionDelay: `${0.08 * i}s` }}>
      <article aria-labelledby={hid} className="visit-card flex min-w-0 flex-1 flex-col rounded-[24px] border border-ndm-ink/[.08] bg-white p-2.5 sm:rounded-[28px] sm:p-3">
        <div className="rv rv-clip relative isolate aspect-[16/9] overflow-hidden rounded-[20px] bg-ndm-mist md:aspect-[5/2] lg:aspect-[12/5]" style={{ transitionDelay: `${0.12 + 0.08 * i}s` }}>
          <VisitSlides images={PHOTOS[c.id]} alt={`NewDermaMed ${c.name} clinic`} index={i} />
          <span aria-hidden="true" className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 py-1.5 pr-3 pl-2.5 font-inter text-[12px] text-ndm-ink shadow-[0_8px_20px_-10px_rgba(11,15,19,.45)] backdrop-blur-[8px]">
            <IconPin size={13} className="text-ndm-deep" />
            {c.name} clinic
          </span>
        </div>

        <div className="flex flex-1 flex-col px-2.5 pt-5 pb-2.5 sm:p-5 sm:pt-7">
          <h3 id={hid} className="font-aeonik text-[26px] leading-[1.1] font-normal tracking-[-0.02em] text-ndm-ink sm:text-[30px] md:text-[34px]">
            {c.name}
          </h3>

          <div className="mt-4 grid gap-5 sm:mt-5 sm:grid-cols-[1.2fr_1fr] sm:gap-6 sm:gap-x-8 lg:grid-cols-1 xl:grid-cols-[1.2fr_1fr]">
            <div>
              <address className="grid gap-3 font-inter text-[14px] leading-[1.55] text-ndm-ink not-italic">
                <span className="flex items-start gap-3">
                  <Chip>
                    <IconPin size={15} />
                  </Chip>
                  <span className="pt-[5px]">{c.address}</span>
                </span>
                <a href={tel(c.phone)} aria-label={`Call the ${c.name} clinic at ${c.phone}`} className="flex items-center gap-3 justify-self-start transition-colors hover:text-ndm-deep">
                  <Chip>
                    <IconPhone />
                  </Chip>
                  {c.phone}
                </a>
              </address>
              <p className="mt-3 pl-11 font-inter text-[12.5px] leading-[1.55] text-ndm-muted">{c.directions}</p>
            </div>

            <div>
              <p className="font-mont text-[11.5px] tracking-[.14em] text-ndm-muted uppercase">Hours</p>
              <dl className="mt-2 border-t border-ndm-ink/10 font-inter text-[13.5px]">
                {HOURS.map(([days, hours]) => (
                  <div key={days} className="flex justify-between gap-4 border-b border-ndm-ink/10 py-2 sm:py-2.5">
                    <dt className="text-ndm-muted">{days}</dt>
                    <dd className="whitespace-nowrap text-ndm-ink">{hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* phones: Book and a round directions button side by side; wider screens: two pills */}
          <div className="mt-auto flex items-center gap-2 pt-5 sm:flex-wrap sm:pt-7">
            <Button href={ACTIONS.book} v="book" aria-describedby={hid} className="min-w-0 flex-1 sm:flex-none">
              Book Free Consultation
            </Button>
            <a
              href={maps}
              target="_blank"
              rel="noopener"
              aria-label={`Get directions to the ${c.name} clinic (opens in a new tab)`}
              className="grid size-12 shrink-0 place-items-center rounded-full border border-ndm-ink/20 text-ndm-ink transition-colors hover:border-ndm-ink hover:bg-ndm-ink hover:text-white min-[520px]:hidden"
            >
              <IconPin size={18} />
            </a>
            <Button href={maps} target="_blank" rel="noopener" v="line" className="hidden! min-[520px]:inline-flex!">
              Get directions<span className="sr-only"> to the {c.name} clinic (opens in a new tab)</span>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}

/** Visit us: the two Toronto clinics, each a card with its photos, address, hours and directions. */
export function VisitUs({ copy }: { copy: HomeCopy["visit"] }) {
  return (
    <RevealSection aria-labelledby="visit" className="relative z-10 bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <SectionHead
        id="visit"
        eyebrow={copy.tag}
        lead={
          <>
            {copy.lead}
            <br />
          </>
        }
        strong={copy.strong}
        intro={copy.text}
      />
      <div className="mt-10 grid gap-4 md:mt-14 lg:grid-cols-2">
        {CLINICS.map((c, i) => (
          <VisitCard key={c.id} c={c} i={i} />
        ))}
      </div>
    </RevealSection>
  );
}
