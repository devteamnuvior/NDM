import type { MetadataRoute } from "next";
import { getAptosSlugs } from "@/lib/aptos";
import { getBlog } from "@/lib/blog";
import { getConcernPaths } from "@/lib/concern";
import { CONCERN_FOLDER } from "@/lib/post-paths";
import { getProcedurePaths } from "@/lib/procedure";
import { pagePath } from "@/lib/routes";
import { absolute, siteOrigin } from "@/lib/seo";

/**
 * /sitemap.xml: every page of the site a search engine should list.
 *
 *   - the fixed pages (home, pricing, promotion, about, before and after, the two lists, the legal pages)
 *   - every procedure and concern published in WordPress, and the Aptos page, at their own addresses
 *   - the blog and every article that has a page on this site, with the day each was last changed
 *
 * Left out on purpose: pages marked noindex (cart, checkout, order confirmed, account, /manage) and the
 * sale pages, which come and go with a campaign. Empty while SITE_URL is not set: a sitemap must name the
 * site's real address. A list WordPress cannot give is left out, the rest still shows.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteOrigin()) return [];

  const [procedures, concerns, aptos, blog] = await Promise.all([getProcedurePaths(), getConcernPaths(), getAptosSlugs(), getBlog()]);
  const articles = blog.stories.filter((s) => !s.external && s.href.startsWith("/"));
  const newest = articles.map((s) => s.modified).sort().at(-1);

  const pages: string[] = [
    pagePath("home"),
    pagePath("pricing"),
    pagePath("promotion"),
    pagePath("about"),
    pagePath("beforeAfter"),
    "/procedures",
    `/${CONCERN_FOLDER}`,
    ...aptos.map((slug) => `/${slug}`),
    ...procedures.map((p) => p.path),
    ...concerns.map((c) => c.path),
    pagePath("privacy"),
    pagePath("terms"),
    pagePath("refunds"),
  ];

  const entries: MetadataRoute.Sitemap = [
    ...pages.map((path) => ({ url: absolute(path) })),
    { url: absolute(pagePath("blog")), ...(newest ? { lastModified: newest } : {}) },
    ...articles.map((s) => ({ url: absolute(s.href), ...(s.modified ? { lastModified: s.modified } : {}) })),
  ];

  /* one entry per address, whatever the lists repeat */
  const seen = new Set<string>();
  return entries.filter((e) => !seen.has(e.url) && seen.add(e.url));
}
