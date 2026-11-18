import Link from "next/link";
import { HubCompare } from "@/components/procedures/hub-compare";
import { HubDirectory } from "@/components/procedures/hub-directory";
import { HubNav } from "@/components/procedures/hub-nav";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Faq } from "@/components/ui/faq";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { ABOUT_CLINICS } from "@/config/about";
import { HUB_FAQS, HUB_STEPS } from "@/config/procedures-hub";
import { ACTIONS } from "@/config/routes";
import { CLINICS, HOURS } from "@/config/site";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import type { HubView } from "@/lib/procedures-hub";
import { tel } from "@/lib/routes";

/** The four proof points the home page's header shows (WordPress home page, "Points beside the heading"). */
const PROOF: [label: string, icon: React.ReactNode][] = [
  ["Physician-led care", <path key="p" d="M4 2v3.5a3 3 0 006 0V2M7 8.5v1.8a3 3 0 006 0V9" />],
  ["Top Choice Award, 2019 to 2026", <path key="a" d="M5.6 9.1L4.5 14l3.5-1.8 3.5 1.8-1.1-4.9M8 2.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6z" />],
  ["Two Toronto clinics", <path key="c" d="M8 14.5s4.5-4.2 4.5-7.8A4.5 4.5 0 008 2.2a4.5 4.5 0 00-4.5 4.5c0 3.6 4.5 7.8 4.5 7.8z" />],
  ["Free VISIA® skin analysis", <path key="v" d="M8 1.5l1.4 4.1 4.1 1.4-4.1 1.4L8 12.5 6.6 8.4 2.5 7l4.1-1.4z" />],
];

const NAV: [id: string, label: string][] = [
  ["treatments", "Treatments"],
  ["concerns", "By concern"],
  ["compare", "Compare"],
  ["technology", "Technology"],
  ["your-visit", "Your visit"],
  ["clinics", "Clinics"],
  ["faq", "FAQ"],
];

const HERO_PHOTO = "/assets/home/hero/reception.jpg";
const VISIT_PHOTO = "/assets/home/hero/visia.jpg";

/**
 * /procedures, the treatments hub (user, 2026-11-18): the clinic's whole treatment menu as a place to find
 * the right page, not a replacement for those pages. Hero, section bar, the finder and directory, concerns,
 * comparisons, technology, the visit, trust, the two clinics, questions and a closing consultation card.
 */
