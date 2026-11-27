"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { usePlaceholderLink } from "@/components/layout/concern-paths";
import type { PageId } from "@/config/routes";
import { isMigrated } from "@/lib/routes";
import type { ResolvedLink } from "@/types/navigation";
import { withBase } from "@/lib/base-path";

interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: ResolvedLink;
  /** The open page: a link to it gets `aria-current="page"`. Leave out to never mark the link. */
  current?: PageId;
  /** What a "#/slug" placeholder means where a slug could be a concern or a procedure. */
  prefer?: "concerns" | "procedures";
}

/**
 * A link to one of the site's pages. Pages served by Next.js get client-side navigation. A "#/slug"
 * placeholder (a label with no page of its own in the route table) opens the page WordPress has for it,
 * else the list of procedures or concerns (lib/post-links.ts); one that leads off the site, like the
 * skincare shop, opens in a new tab.
 */
export function SiteLink({ to, current, prefer, children, ...rest }: SiteLinkProps) {
  const real = usePlaceholderLink(prefer);
  const here = to.page !== undefined && to.page === current ? ({ "aria-current": "page" } as const) : {};
  const href = to.href.startsWith("#/") ? real(to.href) : to.href;
  const placed = href !== to.href;
  if (/^https?:/.test(href) && placed) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  if (to.internal || (placed && href.startsWith("/")) || (to.page !== undefined && isMigrated(to.page))) {
    return (
      <Link href={href} {...here} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={withBase(href)} {...here} {...rest}>
      {children}
    </a>
  );
}
