import { TxTag } from "@/components/treatment/tx-head";
import { TxPhoto } from "@/components/treatment/tx-photo";
import { IconCheckBadge } from "@/components/ui/icons";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import type { ProcedurePage } from "@/types/treatment";

function Card({ title, text, i }: { title: string; text: string; i: number }) {
  return (
    <li className="rv flex flex-col rounded-[22px] bg-white p-[clamp(20px,2vw,28px)] ring-1 ring-ndm-ink/[.06] sm:min-h-[220px]" style={{ transitionDelay: `${0.06 * i}s` }}>
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-ndm-blue/10 text-ndm-deep">
        <IconCheckBadge />
      </span>
      <h3 className="mt-auto pt-5 font-aeonik text-[22px] leading-[1.2] font-normal tracking-[-0.01em] text-ndm-ink sm:pt-8">{title}</h3>
      <p className="mt-2 font-inter text-[14.5px] leading-[1.6] text-ndm-muted">{text}</p>
    </li>
  );
}

/** Why choose this treatment: cards each side of a tall photo. */
export function ProcChoose({ choose: c, number }: { choose: ProcedurePage["choose"]; number: string }) {
  const half = Math.ceil(c.cards.length / 2);
  return (
    <RevealSection id="why-choose" aria-labelledby="choose-title" className="relative z-10 scroll-mt-[170px] bg-ndm-mist px-[var(--gx)] py-[clamp(72px,8vw,120px)]">
      <div className="text-center">
        <TxTag number={number}>{c.tag}</TxTag>
        <TwoTone
          id="choose-title"
          className="rv mx-auto mt-5"
          lead={
            <>
              {c.lead}
              <br />
            </>
          }
          strong={c.strong}
          style={{ transitionDelay: ".06s" }}
        />
      </div>
      <div className="mx-auto mt-[clamp(36px,4vw,56px)] grid max-w-[1180px] gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4">
        <div className="rv rv-clip relative min-h-[360px] overflow-hidden rounded-[22px] bg-ndm-line md:col-span-2 lg:order-2 lg:col-span-1 lg:min-h-0" style={{ transitionDelay: ".08s" }}>
          <TxPhoto src={c.img} alt={c.alt} sizes="(min-width: 1024px) 410px, 100vw" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" />
        </div>
        <ul className="grid gap-3 lg:order-1 lg:gap-4" role="list">
          {c.cards.slice(0, half).map(([title, text], i) => (
            <Card key={title} title={title} text={text} i={i} />
          ))}
        </ul>
        <ul className="grid gap-3 lg:order-3 lg:gap-4" role="list">
          {c.cards.slice(half).map(([title, text], i) => (
            <Card key={title} title={title} text={text} i={i + half} />
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
