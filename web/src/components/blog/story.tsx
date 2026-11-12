import { SiteLink } from "@/components/ui/site-link";
import { BLOG_LOCAL, type BlogPost } from "@/config/blog";
import { pageLink } from "@/lib/routes";
import type { ResolvedLink } from "@/types/navigation";

/** Where a post opens: its page on this site when it has one, else the clinic's live blog (in a new tab). */
export function postLink(p: BlogPost): { to: ResolvedLink; tab: { target?: string; rel?: string } } {
  const page = BLOG_LOCAL[p.slug];
  return page ? { to: pageLink(page), tab: {} } : { to: { href: p.url }, tab: { target: "_blank", rel: "noopener" } };
}

/** The meta line of a story: topic and reading time. */
export function StoryMeta({ p }: { p: BlogPost }) {
  return (
    <span className="flex items-center gap-2.5 font-inter text-[14px] text-ndm-muted">
      {p.topic}
      <i className="size-1 rounded-full bg-ndm-muted/70" />
      {p.minutes} min read
    </span>
  );
}

/** "Read article" as the blue button, a link to the post. */
export function ReadButton({ p, sm, className = "", describedBy }: { p: BlogPost; sm?: boolean; className?: string; describedBy?: string }) {
  const { to, tab } = postLink(p);
  return (
    <SiteLink to={to} {...tab} aria-describedby={describedBy} className={`btn btn-ink ${sm ? "btn-sm" : ""} btn-buy ${className}`}>
      <span>
        Read article{p.external && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </SiteLink>
  );
}

/** A story card: photo, topic, title, summary, date and the Read button. */
export function StoryCard({ p, i }: { p: BlogPost; i: number }) {
  const headingId = `story-${p.slug.replace(/[^a-z0-9]+/g, "-")}`;
  const { to, tab } = postLink(p);
  return (
    <li className="rv story-card" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
      <article aria-labelledby={headingId} className="story-box group relative flex h-full flex-col overflow-hidden rounded-[22px] p-3 pb-6">
        <SiteLink to={to} {...tab} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist">
          {/* eslint-disable-next-line @next/next/no-img-element -- post photo, served by the clinic's blog as in the prototype */}
          <img src={p.img} alt="" loading="lazy" decoding="async" className="story-img absolute inset-0 h-full w-full object-cover" />
        </SiteLink>
        <div className="relative mt-5 flex items-center justify-between gap-2 px-3">
          <span className="promo-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] tracking-[.12em] uppercase">{p.topic}</span>
          <span className="shrink-0 font-inter text-[13px] text-ndm-muted">{p.minutes} min read</span>
        </div>
        <h3 id={headingId} className="relative mt-4 px-3 font-aeonik text-[clamp(21px,1.7vw,25px)] leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink">
          <SiteLink to={to} {...tab} className="transition-colors hover:text-ndm-deep">
            {p.title}
          </SiteLink>
        </h3>
        <p className="relative mt-2 line-clamp-3 px-3 font-inter text-[15px] leading-[1.55] text-ndm-muted">{p.excerpt}</p>
        <div className="relative mt-auto flex items-center justify-between gap-3 px-3 pt-6">
          <time className="font-inter text-[13px] whitespace-nowrap text-ndm-muted">{p.date.replace(/^([A-Z][a-z]{2})[a-z]+/, "$1")}</time>
          <ReadButton p={p} sm describedBy={headingId} />
        </div>
      </article>
    </li>
  );
}
