"use client";

import { useRef, type CSSProperties } from "react";
import { BlurTitle } from "@/components/blog/blur-title";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";

const RINGS = [1, 0.8, 0.62, 0.45, 0.3];

/** The journal's header: light and type-led, a centred title with soft rings top right that drift on scroll. */
export function BlogHero() {
  const section = useRef<HTMLElement>(null);
  const rings = useRef<HTMLDivElement>(null);
  useReveal(section);
  useOnScroll(() => {
    const el = rings.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.style.transform = `translate3d(0,${(Math.min(window.scrollY, 700) * 0.25).toFixed(1)}px,0)`;
  });
  return (
    <section ref={section} aria-labelledby="blog-title" className="relative isolate overflow-hidden bg-ndm-paper px-[var(--gx)] pt-[clamp(176px,15vw,230px)] pb-[clamp(8px,2vw,24px)]">
      <div ref={rings} aria-hidden="true" className="pointer-events-none absolute -top-[clamp(10px,3vw,60px)] -right-[clamp(150px,13vw,220px)] -z-10 size-[clamp(360px,40vw,620px)]">
        {RINGS.map((s, i) => (
          <span key={s} className="blog-ring absolute inset-0 m-auto rounded-full border border-ndm-blue/20" style={{ width: `${s * 100}%`, height: `${s * 100}%`, "--i": i } as CSSProperties} />
        ))}
        <span className="blog-dot absolute inset-0 m-auto size-[5%] rounded-full bg-ndm-blue/45" />
      </div>
      <div className="mx-auto max-w-[1240px] text-center">
        <Eyebrow className="rv">The NewDermaMed Journal</Eyebrow>
        <BlurTitle as="h1" id="blog-title" size="text-[clamp(44px,6.6vw,108px)]" className="mt-6" lead="Skin care tips and" strong="honest treatment guides." />
      </div>
    </section>
  );
}