export function HubPage({ view }: { view: HubView }) {
  const [uptown, downtown] = CLINICS;
  const maps = Object.fromEntries(ABOUT_CLINICS.map((c) => [c.id, c.map]));
  const concernCount = view.concerns.reduce((n, g) => n + g.items.length, 0);

  return (
    <main id="main" data-shell="inner" data-page="procedures" className="ph pt-[150px] xl:pt-[176px]">
      <Breadcrumb items={["Procedures"]} />

      {/* hero: the words on the left, the clinic on the right */}
      <section aria-labelledby="ph-title" className="ph-hero relative px-[var(--gx)] pt-[clamp(24px,3vw,44px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-[clamp(40px,5vw,88px)]">
          <div>
            <Eyebrow>Treatments</Eyebrow>
            <TwoTone
              as="h1"
              id="ph-title"
              className="mt-5 max-w-[15ch]"
              size="text-[clamp(40px,5vw,72px)]"
              lead={
                <>
                  Cosmetic &amp; laser treatments
                  <br />
                </>
              }
              strong="in Toronto"
            />
            <p className="mt-6 max-w-[54ch] font-inter text-[clamp(16px,1.15vw,18px)] leading-[1.6] text-ndm-ink/80">
              {view.count ? `${view.count} non-surgical treatments` : "Non-surgical treatments"} for the face, skin, body, hair and veins, at our Uptown clinic in North York and our Downtown clinic on Bay Street. Every plan starts with a free consultation, where a member of our medical team assesses your skin and goals and explains which options may suit you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={ACTIONS.book} v="book" hot>
                Book Free Consultation
              </Button>
              <Button href="#treatments" v="line">
                Explore treatments
              </Button>
            </div>
            <ul role="list" className="mt-9 grid max-w-[560px] grid-cols-2 gap-x-5 gap-y-3 font-inter text-[14px] text-ndm-ink/85">
              {PROOF.map(([label, d]) => (
                <li key={label} className="flex items-center gap-2.5">
                  <svg viewBox="0 0 16 16" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ndm-deep">
                    {d}
                  </svg>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="ph-hero-media relative">
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-[28px] bg-ndm-mist lg:aspect-[4/4.2]">
              {/* eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer, painted first */}
              <img
                src={optimized(HERO_PHOTO, 1080)}
                srcSet={optimizedSrcSet(HERO_PHOTO, [640, 828, 1080, 1200])}
                sizes="(min-width: 1024px) 46vw, 100vw"
                alt="The reception of the NewDermaMed clinic in Toronto"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="ph-glass absolute right-4 bottom-4 left-4 grid grid-cols-3 rounded-[20px] px-2 py-4 sm:right-auto sm:left-6 sm:w-[min(420px,calc(100%-48px))] lg:-left-10">
              {[
                [String(view.count || "50"), "Treatments"],
                [String(concernCount || "22"), "Concerns"],
                ["2", "Toronto clinics"],
              ].map(([n, l]) => (
                <p key={l} className="flex flex-col items-center border-r border-ndm-ink/10 text-center last:border-r-0">
                  <span className="font-aeonik text-[clamp(26px,2.4vw,34px)] leading-none tracking-[-0.03em] text-ndm-ink tabular-nums">{n}</span>
                  <span className="mt-1.5 font-inter text-[12px] text-ndm-muted">{l}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* the bar must be a direct child of <main> to stay sticky for the whole page */}
      <div aria-hidden="true" className="h-[clamp(40px,5vw,72px)]" />
      <HubNav items={NAV} />

      {!view.ok && <p className="px-[var(--gx)] pt-10 font-inter text-[15.5px] leading-[1.6] text-ndm-muted">The list of treatments is not available right now. Please try again in a moment, or call either clinic.</p>}
      {view.ok && <HubDirectory groups={view.groups} count={view.count} />}

      {/* by concern: every concern page, by where it shows */}
      {view.concerns.length > 0 && (
        <RevealSection id="concerns" aria-labelledby="ph-concerns" className="scroll-mt-[170px] px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-[clamp(40px,6vw,110px)]">
            <div>
              <Eyebrow className="rv">Start from a concern</Eyebrow>
              <TwoTone
                id="ph-concerns"
                className="rv mt-5"
                size="text-[clamp(32px,3.4vw,50px)]"
                lead={
                  <>
                    Not sure of the treatment?
                    <br />
                  </>
                }
                strong="Start with what you see"
                style={{ transitionDelay: ".06s" }}
              />
              <p className="rv mt-5 max-w-[42ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
                Each concern page explains common causes, how it is assessed and the treatments that may help, side by side.
              </p>
              <Link href="/concerns" className="rv group mt-6 inline-flex items-center gap-2 font-inter text-[15px] font-medium text-ndm-deep" style={{ transitionDelay: ".14s" }}>
                See all concerns
                <IconArrow size={13} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="rv grid gap-x-8 gap-y-8 sm:grid-cols-2" style={{ transitionDelay: ".1s" }}>
              {view.concerns.map((g) => (
                <div key={g.title}>
                  <h3 className="font-mont text-[12px] tracking-[.16em] text-ndm-muted uppercase">{g.title}</h3>
                  <ul role="list" className="mt-3 border-t border-ndm-ink/10">
                    {g.items.map((c) => (
                      <li key={c.path} className="border-b border-ndm-ink/10">
                        <Link href={c.path} className="group flex items-center justify-between gap-4 py-3.5 font-inter text-[16px] text-ndm-ink transition-colors hover:text-ndm-deep">
                          {c.title}
                          <IconArrow size={12} className="shrink-0 text-ndm-ink/35 transition-all group-hover:translate-x-1 group-hover:text-ndm-deep" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* compare */}
      {view.compare.length > 0 && (
        <RevealSection id="compare" aria-labelledby="ph-compare" className="scroll-mt-[170px] px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
          <Eyebrow className="rv">Compare</Eyebrow>
          <TwoTone
            id="ph-compare"
            className="rv mt-5"
            size="text-[clamp(32px,3.4vw,50px)]"
            lead={
              <>
                Similar goals,
                <br />
              </>
            }
            strong="different approaches"
            style={{ transitionDelay: ".06s" }}
          />
          <HubCompare compare={view.compare} />
        </RevealSection>
      )}

      {/* technology */}
      <RevealSection id="technology" aria-labelledby="ph-tech" className="scroll-mt-[170px] px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="rv">Technology</Eyebrow>
            <TwoTone
              id="ph-tech"
              className="rv mt-5"
              size="text-[clamp(32px,3.4vw,50px)]"
              lead={
                <>
                  The tools behind
                  <br />
                </>
              }
              strong="your treatment"
              style={{ transitionDelay: ".06s" }}
            />
          </div>
          <p className="rv max-w-[400px] font-inter text-[15px] leading-[1.6] text-ndm-muted md:mb-2" style={{ transitionDelay: ".1s" }}>
            A device is only as good as the plan around it. Your provider chooses the technology and settings for your skin type and goals.
          </p>
        </div>
        <ul role="list" className="rv mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ transitionDelay: ".12s" }}>
          {view.tech.map((t) => (
            <li key={t.name} className="flex flex-col rounded-[22px] bg-white p-6 ring-1 ring-ndm-ink/[.06]">
              <h3 className="font-aeonik text-[20px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{t.name}</h3>
              <p className="mt-2.5 font-inter text-[14px] leading-[1.55] text-ndm-muted">{t.what}</p>
              {t.links.length > 0 && (
                <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 font-inter text-[13.5px]">
                  {t.links.map((l) => (
                    <Link key={l.path} href={l.path} className="text-ndm-deep underline-offset-4 hover:underline">
                      {l.title}
                    </Link>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </RevealSection>

      {/* your visit */}
      <RevealSection id="your-visit" aria-labelledby="ph-visit" className="scroll-mt-[170px] px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-[clamp(40px,6vw,96px)]">
          <div className="lg:sticky lg:top-[190px] lg:self-start">
            <Eyebrow className="rv">Your visit</Eyebrow>
            <TwoTone
              id="ph-visit"
              className="rv mt-5"
              size="text-[clamp(32px,3.4vw,50px)]"
              lead={
                <>
                  What to expect
                  <br />
                </>
              }
              strong="at NewDermaMed"
              style={{ transitionDelay: ".06s" }}
            />
            <div className="rv relative mt-7 aspect-[4/3] overflow-hidden rounded-[24px] bg-ndm-mist" style={{ transitionDelay: ".1s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer */}
              <img
                src={optimized(VISIT_PHOTO, 828)}
                srcSet={optimizedSrcSet(VISIT_PHOTO, [640, 828, 1080])}
                sizes="(min-width: 1024px) 40vw, 100vw"
                alt="A VISIA skin analysis consultation at NewDermaMed"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
          <ol className="rv grid gap-3" style={{ transitionDelay: ".1s" }}>
            {HUB_STEPS.map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[44px_1fr] gap-4 rounded-[22px] bg-white p-5 ring-1 ring-ndm-ink/[.06] md:p-6">
                <span className="grid size-11 place-items-center rounded-full bg-ndm-paper font-aeonik text-[18px] text-ndm-deep tabular-nums ring-1 ring-ndm-ink/[.08]">{i + 1}</span>
                <span>
                  <span className="block font-aeonik text-[21px] leading-[1.2] tracking-[-0.02em] text-ndm-ink">{title}</span>
                  <span className="mt-1.5 block font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* trust: what the clinic can show */}
        <div className="rv mt-[clamp(40px,4vw,64px)] grid gap-3 md:grid-cols-3" style={{ transitionDelay: ".1s" }}>
          {[
            ["Real results", "Before and after photos of treatments at our clinics. Individual results may vary.", "/before-after", "See before & after"],
            ["Our medical team", "Meet the physicians and practitioners who assess and treat you.", "/about#team", "Meet the team"],
            ["Clear prices", "Current treatment prices and packages, before you book.", "/pricing", "See all prices"],
          ].map(([title, text, href, cta]) => (
            <Link key={href} href={href} className="ph-trust group flex flex-col rounded-[22px] p-6">
              <span className="font-aeonik text-[22px] tracking-[-0.02em] text-ndm-ink">{title}</span>
              <span className="mt-2 font-inter text-[14.5px] leading-[1.55] text-ndm-muted">{text}</span>
              <span className="mt-5 inline-flex items-center gap-2 font-inter text-[14px] font-medium text-ndm-deep">
                {cta}
                <IconArrow size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </RevealSection>

      {/* the two clinics */}
      <RevealSection id="clinics" aria-labelledby="ph-clinics" className="scroll-mt-[170px] px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
        <Eyebrow className="rv">Our clinics</Eyebrow>
        <TwoTone
          id="ph-clinics"
          className="rv mt-5"
          size="text-[clamp(32px,3.4vw,50px)]"
          lead={
            <>
              Two clinics,
              <br />
            </>
          }
          strong="North York and Downtown Toronto"
          style={{ transitionDelay: ".06s" }}
        />
        <div className="rv mt-8 grid gap-4 md:grid-cols-2" style={{ transitionDelay: ".1s" }}>
          {[uptown, downtown].map((c) => (
            <article key={c.id} className="ph-clinic flex flex-col rounded-[24px] bg-white p-[clamp(22px,2.4vw,32px)] ring-1 ring-ndm-ink/[.06]">
              <p className="font-mont text-[12px] tracking-[.16em] text-ndm-deep uppercase">{c.near}</p>
              <h3 className="mt-2 font-aeonik text-[clamp(26px,2.4vw,34px)] leading-[1.1] tracking-[-0.03em] text-ndm-ink">NewDermaMed {c.name}</h3>
              <address className="mt-4 font-inter text-[15.5px] leading-[1.6] text-ndm-ink/85 not-italic">{c.address}</address>
              <p className="mt-1 font-inter text-[14.5px] text-ndm-muted">{c.note}</p>
              <dl className="mt-5 grid gap-1.5 border-t border-ndm-ink/10 pt-4 font-inter text-[14px]">
                {HOURS.map(([d, h]) => (
                  <div key={d} className="flex justify-between gap-4">
                    <dt className="text-ndm-muted">{d}</dt>
                    <dd className="text-ndm-ink">{h}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4">
                  <dt className="text-ndm-muted">Sunday</dt>
                  <dd className="text-ndm-ink">Closed</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button href={tel(c.phone)} v="ink" sm>
                  {`Call ${c.phone}`}
                </Button>
                {maps[c.id] && (
                  <Button href={maps[c.id]} v="line" sm target="_blank" rel="noopener">
                    Directions
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="rv mt-4 font-inter text-[13.5px] text-ndm-muted" style={{ transitionDelay: ".12s" }}>
          Parking and getting there:{" "}
          <Link href="/about#clinics" className="text-ndm-deep underline-offset-4 hover:underline">
            see our clinics
          </Link>
          .
        </p>
      </RevealSection>

      <div id="faq" className="scroll-mt-[150px] pt-[clamp(40px,4vw,64px)]">
        <Faq items={HUB_FAQS} eyebrow="Questions" lead={
            <>
              Choosing a treatment,
              <br />
            </>
          }
          strong="answered plainly" intro="What people ask us most before their first consultation." />
      </div>

      {/* closing consultation card */}
      <section aria-labelledby="ph-book" className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)]">
        <div className="ph-book relative overflow-hidden rounded-[30px] px-[clamp(24px,4vw,64px)] py-[clamp(40px,5vw,72px)] text-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- the clinic at night, behind the right half on wide screens */}
          <img
            src={optimized("/assets/home/hero/exterior.jpg", 1080)}
            srcSet={optimizedSrcSet("/assets/home/hero/exterior.jpg", [828, 1080])}
            sizes="45vw"
            alt=""
            loading="lazy"
            className="ph-book-img absolute inset-y-0 right-0 hidden h-full w-[52%] object-cover lg:block"
          />
          <div className="relative max-w-[640px]">
            <Eyebrow dark>Free consultation</Eyebrow>
            <TwoTone
              id="ph-book"
              dark
              className="mt-5"
              size="text-[clamp(32px,3.6vw,52px)]"
              lead={
                <>
                  Not sure where to start?
                  <br />
                </>
              }
              strong="Let us help you choose"
            />
            <p className="mt-5 max-w-[50ch] font-inter text-[16px] leading-[1.6] text-white/80">
              Book a free, no-obligation consultation with a VISIA® skin analysis. You leave with a clear plan, the costs and the time it may take, then decide in your own time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={ACTIONS.book} v="book" hot>
                Book Free Consultation
              </Button>
              <Button href={tel(uptown.phone)} v="glass">
                Call Uptown
              </Button>
              <Button href={tel(downtown.phone)} v="glass">
                Call Downtown
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
