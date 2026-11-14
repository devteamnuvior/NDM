import { TX_WRAP, TxTag } from "@/components/treatment/tx-head";
import { Button } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { SHOP_URL } from "@/config/shop";
import type { ConcernPage } from "@/types/concern";
import { withBase } from "@/lib/base-path";

const TINTS = ["cn-hc-blue", "cn-hc-peach", "cn-hc-mist"];
/** Product photos, served by the shop as in the prototype. */
const SHOP_PHOTOS = "https://shop.newdermamedlaserclinic.com/wp-content/uploads/2026/06/";

/** Home care: one card per need, with the matching product from the shop on a soft colour field. */
export function CnHome({ home, number }: { home: ConcernPage["home"]; number: string }) {
  return (
    <RevealSection id="home-care" aria-labelledby="home-title" className="cn-hc relative z-10 scroll-mt-[170px] overflow-hidden px-[var(--gx)] py-[clamp(64px,7vw,104px)]">
      <div className={`${TX_WRAP} grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)] lg:items-end`}>
        <div>
          <TxTag number={number}>Home care</TxTag>
          <TwoTone
            id="home-title"
            className="rv mt-5"
            size="text-[clamp(32px,3.4vw,50px)]"
            lead={
              <>
                Your skin,
                <br />
              </>
            }
            strong="between treatments"
            style={{ transitionDelay: ".06s" }}
          />
        </div>
        <div className="rv lg:pb-1" style={{ transitionDelay: ".1s" }}>
          <p className="max-w-[46ch] font-inter text-[15.5px] leading-[1.65] text-ndm-muted">Medical-grade skincare from our shop supports your treatment at home. Your provider suggests a routine for your skin at your consultation.</p>
          <div className="mt-5">
            <Button href={SHOP_URL} target="_blank" rel="noopener" v="line" sm>
              Visit the skincare shop<span className="sr-only"> (opens in a new tab)</span>
            </Button>
          </div>
        </div>
      </div>
      <ul role="list" className={`${TX_WRAP} mt-[clamp(32px,4vw,52px)] grid gap-4 md:grid-cols-3`}>
        {home.map((h, i) => (
          <li key={h.title} className="rv" style={{ transitionDelay: `${0.06 * i}s` }}>
            <article className="cn-hc-card group flex h-full flex-col overflow-hidden rounded-[26px] bg-white ring-1 ring-ndm-ink/[.06]">
              <div className={`cn-hc-field ${TINTS[i % 3]} relative grid aspect-[5/4] place-items-center overflow-hidden`}>
                <span aria-hidden="true" className="cn-hc-orb" />
                {h.product ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- product photo served by the shop */
                  <img src={withBase(/^https?:/.test(h.product.img) ? h.product.img : SHOP_PHOTOS + h.product.img)} alt={`${h.product.name}, ${h.product.size}`} loading="lazy" decoding="async" className="cn-hc-img relative h-[78%] w-auto object-contain" />
                ) : (
                  <span aria-hidden="true" className="cn-hc-sun relative grid size-[44%] place-items-center rounded-full">
                    <svg viewBox="0 0 24 24" className="size-[46%]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="4.2" />
                      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
                    </svg>
                  </span>
                )}
                <span className="absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1.5 font-inter text-[12px] font-medium text-ndm-ink backdrop-blur-[8px]">
                  {String(i + 1).padStart(2, "0")} · {h.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h3 className="font-aeonik text-[clamp(22px,1.9vw,26px)] leading-[1.15] font-normal tracking-[-0.015em] text-ndm-ink">{h.title}</h3>
                <p className="mt-2 flex-1 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/75">{h.text}</p>
                {h.product ? (
                  <a href={withBase(h.product.href)} target="_blank" rel="noopener" className="mt-5 flex items-center justify-between gap-3 rounded-[14px] bg-ndm-paper px-4 py-3 transition-colors hover:bg-ndm-mist">
                    <span className="min-w-0">
                      <span className="block font-inter text-[11.5px] tracking-[.14em] text-ndm-muted uppercase">In our shop</span>
                      <span className="mt-0.5 block truncate font-inter text-[14.5px] font-medium text-ndm-ink capitalize">
                        {h.product.name} · {h.product.size}
                      </span>
                    </span>
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ndm-deep text-white transition-transform duration-500 group-hover:-rotate-45">
                      <IconArrow size={12} />
                    </span>
                    <span className="sr-only"> (opens the shop in a new tab)</span>
                  </a>
                ) : (
                  <p className="mt-5 rounded-[14px] bg-ndm-paper px-4 py-3 font-inter text-[14px] font-medium text-ndm-muted">Ask us for a recommendation at your visit</p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </RevealSection>
  );
}
