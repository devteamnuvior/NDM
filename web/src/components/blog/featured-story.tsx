"use client";

import { useRef } from "react";
import { BlogImg } from "@/components/blog/blog-img";
import { postLink, ReadButton, StoryMeta } from "@/components/blog/story";
import { SiteLink } from "@/components/ui/site-link";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import type { Story } from "@/types/blog";

/** The latest article as one wide card, its photo drifting slightly on scroll. */
export function FeaturedStory({ post: p }: { post: Story }) {
  const section = useRef<HTMLElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  useReveal(section);
  useOnScroll(() => {
    const el = section.current;
    const img = photo.current;
    if (!el || !img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    img.style.transform = `translate3d(0,${((clamp01((vh - r.top) / (vh + r.height)) - 0.5) * -40).toFixed(1)}px,0) scale(1.12)`;
  });
  const { to, tab } = postLink(p);
  return (
    <section ref={section} aria-labelledby="featured-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,110px)]">
      <article className="rv lead-card group mx-auto grid max-w-[1320px] gap-6 rounded-[22px] p-3 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-center md:gap-[clamp(24px,4vw,64px)] md:p-3.5">
        <SiteLink to={to} {...tab} tabIndex={-1} aria-hidden="true" className="rv rv-clip relative block aspect-[4/3] overflow-hidden rounded-[16px] bg-ndm-line md:aspect-[5/4]">
          {/* decorative here: the link is hidden from assistive technology, the heading beside it names the article */}
          <BlogImg ref={photo} photo={p.photo} alt="" sizes="(min-width: 768px) 50vw, 100vw" className="h-full w-full object-cover will-change-transform" style={{ transform: "scale(1.12)" }} />
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1.5 font-inter text-[12px] text-ndm-ink backdrop-blur-[6px]">Latest article</span>
        </SiteLink>
        <div className="px-3 pb-5 md:px-0 md:pr-[clamp(8px,3vw,48px)] md:pb-0">
          <StoryMeta p={p} />
          <h2 id="featured-title" className="mt-4 font-aeonik text-[clamp(32px,3.6vw,56px)] leading-[1.05] font-normal tracking-[-0.03em] text-ndm-ink">
            {p.title}
          </h2>
          <p className="mt-5 max-w-[46ch] font-inter text-[16px] leading-[1.6] text-ndm-muted">{p.excerpt}</p>
          <p className="mt-2 font-inter text-[13.5px] text-ndm-muted">{p.date}</p>
          <ReadButton p={p} className="mt-8" />
        </div>
      </article>
    </section>
  );
}
