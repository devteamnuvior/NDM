import "server-only";

/**
 * This site's public address (SITE_URL, see .env.example), without a trailing slash; null while it is
 * not set. Canonical links, social cards and structured data need full addresses: without SITE_URL they
 * are written as paths, and the sitemap stays empty, rather than naming a wrong host.
 */
export function siteOrigin(): string | null {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** A path of this site as a full address ("/blog" -> "https://host/blog"); the path itself while SITE_URL is not set. */
export function absolute(path: string): string {
  return /^https?:/.test(path) ? path : `${siteOrigin() ?? ""}${path}`;
}

/** The clinic as the publisher of its pages. Only what the site itself states: the name and the address of the site. */
export function publisher(): Record<string, unknown> {
  const origin = siteOrigin();
  return { "@type": "MedicalOrganization", name: "NewDermaMed", ...(origin ? { url: origin } : {}) };
}

/** A breadcrumb trail for search engines: [name, path] pairs after Home. */
export function breadcrumbList(trail: [name: string, path: string][]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"] as [string, string], ...trail].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absolute(path) })),
  };
}
