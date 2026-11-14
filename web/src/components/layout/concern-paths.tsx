"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { resolveLabel, toSlug } from "@/lib/routes";
import type { NavSectionId, ResolvedLink } from "@/types/navigation";

/** A page published in WordPress: the post's slug and its address on the site ("/injectables/botox"). */
export interface PostPath {
  slug: string;
  path: string;
}

/** The pages published in WordPress: concerns, procedures (every procedure post type, and the Aptos page) and the blog's articles. */
const PostPaths = createContext<{ concerns: readonly PostPath[]; procedures: readonly PostPath[]; articles: readonly PostPath[] }>({ concerns: [], procedures: [], articles: [] });

/** Tells the header which addresses are concern, procedure and article pages; the lists are read from WordPress by the site layout. */
export function ConcernPathsProvider({ concerns, procedures = [], articles = [], children }: { concerns: readonly PostPath[]; procedures?: readonly PostPath[]; articles?: readonly PostPath[]; children: ReactNode }) {
  return <PostPaths value={{ concerns, procedures, articles }}>{children}</PostPaths>;
}

/** The address without a trailing slash ("/concerns/wrinkles-fine-lines"). */
const here = (pathname: string) => pathname.replace(/\/+$/, "") || "/";
const at = (list: readonly PostPath[], path: string) => list.some((p) => p.path === path);

/**
 * On a concern or procedure page from WordPress: the menu section the header marks. The header also
 * starts dark there, over the page's photo. Undefined on every other page.
 */
export function usePostSection(): Extract<NavSectionId, "concerns" | "procedures"> | undefined {
  const { concerns, procedures } = useContext(PostPaths);
  const path = here(usePathname());
  return at(procedures, path) ? "procedures" : at(concerns, path) ? "concerns" : undefined;
}

/** On an article of the blog from WordPress: the menu section the header marks (About, where the Blog lives). Undefined on every other page. */
export function useArticleSection(): Extract<NavSectionId, "about"> | undefined {
  const { articles } = useContext(PostPaths);
  return at(articles, here(usePathname())) ? "about" : undefined;
}

/** A menu label -> its link; a concern or a procedure that has a page in WordPress links to its address there. */
export function useMenuLink(): (label: string) => ResolvedLink {
  const { concerns, procedures } = useContext(PostPaths);
  return (label) => {
    const link = resolveLabel(label);
    const slug = toSlug(label);
    const post = procedures.find((p) => p.slug === slug) ?? concerns.find((p) => p.slug === slug);
    return post ? { ...link, href: post.path, internal: true } : link;
  };
}
