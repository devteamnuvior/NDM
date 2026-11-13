import { IconArrow } from "@/components/ui/icons";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RevealSection } from "@/components/ui/reveal-section";
import { TwoTone } from "@/components/ui/two-tone";
import { POSTS, type Post } from "@/config/social";
import { pagePath } from "@/lib/routes";
import type { HomeCopy } from "@/types/home";

/* post photos come from their own CDN, already sized, as in the prototype */
/* eslint-disable @next/next/no-img-element */

function PostMeta({ p }: { p: Post }) {
  return (
    <span className="flex items-center gap-2.5 font-inter text-[14px] text-ndm-muted">
      {p.date}
      <i className="size-1 rounded-full bg-ndm-muted/70" />
      {p.tag}
    </span>
  );
}

/** Journal: one large post on the left, three smaller ones on the right, and the link to all articles. */
export function Journal({ copy }: { copy: HomeCopy["journal"] }) {
  const [lead, ...rest] = POSTS;
  return (
    <RevealSection aria-labelledby="journal" className="relative z-10 bg-ndm-paper px-[var(--gx)] pt-[clamp(64px,7vw,104px)] pb-[clamp(24px,3vw,48px)]">
      <div className="mx-auto max-w-[1320px]">
        <div className="text-center">
          <Eyebrow className="rv">{copy.tag}</Eyebrow>
          <TwoTone
            id="journal"
            className="rv mx-auto mt-5 max-w-[16ch]"
            lead={
              <>
                {copy.lead}
                <br />
              </>
            }
            strong={copy.strong}
            style={{ transitionDelay: ".06s" }}
          />
        </div>
        <div className="mt-12 grid gap-10 md:mt-14 lg:grid-cols-2 lg:gap-[60px]">
          <a href={lead.href} className="rv group block rounded-[20px] bg-ndm-mist p-4 md:p-5" style={{ transitionDelay: ".1s" }}>
            <span className="block aspect-[590/385] overflow-hidden rounded-[10px]">
              <img src={lead.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]" style={{ objectPosition: lead.position, transitionTimingFunction: "var(--e-out)" }} />
            </span>
            <span className="mt-5 block">
              <PostMeta p={lead} />
            </span>
            <span className="mt-2 block font-aeonik text-[22px] leading-[1.2] tracking-[-0.01em] text-ndm-ink transition-colors group-hover:text-ndm-deep">{lead.title}</span>
            <span className="mt-2 block max-w-[56ch] font-inter text-[15px] leading-[1.55] text-ndm-muted">{lead.excerpt}</span>
          </a>
          <div className="flex flex-col gap-5">
            {rest.map((p, i) => (
              <a key={p.href} href={p.href} className="rv group grid grid-cols-[120px_1fr] items-center gap-4 sm:grid-cols-[203px_1fr] sm:gap-6" style={{ transitionDelay: `${0.14 + i * 0.08}s` }}>
                <span className="block h-[110px] overflow-hidden rounded-[10px] sm:h-[164px]">
                  <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]" style={{ objectPosition: p.position, transitionTimingFunction: "var(--e-out)" }} />
                </span>
                <span>
                  <PostMeta p={p} />
                  <span className="mt-2 block max-w-[24ch] font-aeonik text-[19px] leading-[1.2] tracking-[-0.01em] text-ndm-ink transition-colors group-hover:text-ndm-deep sm:text-[22px]">{p.title}</span>
                  <span className="mt-1.5 line-clamp-2 max-w-[46ch] font-inter text-[13.5px] leading-[1.5] text-ndm-muted sm:text-[14.5px]">{p.excerpt}</span>
                </span>
              </a>
            ))}
            <a href={pagePath("blog")} className="rv group mt-auto inline-flex items-center gap-2 self-start font-inter text-[15px] text-ndm-ink hover:text-ndm-deep" style={{ transitionDelay: ".4s" }}>
              View all articles <IconArrow className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
