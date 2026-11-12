import { PAGES, SLUG_TO_PAGE, type PageId } from "@/config/routes";
import type { ResolvedLink } from "@/types/navigation";

export function pagePath(page: PageId): string {
  return PAGES[page].path;
}

export function isMigrated(page: PageId): boolean {
  return PAGES[page].migrated;
}

function toSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** A menu label -> its link. Labels with no page yet keep the prototype's `#/slug` placeholder. */
export function resolveLabel(label: string): ResolvedLink {
  const slug = toSlug(label);
  const page = SLUG_TO_PAGE[slug];
  return page ? { href: pagePath(page), page } : { href: `#/${slug}` };
}

export function pageLink(page: PageId): ResolvedLink {
  return { href: pagePath(page), page };
}

/** The page a pathname belongs to. Accepts both the clean URL and the original `.html` one. */
export function pageFromPathname(pathname: string): PageId | undefined {
  const clean = pathname.replace(/\/+$/, "").replace(/\.html$/, "").toLowerCase();
  if (clean === "" || clean === "/index") return "home";
  return (Object.keys(PAGES) as PageId[]).find((id) => PAGES[id].path.replace(/\.html$/, "") === clean);
}

export const tel = (num: string): string => `tel:+1${num.replace(/\D/g, "")}`;

/**
 * A link as the prototype's content files write it ("botox.html", "pricing.html#prices", "#/slug", a full URL)
 * -> the same place on this site.
 */
export function contentLink(href: string): ResolvedLink {
  if (/^(#|https?:|tel:|mailto:)/.test(href)) return { href };
  const [file, hash] = href.split("#");
  const page = pageFromPathname(`/${file}`);
  return page ? { href: pagePath(page) + (hash ? `#${hash}` : ""), page } : { href: `/${href}` };
}
