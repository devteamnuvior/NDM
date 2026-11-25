import type { MetadataRoute } from "next";
import { withBase } from "@/lib/base-path";
import { absolute, siteOrigin } from "@/lib/seo";

/**
 * /robots.txt: the whole site may be read, except the site's own data routes and the management
 * screens. Cart, checkout, order confirmed and account are not listed here on purpose: they carry
 * "noindex" in the page, which a search engine can only see when it is allowed to read the page.
 * The sitemap line needs the site's real address, so it is left out while SITE_URL is not set.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: withBase("/"), disallow: [withBase("/api/"), withBase("/manage")] }],
    ...(siteOrigin() ? { sitemap: absolute("/sitemap.xml") } : {}),
  };
}
