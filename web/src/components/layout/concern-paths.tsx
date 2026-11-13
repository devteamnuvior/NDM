"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { resolveLabel, toSlug } from "@/lib/routes";
import type { NavSectionId, ResolvedLink } from "@/types/navigation";

/** The slugs of the pages published in WordPress: the post types "Concerns" and "Procedures". */
const PostSlugs = createContext<{ concerns: readonly string[]; procedures: readonly string[] }>({ concerns: [], procedures: [] });

/** Tells the header which addresses are concern and procedure pages; the lists are read from WordPress by the site layout. */
export function ConcernPathsProvider({ slugs, procedures = [], children }: { slugs: readonly string[]; procedures?: readonly string[]; children: ReactNode }) {
  return <PostSlugs value={{ concerns: slugs, procedures }}>{children}</PostSlugs>;
}

/**
 * On a concern or procedure page from WordPress: the menu section the header marks. The header also
 * starts dark there, over the page's photo. Undefined on every other page.
 */
export function usePostSection(): Extract<NavSectionId, "concerns" | "procedures"> | undefined {
  const { concerns, procedures } = useContext(PostSlugs);
  const slug = usePathname().replace(/^\/+|\/+$/g, "");
  return procedures.includes(slug) ? "procedures" : concerns.includes(slug) ? "concerns" : undefined;
}

/** A menu label -> its link; a concern or a procedure that has a page in WordPress links to it. */
export function useMenuLink(): (label: string) => ResolvedLink {
  const { concerns, procedures } = useContext(PostSlugs);
  return (label) => {
    const link = resolveLabel(label);
    const slug = toSlug(label);
    return link.page === undefined && (concerns.includes(slug) || procedures.includes(slug)) ? { href: `/${slug}`, internal: true } : link;
  };
}
