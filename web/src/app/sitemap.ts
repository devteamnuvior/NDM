import type { MetadataRoute } from "next";
import { getBlog } from "@/lib/blog";
import { pagePath } from "@/lib/routes";
import { absolute, siteOrigin } from "@/lib/seo";

/**
 * /sitemap.xml. For now the blog only: the list and every article that has a page on this site, with
 * the day each was last changed in WordPress. The other pages are added when the site-wide SEO work is
 * done. Empty while SITE_URL is not set: a sitemap must name the site's real address.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteOrigin()) return [];
  const { stories } = await getBlog();
  const articles = stories.filter((s) => !s.external && s.href.startsWith("/"));
  const newest = articles.map((s) => s.modified).sort().at(-1);
  return [
    { url: absolute(pagePath("blog")), ...(newest ? { lastModified: newest } : {}) },
    ...articles.map((s) => ({ url: absolute(s.href), ...(s.modified ? { lastModified: s.modified } : {}) })),
  ];
}
