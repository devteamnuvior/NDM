"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { resolveLabel, toSlug } from "@/lib/routes";
import type { ResolvedLink } from "@/types/navigation";

/** The slugs of the concern pages published in WordPress (the post type "Concerns"). */
const ConcernSlugs = createContext<readonly string[]>([]);

/** Tells the header which addresses are concern pages; the list is read from WordPress by the site layout. */
export function ConcernPathsProvider({ slugs, children }: { slugs: readonly string[]; children: ReactNode }) {
  return <ConcernSlugs value={slugs}>{children}</ConcernSlugs>;
}

/** True on a concern page from WordPress: the header starts dark over its photo and marks Concerns. */
export function useOnConcernPage(): boolean {
  const slugs = useContext(ConcernSlugs);
  const pathname = usePathname();
  return slugs.includes(pathname.replace(/^\/+|\/+$/g, ""));
}

/** A menu label -> its link; a concern that has a page in WordPress links to it. */
export function useMenuLink(): (label: string) => ResolvedLink {
  const slugs = useContext(ConcernSlugs);
  return (label) => {
    const link = resolveLabel(label);
    const slug = toSlug(label);
    return link.page === undefined && slugs.includes(slug) ? { href: `/${slug}`, internal: true } : link;
  };
}
