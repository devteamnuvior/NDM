import { IconTick } from "@/components/treatment/icons";
import { TX_WRAP, TxHead } from "@/components/treatment/tx-head";
import { IconCheckBadge } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { NAMICA_SPHERE_SRC } from "@/config/site";
import { TxPhoto } from "@/components/treatment/tx-photo";
import type { TxIntroContent } from "@/types/treatment";

/** What it is: a photo (with the turning NAMICA badge) beside the copy and the main points. */
export function TxIntro({ intro: t, number }: { intro: TxIntroContent; number: string }) {
  return (
    <RevealSection id={t.id ?? "what"} aria-labelledby="intro-title" className="relative z-10 scroll-mt-[170px] bg-ndm-paper px-[var(--gx)] py-[clamp(56px,6vw,88px)]">
      <TxHead number={number} tag={t.tag} headingId="intro-title" lead={t.lead} strong={t.strong} />
      <div className={`${TX_WRAP} mt-[clamp(28px,3.4vw,48px)] grid items-center gap-8 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-[clamp(40px,5vw,72px)]`}>
        <div className="rv relative mx-auto w-full max-w-[460px] lg:max-w-none" style={{ transitionDelay: ".1s" }}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[24px] bg-ndm-mist lg:aspect-auto lg:h-[min(62vh,560px)]">
            <TxPhoto src={t.img} alt={t.alt} sizes="(min-width: 1024px) 480px, 460px" className={`absolute inset-0 h-full w-full ${t.contain ? "object-contain" : "object-cover"}`} style={{ objectPosition: t.position ?? "50% 40%", background: t.contain }} />
          </div>
          {t.ring && (
            <div aria-hidden="true" className="tx-ring absolute -top-6 -right-3 size-[clamp(112px,10vw,144px)] sm:-right-6">
              {/* one piece: the words and the sphere turn together */}
              <div className="tx-ring-spin absolute inset-0">
                <svg viewBox="0 0 160 160" className="absolute inset-0 size-full">
                  <defs>
                    <path id="tx-ring-path" d="M80,80 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0" />
                  </defs>
                  <circle cx="80" cy="80" r="78" fill="rgba(255,255,255,.94)" />
                  <text fontFamily="Inter, sans-serif" fontSize="10.5" fontWeight="600" letterSpacing="2.4" fill="#352862">
                    <textPath href="#tx-ring-path">{t.ring}</textPath>
                  </text>
                </svg>
                {/* eslint-disable-next-line @next/next/no-img-element -- the NAMICA badge, served by nuvior.com */}
                <img src={NAMICA_SPHERE_SRC} alt="" className="absolute top-1/2 left-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}
        </div>
        <div>
          {t.text.map((x, i) => (
            <p key={x} className="rv mt-0 max-w-[58ch] font-inter text-[17px] leading-[1.7] text-ndm-ink/90 [&+p]:mt-4" style={{ transitionDelay: `${0.1 + i * 0.04}s` }}>
              {x}
            </p>
          ))}
          {t.points.length > 0 && (
            <ul className="mt-7 grid gap-2.5" role="list">
              {t.points.map(([h, d], i) => (
                <li key={h} className="rv flex items-start gap-4 rounded-[18px] bg-white px-5 py-4 shadow-[0_18px_40px_-34px_rgba(27,36,43,.35)] ring-1 ring-ndm-ink/[.06] sm:items-center" style={{ transitionDelay: `${0.14 + i * 0.05}s` }}>
                  <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
                    <IconTick size={15} />
                  </span>
                  <span className="grid gap-1 sm:grid-cols-[minmax(110px,190px)_minmax(0,1fr)] sm:items-baseline sm:gap-4">
                    <span className="font-aeonik text-[21px] leading-[1.2] tracking-[-0.01em] text-ndm-ink">{h}</span>
                    <span className="font-inter text-[15.5px] leading-[1.55] text-ndm-ink/80">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {t.chips && (
            <ul className="rv mt-5 flex flex-wrap gap-2" role="list">
              {t.chips.map((c) => (
                <li key={c} className="rounded-full bg-white px-3.5 py-1.5 font-inter text-[14px] text-ndm-ink ring-1 ring-ndm-ink/10">
                  {c}
                </li>
              ))}
            </ul>
          )}
          {t.note && (
            <p className="rv mt-5 flex items-center gap-2 font-inter text-[14.5px] text-ndm-ink/75">
              <IconCheckBadge className="shrink-0 text-ndm-deep" />
              {t.note}
            </p>
          )}
        </div>
      </div>
    </RevealSection>
  );
}
