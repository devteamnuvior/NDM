"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { realLink } from "@/lib/post-links";
import { menuPost, type PostPath } from "@/lib/post-paths";
import { resolveLabel, toSlug } from "@/lib/routes";
import type { NavSectionId, ResolvedLink } from "@/types/navigation";

export type { PostPath };

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

/** A menu label -> its link; a concern or a procedure that has a page in WordPress links to its address there (`menuPost`: the Concerns menu prefers concerns). */
export function useMenuLink(prefer: "concerns" | "procedures" = "procedures"): (label: string) => ResolvedLink {
  const { concerns, procedures } = useContext(PostPaths);
  return (label) => {
    const link = resolveLabel(label);
    const post = menuPost(toSlug(label), concerns, procedures, prefer);
    if (post) return { ...link, href: post.path, internal: true };
    /* a label with no page of its own slug: the page the placeholder table names for it, else the list of procedures or concerns */
    if (!link.href.startsWith("#/")) return link;
    const href = realLink(link.href, { concerns, procedures }, prefer);
    return { ...link, href, internal: href.startsWith("/") };
  };
}

/** A "#/slug" placeholder -> the address of its page (lib/post-links.ts), for links a component writes itself. */
export function usePlaceholderLink(prefer: "concerns" | "procedures" = "procedures"): (href: string) => string {
  const { concerns, procedures } = useContext(PostPaths);
  return (href) => realLink(href, { concerns, procedures }, prefer);
}
