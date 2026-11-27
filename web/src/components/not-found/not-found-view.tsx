import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { CLINICS } from "@/config/site";
import { withBase } from "@/lib/base-path";
import { tel } from "@/lib/routes";

/** Where a visitor most often wants to go next, as a short numbered list. */
const WAYS: { title: string; text: string; href: string }[] = [
  { title: "Treatments", text: "Every treatment, by area and concern", href: "/procedures" },
  { title: "Prices and offers", text: "The full price list and current offers", href: "/pricing" },
  { title: "Before & after", text: "Treatment cases, photographed in clinic", href: "/before-after" },
  { title: "Our clinics", text: "Uptown and Downtown Toronto", href: "/about#clinics" },
];

/**
 * The page shown for an address the site does not have (user, 2026-11-25: calm and premium, nothing playful). A large
 * hairline "404" in the heading font, the two-tone heading, two ways back (home, a free consultation), a short numbered
 * list of the pages people look for, both clinics' phone numbers, and a quiet photo of a treatment room beside it.
 */
export function NotFoundView() {
  return (
    <main data-page="not-found" className="nf relative">
      <Breadcrumb items={["Page not found"]} />
      <RevealSection aria-labelledby="nf-title" className="nf-hero relative z-10 bg-ndm-paper px-[var(--gx)]">
        <div className="nf-wrap mx-auto grid w-full max-w-[1180px] items-center gap-[clamp(40px,5vw,80px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
          <div className="nf-copy">
            <p className="nf-code rv" aria-hidden="true">
              404
            </p>
            <Eyebrow className="rv">Page not found</Eyebrow>
            <TwoTone
              as="h1"
              id="nf-title"
              className="rv mt-5"
              size="text-[clamp(38px,4.4vw,64px)]"
              lead={
                <>
                  This page is
                  <br />
                </>
              }
              strong="no longer here"
              style={{ transitionDelay: ".06s" }}
            />
            <p className="rv mt-5 max-w-[46ch] font-inter text-[16px] leading-[1.65] text-ndm-muted" style={{ transitionDelay: ".1s" }}>
              The address may have changed, or the page may have moved. Everything you came for is still close at hand.
            </p>
            <div className="rv mt-8 flex flex-wrap gap-3" style={{ transitionDelay: ".14s" }}>
              <Button href="/" v="line">
                Back to home
              </Button>
              <Button href={ACTIONS.book} v="book">
                Book Free Consultation
              </Button>
            </div>
            <nav aria-label="Popular pages" className="nf-ways rv" style={{ transitionDelay: ".18s" }}>
              <ul role="list">
                {WAYS.map((w, i) => (
                  <li key={w.href}>
                    <a href={withBase(w.href)} className="nf-way group">
                      <span className="nf-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="nf-way-words">
                        <span className="nf-way-title">{w.title}</span>
                        <span className="nf-way-text">{w.text}</span>
                      </span>
                      <span className="nf-way-arrow" aria-hidden="true">
                        <IconArrow size={14} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="nf-help rv" style={{ transitionDelay: ".22s" }}>
              Prefer to talk?{" "}
              {CLINICS.map((c, i) => (
                <span key={c.name}>
                  {i > 0 && <span aria-hidden="true"> · </span>}
                  {c.name}{" "}
                  <a href={tel(c.phone)} className="nf-tel">
                    {c.phone}
                  </a>
                </span>
              ))}
            </p>
          </div>
          <figure className="nf-photo rv" style={{ transitionDelay: ".1s" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a plain photo of the site's own, as on the other headers */}
            <img src={withBase("/assets/hero/treatment-room.jpg")} alt="A treatment room at NewDermaMed, Toronto" loading="lazy" className="nf-img" />
            <figcaption className="nf-cap">
              <span className="nf-cap-dot" aria-hidden="true" />
              Free consultation and VISIA® skin analysis at both clinics
            </figcaption>
          </figure>
        </div>
      </RevealSection>
    </main>
  );
}
