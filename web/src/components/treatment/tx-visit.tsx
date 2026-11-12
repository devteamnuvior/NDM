import Image, { type StaticImageData } from "next/image";
import downtown from "@/assets/images/clinic/clinic-1.jpg";
import uptown from "@/assets/images/clinic/clinic-4.jpg";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { SiteLink } from "@/components/ui/site-link";
import { CLINICS, type Clinic } from "@/config/site";
import { pageLink, pagePath } from "@/lib/routes";

const PHOTOS: Record<Clinic["id"], StaticImageData> = { uptown, downtown };
const OPEN = "Monday to Friday 9am to 7pm, Saturday 10am to 5pm";

/** Visit us: the two clinics as photo cards with the address, phone and hours; a card opens the About page's contact part. */
export function TxVisit({ number }: { number: string }) {
  const contact = { ...pageLink("about"), href: `${pagePath("about")}#contact` };
  return (
    <RevealSection id="visit" aria-labelledby="visit-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <TxHead number={number} tag="Visit us" headingId="visit-title" lead="Two clinics," strong="Uptown and Downtown" text="Both clinics offer the same free consultation and VISIA® skin analysis. Choose the one that suits you." />
      <ul className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 md:grid-cols-2 md:gap-6`} role="list">
        {CLINICS.map((c, i) => {
          const [street, ...rest] = c.address.split(",");
          return (
            <li key={c.id} className="rv" style={{ transitionDelay: `${0.08 * i}s` }}>
              <SiteLink to={contact} className="tx-visit group block overflow-hidden rounded-[26px] bg-white ring-1 ring-ndm-ink/[.06] transition-shadow hover:shadow-[0_34px_60px_-34px_rgba(15,128,195,.45)]">
                <span className="relative block aspect-[16/10] overflow-hidden bg-ndm-mist">
                  <Image src={PHOTOS[c.id]} alt={`NewDermaMed ${c.name} clinic`} sizes="(min-width: 768px) 580px, 100vw" className="tx-visit-pic absolute inset-0 h-full w-full object-cover" />
                  <span className="tx-pill absolute top-4 left-4 rounded-full px-3.5 py-1.5 font-inter text-[12.5px] font-semibold text-ndm-ink">{c.name}</span>
                </span>
                <span className="flex items-start justify-between gap-4 p-5 md:p-6">
                  <span className="min-w-0">
                    <span className="block font-aeonik text-[clamp(22px,2vw,28px)] leading-[1.15] tracking-[-0.02em] text-ndm-ink">{street}</span>
                    <span className="mt-1 block font-inter text-[14px] leading-[1.5] text-ndm-muted">{rest.join(",").trim()}</span>
                    <span className="mt-3 block font-inter text-[14px] font-semibold text-ndm-ink">{c.phone}</span>
                    <span className="mt-1 block font-inter text-[13px] leading-[1.5] text-ndm-muted">{OPEN}</span>
                  </span>
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-ndm-deep text-white transition-transform duration-500 group-hover:-rotate-45">
                    <IconArrow />
                  </span>
                </span>
              </SiteLink>
            </li>
          );
        })}
      </ul>
    </RevealSection>
  );
}
