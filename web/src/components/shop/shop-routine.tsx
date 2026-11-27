"use client";

import Link from "next/link";
import { useState } from "react";
import { cad } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TwoTone } from "@/components/ui/two-tone";
import { ACTIONS } from "@/config/routes";
import { productPath } from "@/config/shop";
import { optimized, optimizedSrcSet } from "@/lib/optimized-image";
import type { RoutineStep } from "@/lib/shop-related";

const PHOTO = "/assets/home/v3/mirror-1440.webp";

/**
 * "Three steps", after auna.framer.media's routine: a tall photo on the left, a Morning / Evening switch, three
 * products (cleanse, treat, moisturise, picked from the store's data by `routines()`) and their total. No set price
 * exists in the store, so the total is only the sum; the button asks for a routine made for the visitor's skin.
 */
export function ShopRoutine({ list }: { list: { id: string; label: string; steps: RoutineStep[] }[] }) {
  const [on, setOn] = useState(0);
  const r = list[on];
  if (!r) return null;
  const total = r.steps.reduce((n, s) => n + s.p.price, 0);
  return (
    <section aria-labelledby="sp-routine" className="sp-routine px-[var(--gx)] pt-[clamp(80px,8vw,128px)]">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-[clamp(40px,5vw,88px)]">
        <div className="sp-routine-photo relative aspect-[4/4.6] overflow-hidden rounded-[clamp(22px,2.4vw,32px)] max-lg:aspect-[4/3.6]">
          {/* eslint-disable-next-line @next/next/no-img-element -- the site's own photo through the optimizer */}
          <img src={optimized(PHOTO, 1080)} srcSet={optimizedSrcSet(PHOTO, [640, 828, 1080]) || undefined} sizes="(min-width: 1024px) 42vw, 100vw" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
        </div>
        <div className="min-w-0">
          <Eyebrow>Routine</Eyebrow>
          <TwoTone
            id="sp-routine"
            className="mt-4"
            size="text-[clamp(34px,3.8vw,56px)]"
            lead={
              <>
                Three steps,
                <br />
              </>
            }
            strong={`for the ${r.label.toLowerCase()}`}
          />
          <p className="mt-4 max-w-[50ch] font-inter text-[15.5px] leading-[1.6] text-ndm-muted">An example of a three-step routine from the shop. Your provider can tailor it to your skin and your treatments at a free consultation.</p>
          <div role="tablist" aria-label="Routine" className="sp-toggle mt-6 inline-flex rounded-full bg-white p-1 ring-1 ring-ndm-ink/[.08]">
            {list.map((x, i) => (
              <button key={x.id} type="button" role="tab" aria-selected={i === on} onClick={() => setOn(i)} className={`rounded-full px-5 py-2.5 font-inter text-[14.5px] transition-colors ${i === on ? "bg-ndm-deep text-white" : "text-ndm-ink/75 hover:text-ndm-ink"}`}>
                {x.label}
              </button>
            ))}
          </div>
          <ol role="list" className="no-scrollbar mt-5 grid auto-cols-[minmax(200px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1 sm:gap-4">
            {r.steps.map((s, i) => (
              <li key={`${r.id}-${s.p.id}`} className="sp-step group relative">
                <span className="sp-step-img block aspect-square overflow-hidden rounded-[18px] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- product photo served by the online store */}
                  {s.p.image && <img src={s.p.image.src} alt="" loading="lazy" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />}
                </span>
                <span className="mt-3 flex items-baseline gap-2 font-inter text-[13px] text-ndm-muted">
                  <i className="font-aeonik text-[20px] text-ndm-deep not-italic tabular-nums">{String(i + 1).padStart(2, "0")}</i>
                  {s.step}
                </span>
                <Link href={productPath(s.p.slug)} className="sp-link sp-name mt-1 block font-aeonik text-[18px] leading-[1.2] text-ndm-ink transition-colors group-hover:text-ndm-deep">
                  {s.p.name}
                </Link>
                <span className="mt-1 block font-inter text-[14px] text-ndm-muted tabular-nums">{cad(s.p.price)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-ndm-ink/[.1] pt-6">
            <p className="font-inter text-ndm-ink">
              <b className="text-[24px] font-semibold tabular-nums">{cad(total)}</b>
              <span className="ml-2 text-[13.5px] text-ndm-muted">{`Total for the ${r.steps.length}, full sizes`}</span>
            </p>
            <Button href={ACTIONS.book} v="book" hot>
              Book Free Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
