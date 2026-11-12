import { Fragment } from "react";
import { SiteLink } from "@/components/ui/site-link";
import { pageLink } from "@/lib/routes";
import type { ResolvedLink } from "@/types/navigation";

interface BreadcrumbProps {
  /** The trail after Home: a label, or [label, link] for a page above the current one. The last one is the current page. */
  items: (string | [label: string, link?: ResolvedLink])[];
  /** For pages that open on a dark hero. */
  dark?: boolean;
}

/** Breadcrumb: on every page except home, top left, just under the header bar. */
export function Breadcrumb({ items, dark }: BreadcrumbProps) {
  const link = `underline-offset-4 transition-colors hover:underline ${dark ? "text-white/65 hover:text-white" : "text-ndm-muted hover:text-ndm-ink"}`;
  return (
    <nav aria-label="Breadcrumb" className="crumbs absolute inset-x-0 top-[116px] z-20 px-[var(--gx)] xl:top-[136px]">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-inter text-[13px]" role="list">
        <li>
          <SiteLink to={pageLink("home")} className={link}>
            Home
          </SiteLink>
        </li>
        {items.map((x, i) => {
          const [label, to] = Array.isArray(x) ? x : [x, undefined];
          const last = i === items.length - 1;
          return (
            <Fragment key={label}>
              <li aria-hidden="true" className={dark ? "text-white/35" : "text-ndm-ink/30"}>
                /
              </li>
              <li>
                {last ? (
                  <span aria-current="page" className={dark ? "text-white" : "text-ndm-ink"}>
                    {label}
                  </span>
                ) : !to ? (
                  /* a level with no page of its own (Procedures): styled like a link, as in the prototype */
                  <a className={link}>{label}</a>
                ) : (
                  <SiteLink to={to} className={link}>
                    {label}
                  </SiteLink>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
