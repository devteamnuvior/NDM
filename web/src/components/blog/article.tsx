"use client";

import Image from "next/image";
import { useRef } from "react";
import takeaway from "@/assets/images/testimonials/t-1.jpg";
import { BlogImg } from "@/components/blog/blog-img";
import { BlurTitle } from "@/components/blog/blur-title";
import { StoryCard, StoryMeta } from "@/components/blog/story";
import { useRevealLive } from "@/components/blog/use-reveal-live";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SiteLink } from "@/components/ui/site-link";
import { ACTIONS } from "@/config/routes";
import { useOnScroll } from "@/hooks/use-on-scroll";
import { useReveal } from "@/hooks/use-reveal";
import { clamp01 } from "@/lib/math";
import { pageLink } from "@/lib/routes";
import { byId } from "@/lib/dom";
import type { ArticleBlock, ArticleView, Story } from "@/types/blog";

/** A thin reading-progress line under the header bar. */
export function ReadProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useOnScroll(() => {
    const el = bar.current;
    const body = byId("article-body");
    if (!el || !body) return;
    const r = body.getBoundingClientRect();
    const vh = window.innerHeight;
    el.style.transform = `scaleX(${clamp01((vh * 0.35 - r.top) / Math.max(1, r.height - vh * 0.5)).toFixed(4)})`;
  });
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-[100px] z-[49] h-[2px] xl:top-[120px]">
      <div ref={bar} className="h-full origin-left bg-ndm-blue" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** The article's head: topic and reading time, the title, the byline and the wide photo (a slow parallax). */
export function ArticleHead({ view }: { view: ArticleView }) {
  const p = view.story;
  const box = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  useReveal(box);
  useOnScroll(() => {
    const img = photo.current;
    if (!img?.parentElement || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* the photo is 24% taller than its frame and moves at most 12%, so the frame never shows through */
    img.style.transform = `translate3d(0,${Math.min(window.scrollY * 0.15, img.parentElement.offsetHeight * 0.12).toFixed(1)}px,0)`;
  });
  return (
    <div ref={box} className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(170px,15vw,220px)]">
      <div className="mx-auto max-w-[980px] text-center">
        <div className="rv flex justify-center">
          <StoryMeta p={p} />
        </div>
        <BlurTitle as="h1" id="article-title" size="text-[clamp(42px,5.6vw,88px)]" className="mt-6" lead={view.lead} strong={view.strong} />
        <p className="rv mt-6 font-inter text-[14px] text-ndm-muted" style={{ transitionDelay: ".3s" }}>
          By the NewDermaMed team<span className="mx-2">·</span>
          <time dateTime={p.published.slice(0, 10) || undefined}>{p.date}</time>
        </p>
      </div>
      {p.hero.src && (
        <div className="rv rv-clip relative mx-auto mt-[clamp(40px,5vw,72px)] aspect-[16/10] max-w-[1320px] overflow-hidden rounded-[20px] bg-ndm-line sm:aspect-[21/9]">
          {/* the first thing a visitor sees: fetched first, in the size that fits the screen */}
          <BlogImg ref={photo} photo={p.hero} sizes="(min-width: 1400px) 1320px, 100vw" fetchPriority="high" className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover will-change-transform" />
        </div>
      )}
    </div>
  );
}

/** One piece of the article's text, in the article's own look. The HTML is the editors' inline formatting, scrubbed on the server. */
function Block({ b }: { b: ArticleBlock }) {
  if (b.tag === "hr") return <hr className="my-[clamp(36px,4vw,56px)] border-ndm-ink/10" />;
  if (b.tag === "img")
    return (
      <figure className="rv rv-clip">
        <BlogImg photo={b.photo} sizes="(min-width: 800px) 720px, 100vw" loading="lazy" className="aspect-[16/10] w-full rounded-[10px] object-cover" />
        {b.caption && <figcaption className="font-inter">{b.caption}</figcaption>}
      </figure>
    );
  const html = { __html: b.html };
  if (b.tag === "h2" || b.tag === "h3" || b.tag === "h4") return <b.tag className="rv font-aeonik" dangerouslySetInnerHTML={html} />;
  if (b.tag === "ul") return <ul className="rv font-inter" role="list" dangerouslySetInnerHTML={html} />;
  return <b.tag className="rv font-inter" dangerouslySetInnerHTML={html} />;
}

/** The article's text column, then the key takeaway card. */
export function ArticleBody({ view: a }: { view: ArticleView }) {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  return (
    <section ref={section} id="article-body" aria-labelledby="article-title" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(48px,6vw,88px)] pb-[clamp(72px,8vw,120px)]">
      <div className="article-prose mx-auto max-w-[720px]">
        <p className="rv font-aeonik text-[clamp(21px,1.8vw,26px)] leading-[1.45] tracking-[-0.01em] text-ndm-ink" dangerouslySetInnerHTML={{ __html: a.intro }} />
        <hr className="my-[clamp(36px,4vw,56px)] border-ndm-ink/10" />
        {a.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
        <aside aria-labelledby="takeaway" className="take-card mt-[clamp(48px,5vw,72px)] grid overflow-hidden rounded-[22px] md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:-mx-[clamp(0px,9vw,140px)]">
          <div className="rv rv-clip take-pic relative min-h-[300px] overflow-hidden bg-ndm-mist md:min-h-full">
            <Image src={takeaway} alt="" sizes="(min-width: 768px) 420px, 100vw" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
          </div>
          <div className="rv p-[clamp(24px,3vw,44px)]" style={{ transitionDelay: ".15s" }}>
            <Eyebrow>Key takeaway</Eyebrow>
            <p id="takeaway" className="mt-5 font-aeonik text-[clamp(21px,1.8vw,26px)] leading-[1.4] tracking-[-0.01em] text-ndm-ink">
              {a.takeaway}
            </p>
            <p className="mt-4 font-inter text-[14px] leading-[1.6] text-ndm-muted">Every plan starts with a free consultation at our Uptown or Downtown clinic. Individual results may vary.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button href={ACTIONS.book} v="book" hot>
                Book Free Consultation
              </Button>
              <SiteLink to={pageLink("blog")} className="btn btn-line">
                <span>More articles</span>
              </SiteLink>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/** Related articles: three cards (a sideways row on phones). */
export function RelatedStories({ items }: { items: Story[] }) {
  const section = useRef<HTMLElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  useReveal(section);
  useRevealLive(grid, items.length);
  return (
    <section ref={section} aria-labelledby="related-title" className="relative z-10 bg-ndm-mist px-[var(--gx)] py-[clamp(80px,9vw,128px)]">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="rv">Related articles</Eyebrow>
            <BlurTitle id="related-title" className="mt-5" lead="Keep" strong="reading." />
          </div>
          <div className="rv">
            <SiteLink to={pageLink("blog")} className="btn btn-line">
              <span>Explore all articles</span>
            </SiteLink>
          </div>
        </div>
        <ul ref={grid} className="related-row no-scrollbar -mx-[var(--gx)] mt-[clamp(36px,4vw,56px)] flex snap-x snap-mandatory scroll-px-[var(--gx)] gap-4 overflow-x-auto px-[var(--gx)] pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3" role="list">
          {items.map((p, i) => (
            <StoryCard key={p.slug} p={p} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
