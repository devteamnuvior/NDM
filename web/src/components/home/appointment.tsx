"use client";

import Image from "next/image";
import { useRef } from "react";
import treatmentRoom from "@/assets/images/hero/treatment-room.jpg";
import { BookForm } from "@/components/booking/book-form";
import { TwoTone } from "@/components/ui/two-tone";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";

/** Booking: the consultation form in one glass card over the treatment-room photo, which drifts a little behind it. */
export function Appointment() {
  const section = useRef<HTMLElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  useReveal(section);

  useOnScroll(() => {
    const el = section.current;
    const img = photo.current;
    if (!el || !img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp01((vh - r.top) / (vh + r.height));
    img.style.transform = `translate3d(0,${((p - 0.5) * -90).toFixed(1)}px,0) scale(1.12)`;
  });

  return (
    <section ref={section} aria-labelledby="book" className="relative isolate z-10 overflow-hidden px-[var(--gx)] py-[clamp(48px,6vw,96px)]">
      <Image ref={photo} src={treatmentRoom} alt="" aria-hidden="true" fill sizes="100vw" className="-z-20 object-cover object-center will-change-transform" style={{ transform: "scale(1.12)" }} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(11,15,19,.32)]" />
      <div className="rv book-shell mx-auto flex max-w-[1080px] flex-col rounded-[26px] p-[clamp(18px,2.4vw,32px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <TwoTone
            id="book"
            size="text-[clamp(26px,2.6vw,38px)]"
            lead={
              <>
                Book a free consultation
                <br />
              </>
            }
            strong="in a few short steps"
          />
          <p className="max-w-[36ch] font-inter text-[13.5px] leading-[1.5] text-ndm-muted">Uptown or Downtown. Your consultation and VISIA® skin analysis are free.</p>
        </div>
        <div className="mt-5 flex">
          <BookForm summary />
        </div>
      </div>
    </section>
  );
}
