import { IconInfoSmall } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { TxPhoto } from "@/components/treatment/tx-photo";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { contentLink, pageLink, pagePath } from "@/lib/routes";
import type { ConcernOption, ConcernPage } from "@/types/concern";

const slugOf = (role: string) => role.toLowerCase();

function OptionCard({ o, i }: { o: ConcernOption; i: number }) {
  const page = contentLink(o.href);
  return (
    <li className="rv" style={{ transitionDelay: `${0.05 * (i % 6)}s` }}>
      <article className="cn-card group flex h-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-ndm-ink/[.06]">
        <SiteLink to={page} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/9] overflow-hidden bg-ndm-mist">
          <TxPhoto src={o.img} alt="" sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]" style={{ objectPosition: "50% 30%" }} />
          <span className={`cn-ptag cn-ptag-${slugOf(o.role)} absolute top-3 left-3`}>
            <i aria-hidden="true" />
            {o.role}
          </span>
        </SiteLink>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-inter text-[13px] text-ndm-muted">{o.price}</span>
          </div>
          <h3 className="mt-4 font-aeonik text-[clamp(21px,1.8vw,25px)] leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink">{o.name}</h3>
          <p className="mt-2 font-inter text-[15px] leading-[1.5] font-medium text-ndm-deep">{o.fit}</p>
          <p className="mt-2 flex-1 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/75">{o.line}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ndm-line pt-4">
            <SiteLink to={page} className="group inline-flex items-center gap-1.5 font-inter text-[14px] font-semibold text-ndm-deep">
              About this treatment
              <IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" />
            </SiteLink>
            {o.priceHref && o.priceHref !== o.href && (
              <SiteLink to={contentLink(o.priceHref)} className="font-inter text-[14px] text-ndm-muted underline-offset-4 hover:underline">
                See prices
              </SiteLink>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

interface CnOptionsProps {
  short: string;
  options: ConcernOption[];
  bio: ConcernOption[];
  rx: ConcernPage["rx"];
  number: string;
}

/** Options: one card per treatment, the bio-stimulator group, and the note about prescription treatments. */
export function CnOptions({ short, options, bio, rx, number }: CnOptionsProps) {
  const count = options.length + bio.length;
  return (
    <RevealSection id="options" aria-labelledby="options-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead
        number={number}
        tag="Treatment options"
        headingId="options-title"
        lead="Treatments that"
        strong="may help"
        text={`${count} options we offer for ${short.toLowerCase()}, with the role each one usually plays. Your provider recommends one or a combination at your free consultation.`}
      />
      <ul role="list" className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {options.map((o, i) => (
          <OptionCard key={o.key} o={o} i={i} />
        ))}
      </ul>
      {bio.length > 0 && (
        <div className={`${TX_WRAP} cn-bio relative mt-6 overflow-hidden rounded-[26px] p-6 text-ndm-ink md:p-8`}>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-ndm-deep/20 bg-white px-3.5 py-1.5 font-inter text-[13px] font-medium text-ndm-deep">Bio-stimulators</p>
              <h3 className="mt-4 font-aeonik text-[clamp(26px,2.6vw,38px)] leading-[1.1] font-normal tracking-[-0.025em]">
                Collagen support
                <br />
                <span className="tt-strong text-ndm-deep">that builds over time</span>
              </h3>
              <p className="mt-3 max-w-[58ch] font-inter text-[15.5px] leading-[1.65] text-ndm-ink/80">
                Aptos threads, Sculptra® and Radiesse® all prompt your own collagen, so the change develops over months and tends to last longer. The Aptos Thread Lift gives a lift right away and is also a long-lasting bio-stimulator.
              </p>
            </div>
            <SiteLink to={{ ...pageLink("pricing"), href: `${pagePath("pricing")}#pg-skin-booster-and-bio-stimulators-h` }} className="group inline-flex items-center gap-2 font-inter text-[14px] font-semibold text-ndm-deep">
              Bio-stimulator prices
              <IconArrow size={12} className="transition-transform group-hover:translate-x-0.5" />
            </SiteLink>
          </div>
          <ul role="list" className="mt-6 grid gap-4 md:grid-cols-3">
            {bio.map((o, i) => (
              <OptionCard key={o.key} o={o} i={i} />
            ))}
          </ul>
        </div>
      )}
      <div className={`${TX_WRAP} cn-rx rv mt-6 flex flex-col gap-4 rounded-[22px] p-5 md:flex-row md:items-center md:justify-between md:p-6`}>
        <p className="flex items-start gap-3 font-inter text-[15px] leading-[1.6] text-ndm-ink/85">
          <span aria-hidden="true" className="mt-[2px] grid size-6 shrink-0 place-items-center rounded-full bg-[#FFE7C2] text-[#8A5A12]">
            <IconInfoSmall size={13} />
          </span>
          <span>{rx.text}</span>
        </p>
        <ul className="flex shrink-0 flex-wrap gap-2" role="list">
          {rx.links.map((l) => (
            <li key={l.href}>
              <SiteLink to={contentLink(l.href)} className="inline-flex rounded-full bg-white px-3.5 py-2 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/10 hover:ring-ndm-deep">
                {l.name}
              </SiteLink>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${TX_WRAP} mt-8 flex flex-wrap justify-center gap-3`}>
        <Button href={ACTIONS.book} v="book">
          Book Free Consultation
        </Button>
        <SiteLink to={{ ...pageLink("pricing"), href: `${pagePath("pricing")}#prices` }} className="btn btn-line">
          <span>All treatment prices</span>
        </SiteLink>
      </div>
    </RevealSection>
  );
}
