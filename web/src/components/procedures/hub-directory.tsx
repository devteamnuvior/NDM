"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { IconArrow } from "@/components/ui/icons";
import { TwoTone } from "@/components/ui/two-tone";
import { HUB_AREAS, type HubArea } from "@/config/procedures-hub";
import { useReveal } from "@/hooks/use-reveal";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import type { HubCard, HubView } from "@/lib/procedures-hub";

const norm = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ®™]/g, "").toLowerCase();

/**
 * "Find your treatment" and the directory under it. The server renders every group and card, so every
 * treatment link is in the page for search engines and for people without scripts; the search box and the
 * area chips only hide the cards that do not match. Category chips are ordinary links to each group.
 */
export function HubDirectory({ groups, count }: Pick<HubView, "groups" | "count">) {
  const box = useRef<HTMLElement>(null);
  useReveal(box);
  const [q, setQ] = useState("");
  const [area, setArea] = useState<HubArea | "all">("all");
  const query = useDeferredValue(norm(q.trim()));

  const match = useMemo(() => {
    const words = query.split(/\s+/).filter(Boolean);
    return (c: HubCard) => (area === "all" || c.areas.includes(area)) && words.every((w) => norm(`${c.title} ${c.text} ${c.concerns.join(" ")}`).includes(w));
  }, [query, area]);
  const shown = groups.map((g) => ({ ...g, cards: g.cards.filter(match) }));
  const total = shown.reduce((n, g) => n + g.cards.length, 0);
  const filtered = query !== "" || area !== "all";

  return (
    <section ref={box} id="treatments" aria-labelledby="hub-find" className="ph-directory relative z-10 scroll-mt-[170px] px-[var(--gx)] pt-[clamp(56px,6vw,96px)]">
      <div className="ph-finder rv rounded-[28px] bg-white p-[clamp(20px,2.6vw,36px)] ring-1 ring-ndm-ink/[.06]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
          <div className="min-w-0">
            <p className="font-mont text-[12px] tracking-[.16em] text-ndm-deep uppercase">Find your treatment</p>
            <TwoTone
              id="hub-find"
              className="mt-3"
              size="text-[clamp(28px,3vw,42px)]"
              lead={
                <>
                  Search {count} treatments,
                  <br />
                </>
              }
              strong="or narrow by area"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="hub-q" className="sr-only">
              Search treatments by name or concern
            </label>
            <div className="ph-search flex items-center gap-3 rounded-full bg-ndm-paper px-5 ring-1 ring-ndm-ink/[.08] focus-within:ring-2 focus-within:ring-ndm-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-ndm-muted">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="hub-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try “acne scars”, “lips” or “laser”"
                autoComplete="off"
                className="h-14 w-full min-w-0 bg-transparent font-inter text-[16px] text-ndm-ink outline-none placeholder:text-ndm-muted/80"
              />
            </div>
            <div role="group" aria-label="Filter by area" className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
              {([["all", "All areas"], ...HUB_AREAS] as [HubArea | "all", string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={area === id}
                  onClick={() => setArea(id)}
                  className={`shrink-0 rounded-full px-4 py-2 font-inter text-[14px] whitespace-nowrap transition-colors ${area === id ? "bg-ndm-deep text-white" : "bg-ndm-paper text-ndm-ink/80 ring-1 ring-ndm-ink/[.08] hover:text-ndm-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <nav aria-label="Treatment categories" className="mt-6 border-t border-ndm-ink/[.07] pt-5">
          <ul role="list" className="flex flex-wrap gap-x-5 gap-y-2.5">
            {groups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="group inline-flex items-center gap-2 font-inter text-[14.5px] text-ndm-ink/85 transition-colors hover:text-ndm-deep">
                  {g.title}
                  <span className="rounded-full bg-ndm-mist px-2 py-0.5 text-[12px] text-ndm-muted tabular-nums">{g.cards.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p aria-live="polite" className="sr-only">
          {filtered ? `${total} ${total === 1 ? "treatment matches" : "treatments match"}` : ""}
        </p>
      </div>

      {filtered && total === 0 && (
        <div className="mt-10 rounded-[22px] bg-ndm-mist px-6 py-8 text-center">
          <p className="font-inter text-[16px] text-ndm-ink">No treatment matches that search.</p>
          <p className="mt-2 font-inter text-[14.5px] text-ndm-muted">Try a concern such as “wrinkles” or “pigmentation”, or browse the concerns below. A free consultation can also help you choose.</p>
          <button type="button" onClick={() => (setQ(""), setArea("all"))} className="btn btn-line btn-sm mt-5">
            <span>Show all treatments</span>
          </button>
        </div>
      )}

      {shown.map((g) => (
        <div key={g.id} id={g.id} hidden={g.cards.length === 0} className="scroll-mt-[190px] pt-[clamp(40px,4.4vw,64px)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
            <h2 className="font-aeonik text-[clamp(26px,2.5vw,36px)] leading-[1.1] font-normal tracking-[-0.03em] text-ndm-ink">
              {g.title}
              <span className="ml-3 align-middle font-inter text-[14px] tracking-normal text-ndm-muted tabular-nums">{g.cards.length}</span>
            </h2>
            <p className="max-w-[52ch] font-inter text-[14.5px] leading-[1.55] text-ndm-muted">{g.intro}</p>
          </div>
          <ul role="list" className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {g.cards.map((c) => (
              <li key={c.slug}>
                <HubTreatmentCard c={c} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function HubTreatmentCard({ c }: { c: HubCard }) {
  return (
    <Link href={c.path} className="ph-card group flex h-full flex-row overflow-hidden rounded-[18px] bg-white ring-1 ring-ndm-ink/[.06] sm:flex-col sm:rounded-[22px]">
      <span className="relative block w-[104px] shrink-0 overflow-hidden bg-ndm-mist sm:aspect-[5/4] sm:w-auto">
        {c.img ? (
          // eslint-disable-next-line @next/next/no-img-element -- WordPress and site photos through the optimizer, like the site's other WordPress photos
          <img
            src={optimized(c.img, 640)}
            srcSet={optimizedSrcSet(c.img, [384, 640, 828]) || undefined}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 104px"
            alt=""
            loading="lazy"
            decoding="async"
            className="ph-card-img absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: c.pos }}
          />
        ) : (
          <span aria-hidden="true" className="ph-card-blank absolute inset-0" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col px-4 py-3.5 sm:px-5 sm:pt-5 sm:pb-5">
        <span className="font-aeonik text-[18px] leading-[1.15] tracking-[-0.02em] text-ndm-ink transition-colors group-hover:text-ndm-deep sm:text-[21px]">{c.title}</span>
        <span className="mt-1.5 line-clamp-3 font-inter text-[13.5px] leading-[1.5] text-ndm-muted sm:mt-2 sm:line-clamp-none sm:text-[14px] sm:leading-[1.55]">{c.text}</span>
        {c.concerns.length > 0 && (
          <span className="mt-4 hidden flex-wrap gap-1.5 sm:flex">
            {c.concerns.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-ndm-paper px-2.5 py-1 font-inter text-[12px] text-ndm-ink/75 ring-1 ring-ndm-ink/[.06]">
                {t}
              </span>
            ))}
          </span>
        )}
        <span className="mt-auto hidden items-center gap-2 pt-5 font-inter text-[14px] font-medium text-ndm-deep sm:flex">
          Learn about {c.title.replace(/\s*\(.*\)$/, "")}
          <IconArrow size={13} className="transition-transform group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}
