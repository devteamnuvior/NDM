import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import type { PageId } from "@/config/routes";
import { isMigrated } from "@/lib/routes";
import type { ResolvedLink } from "@/types/navigation";

interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: ResolvedLink;
  /** The open page: a link to it gets `aria-current="page"`. Leave out to never mark the link. */
  current?: PageId;
}

/**
 * A link to one of the site's pages or placeholders. Pages already served by Next.js get client-side
 * navigation; pages still on the original static site, and `#/…` placeholders, are plain links.
 */
export function SiteLink({ to, current, children, ...rest }: SiteLinkProps) {
  const here = to.page !== undefined && to.page === current ? ({ "aria-current": "page" } as const) : {};
  if (to.page !== undefined && isMigrated(to.page)) {
    return (
      <Link href={to.href} {...here} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={to.href} {...here} {...rest}>
      {children}
    </a>
  );
}
