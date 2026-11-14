"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { TeamProfile } from "@/components/team/team-profile";
import { IconArrow } from "@/components/ui/icons";
import { SectionHead } from "@/components/ui/section-head";
import { TEAM, TEAM_ORDER, type TeamMember } from "@/config/team";
import { useReveal } from "@/hooks/use-reveal";
import type { AboutCopy } from "@/types/about";
import { withBase } from "@/lib/base-path";

const CRED = "font-inter text-[11.5px] font-[550] uppercase leading-[1.5] tracking-[.16em] text-ndm-deep";
const PEOPLE = TEAM_ORDER.map((id) => TEAM.find((m) => m.id === id)).filter((m): m is TeamMember => !!m);

/**
 * Our team: four compact cards. A card opens the same profile dialog as the home page; a member whose
 * profile has not arrived yet stays a plain card.
 */
export function AboutTeam({ copy }: { copy: AboutCopy["team"] }) {
  const section = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  useReveal(section);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const closed = useCallback(() => {
    setSelected(null);
    const b = opener.current;
    requestAnimationFrame(() => {
      if (b && b.isConnected) b.focus({ preventScroll: true });
    });
  }, []);
  return (
    <section ref={section} id="team" aria-labelledby="team-title" className="relative z-10 scroll-mt-[100px] bg-ndm-paper px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <SectionHead
        id="team-title"
        eyebrow={copy.tag}
        lead={
          <>
            {copy.lead}
            <br />
          </>
        }
        strong={copy.strong}
        intro={copy.intro}
      />
      <ul className="mt-[clamp(36px,4vw,56px)] grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list">
        {PEOPLE.map((m, i) => (
          <li key={m.id} id={m.id} className="rv scroll-mt-[110px]" style={{ transitionDelay: `${0.06 * i}s` }}>
            <article aria-labelledby={`${m.id}-name`} className={`team-card group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-ndm-ink/[.06] transition-shadow ${m.sample ? "" : "hover:shadow-[0_30px_60px_-36px_rgba(27,36,43,.45)]"}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-ndm-mist xl:aspect-square">
                <Image src={withBase(m.img)} alt={`Portrait of ${m.name}, ${m.role}`} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover object-[50%_18%] transition-transform duration-[1200ms] hover:scale-[1.04]" />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 font-inter text-[12px] font-medium text-ndm-ink backdrop-blur-[6px]">{m.tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {m.cred && (
                  <p className={`${CRED} truncate text-[10.5px]`} title={m.cred}>
                    {m.cred}
                  </p>
                )}
                <h3 id={`${m.id}-name`} className="mt-1.5 font-aeonik text-[clamp(22px,1.7vw,26px)] leading-[1.1] font-normal tracking-[-0.02em] text-ndm-ink">
                  {m.sample ? (
                    m.name
                  ) : (
                    <button
                      type="button"
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        opener.current = e.currentTarget;
                        setSelected(m);
                      }}
                      aria-haspopup="dialog" className="text-left after:absolute after:inset-0 after:z-[1] after:content-[''] hover:text-ndm-deep focus-visible:outline-hidden">
                      {m.name}
                      <span className="sr-only">, view full profile</span>
                    </button>
                  )}
                </h3>
                <p className="mt-1 font-inter text-[13.5px] text-ndm-muted">{m.role}</p>
                <p className="mt-3 line-clamp-3 font-inter text-[14.5px] leading-[1.6] text-ndm-ink/80">{m.short || "A nurse practitioner on our medical team."}</p>
                {m.focus && (
                  <ul className="mt-4 flex flex-wrap gap-1.5" role="list" aria-label={m.focusLabel}>
                    {m.focus.slice(0, 2).map((f) => (
                      <li key={f.label} className="rounded-full bg-ndm-mist px-2.5 py-1 font-inter text-[12px] text-ndm-ink">
                        {f.label}
                      </li>
                    ))}
                  </ul>
                )}
                <p aria-hidden="true" className={`mt-auto flex items-center gap-2 pt-5 font-inter text-[13.5px] font-semibold ${m.sample ? "text-ndm-muted" : "text-ndm-deep"}`}>
                  {m.sample ? (
                    "Full profile coming soon"
                  ) : (
                    <>
                      View full profile
                      <IconArrow size={13} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {selected && createPortal(<TeamProfile member={selected} onClose={closed} />, document.body)}
    </section>
  );
}
