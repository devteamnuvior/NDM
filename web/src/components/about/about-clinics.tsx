import { Fragment } from "react";
import { ClinicMap } from "@/components/about/clinic-map";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconPin } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { ABOUT_CLINICS, ABOUT_EMAIL, type AboutClinic } from "@/config/about";
import { ACTIONS } from "@/config/routes";
import { HOURS } from "@/config/site";
import { tel } from "@/lib/routes";
import type { AboutCopy } from "@/types/about";

const LABEL = "font-inter text-[11px] uppercase tracking-[.14em] text-ndm-muted";
const LINK = "underline-offset-4 transition-colors hover:text-ndm-deep hover:underline";
const shortDay = (d: string) => d.replace(" – ", " to ").replace("Monday", "Mon").replace("Friday", "Fri").replace("Saturday", "Sat");

function ClinicCard({ c, i }: { c: AboutClinic; i: number }) {
  const headingId = `clinic-${c.id}`;
  const number = tel(c.phone).replace("tel:", "");
  return (
    <article id={c.id} aria-labelledby={headingId} className="rv flex scroll-mt-[100px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_60px_-46px_rgba(15,60,95,.45)] ring-1 ring-ndm-ink/[.06]" style={{ transitionDelay: `${0.08 * i}s` }}>
      <div className="relative">
        <ClinicMap clinic={c} height="h-[clamp(250px,22vw,310px)]" />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-start justify-between gap-3">
          <span className="rounded-[16px] bg-white/95 px-4 py-2.5 shadow-[0_14px_30px_-18px_rgba(11,15,19,.5)] backdrop-blur-[8px]">
            <span className="flex items-center gap-1.5 font-inter text-[11.5px] font-medium text-ndm-deep">
              <IconPin size={12} />
              {c.area}
            </span>
            <h3 id={headingId} className="mt-0.5 font-aeonik text-[clamp(22px,1.9vw,27px)] leading-[1.1] font-normal tracking-[-0.02em] text-ndm-ink">
              {c.title[0]} <span className="tt-strong text-ndm-deep">{c.title[1]}</span>
            </h3>
          </span>
        </div>
      </div>
      <div className="grid gap-x-5 gap-y-4 px-5 pt-5 sm:grid-cols-[1.15fr_1fr_1fr]">
        <div>
          <p className={LABEL}>Address</p>
          <p className="mt-1.5 font-inter text-[14px] leading-[1.45] text-ndm-ink">
            <a href={c.map} target="_blank" rel="noopener" className={LINK}>
              {c.address[0]}
              <br />
              {c.address[1]}
              <span className="sr-only"> (opens Google Maps)</span>
            </a>
          </p>
        </div>
        <div>
          <p className={LABEL}>Contact</p>
          <p className="mt-1.5 font-inter text-[14px] leading-[1.45] text-ndm-ink">
            <a href={tel(c.phone)} className={LINK}>
              {c.phone}
            </a>{" "}
            ·{" "}
            <a href={`sms:${number}`} className={`${LINK} text-ndm-muted`}>
              Text
            </a>
            <br />
            <a href={`mailto:${ABOUT_EMAIL}`} className={`${LINK} break-all`}>
              {ABOUT_EMAIL}
            </a>
          </p>
        </div>
        <div>
          <p className={LABEL}>Hours</p>
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 font-inter text-[14px] leading-[1.45]">
            {HOURS.map(([days, hours]) => (
              <Fragment key={days}>
                <dt className="text-ndm-muted">{shortDay(days)}</dt>
                <dd className="text-ndm-ink">{hours.replace(" – ", " to ")}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2.5 px-5 pt-5 pb-5">
        <Button href={ACTIONS.book} v="book" hot sm>
          Book Free Consultation
        </Button>
        <Button href={c.map} target="_blank" rel="noopener" v="line" sm>
          Get directions<span className="sr-only"> to the {c.name} clinic (opens in a new tab)</span>
        </Button>
      </div>
    </article>
  );
}

/** Our clinics: the two clinics side by side (stacked on phones), each a white card with its map and details. */
export function AboutClinics({ copy }: { copy: AboutCopy["clinics"] }) {
  return (
    <RevealSection id="clinics" aria-labelledby="clinics-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,96px)]">
      <Eyebrow className="rv">{copy.tag}</Eyebrow>
      <TwoTone
        id="clinics-title"
        className="rv mt-4"
        lead={
          <>
            {copy.lead}
            <br />
          </>
        }
        strong={copy.strong}
        style={{ transitionDelay: ".05s" }}
      />
      <div className="mt-[clamp(28px,3.4vw,48px)] grid gap-5 lg:grid-cols-2 lg:gap-6">
        {ABOUT_CLINICS.map((c, i) => (
          <ClinicCard key={c.id} c={c} i={i} />
        ))}
      </div>
    </RevealSection>
  );
}
