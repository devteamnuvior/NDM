import Image, { type StaticImageData } from "next/image";
import { PAGE_SECTION } from "@/config/navigation";
import type { PageId } from "@/config/routes";
import { withBase } from "@/lib/base-path";
import { contentLink, pageLink, resolveLabel } from "@/lib/routes";
import type { NavMenuId, NavSectionId, ResolvedLink } from "@/types/navigation";
import type { MenuCategory, MenuItem } from "@/types/site-settings";

/** The panel a top-level item opens, if it opens one. */
export function itemPanel(item: MenuItem): NavMenuId | undefined {
  return item.kind === "procedures" || item.kind === "concerns" || item.kind === "about" ? item.kind : undefined;
}

/** Where a top-level link item goes: its own link, or the page with its name. */
export function itemLink(item: MenuItem, shopLink: string): ResolvedLink {
  if (item.kind === "shop") return { href: shopLink };
  if (item.link === "/") return pageLink("home");
  return item.link ? contentLink(item.link) : resolveLabel(item.label);
}

/** Whether a top-level item opens in a new tab with the external-link icon. */
export function itemExternal(item: MenuItem): boolean {
  return item.kind === "shop" || (item.kind === "link" && item.newTab);
}

/** The section of the site an item stands for: the header marks it while one of its pages is open. */
export function itemSection(item: MenuItem, shopLink: string): NavSectionId | undefined {
  const panel = itemPanel(item);
  if (panel) return panel;
  if (item.kind === "shop") return "shop";
  const page = itemLink(item, shopLink).page;
  return page ? PAGE_SECTION[page] : undefined;
}

/** A menu link: its own link, or `byName` (a WordPress post with that slug, else the route table). */
export function menuEntryLink(entry: { label: string; link: string }, byName: (label: string) => ResolvedLink): ResolvedLink {
  return entry.link ? contentLink(entry.link) : byName(entry.label);
}

/** The procedure category that holds the open page, if any. */
export function categoryOf(categories: readonly MenuCategory[], current?: PageId): string | undefined {
  if (!current) return undefined;
  return categories.find((c) => c.groups.some((g) => g.items.some((it) => (it.link ? contentLink(it.link) : resolveLabel(it.label)).page === current)))?.id;
}

/**
 * A panel photo that fills its card: the photo picked in Site Settings (a plain <img>, served by
 * WordPress), else the built-in one through the image optimizer.
 */
export function MenuPhoto({ src, fallback, eager, sizes }: { src: string; fallback: StaticImageData; eager?: boolean; sizes: string }) {
  const cls = "object-cover transition-transform duration-700 group-hover:scale-105";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- a photo from WordPress's media library
    return <img src={src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" className={`absolute inset-0 h-full w-full ${cls}`} />;
  }
  return <Image src={withBase(fallback)} alt="" fill loading={eager ? "eager" : "lazy"} sizes={sizes} className={cls} />;
}
