import { BlogImg } from "@/components/blog/blog-img";
import { SiteLink } from "@/components/ui/site-link";
import type { Story } from "@/types/blog";
import type { ResolvedLink } from "@/types/navigation";

/** Where a story opens: its page on this site when it has one, else the address typed for it in WordPress (in a new tab). */
export function postLink(p: Story): { to: ResolvedLink; tab: { target?: string; rel?: string } } {
  return p.external ? { to: { href: p.href }, tab: { target: "_blank", rel: "noopener" } } : { to: { href: p.href, internal: p.href.startsWith("/") }, tab: {} };
}

/** The meta line of a story: topic and reading time. */
export function StoryMeta({ p }: { p: Story }) {
  return (
    <span className="flex items-center gap-2.5 font-inter text-[14px] text-ndm-muted">
      {p.topic}
      {p.topic && p.minutes > 0 && <i className="size-1 rounded-full bg-ndm-muted/70" />}
      {p.minutes > 0 && <>{p.minutes} min read</>}
    </span>
  );
}

/** "Read article" as the blue button, a link to the post. */
export function ReadButton({ p, sm, className = "", describedBy }: { p: Story; sm?: boolean; className?: string; describedBy?: string }) {
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
export function StoryCard({ p, i }: { p: Story; i: number }) {
  const headingId = `story-${p.slug}`;
  const { to, tab } = postLink(p);
  return (
    <li className="rv story-card" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
      <article aria-labelledby={headingId} className="story-box group relative flex h-full flex-col overflow-hidden rounded-[22px] p-3 pb-6">
        <SiteLink to={to} {...tab} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-ndm-mist">
          {/* decorative here: the link is hidden from assistive technology, the title below is the link */}
          <BlogImg photo={p.photo} alt="" sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 90vw" loading="lazy" className="story-img absolute inset-0 h-full w-full object-cover" />
        </SiteLink>
        <div className="relative mt-5 flex items-center justify-between gap-2 px-3">
          <span className="promo-tag truncate rounded-full px-3 py-1.5 font-mont text-[10.5px] tracking-[.12em] uppercase">{p.topic}</span>
          {p.minutes > 0 && <span className="shrink-0 font-inter text-[13px] text-ndm-muted">{p.minutes} min read</span>}
        </div>
        <h3 id={headingId} className="relative mt-4 px-3 font-aeonik text-[clamp(21px,1.7vw,25px)] leading-[1.15] font-normal tracking-[-0.02em] text-ndm-ink">
          <SiteLink to={to} {...tab} className="transition-colors hover:text-ndm-deep">
            {p.title}
          </SiteLink>
        </h3>
        <p className="relative mt-2 line-clamp-3 px-3 font-inter text-[15px] leading-[1.55] text-ndm-muted">{p.excerpt}</p>
        <div className="relative mt-auto flex items-center justify-between gap-3 px-3 pt-6">
          <time dateTime={p.published.slice(0, 10) || undefined} className="font-inter text-[13px] whitespace-nowrap text-ndm-muted">
            {p.date.replace(/^([A-Z][a-z]{2})[a-z]+/, "$1")}
          </time>
          <ReadButton p={p} sm describedBy={headingId} />
        </div>
      </article>
    </li>
  );
}
