import type { NextConfig } from "next";

/**
 * While the site is migrated section by section, pages that Next.js does not serve yet can be passed
 * through to the original static prototype. Set LEGACY_ORIGIN (for example http://localhost:5174, the
 * prototype served with `python3 -m http.server 5174` from the repository root) to turn this on.
 */
const legacyOrigin = process.env.LEGACY_ORIGIN?.replace(/\/+$/, "");

/**
 * The folder the site is served from, at build time: empty at a domain's root (the default),
 * "/react" when it shares https://newdermamedlaserclinic.com/react with WordPress. It becomes
 * NEXT_PUBLIC_BASE_PATH for `withBase` (src/lib/base-path.ts) on the server and in the browser.
 */
const basePath = (process.env.NEXT_BASE_PATH ?? "").trim().replace(/\/+$/, "");
if (basePath && !/^\/[a-z0-9-]+$/.test(basePath)) throw new Error(`NEXT_BASE_PATH must look like "/react", not "${basePath}"`);

const nextConfig: NextConfig = {
  /* a second build (for example the /react one) can go to its own folder, leaving .next as it is */
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  /* a migrated page keeps answering at its original address */
  async redirects() {
    return [
      { source: "/pricing.html", destination: "/pricing", permanent: false },
      { source: "/promotion.html", destination: "/promotion", permanent: false },
      { source: "/before-after.html", destination: "/before-after", permanent: false },
      { source: "/aptos-thread-lift.html", destination: "/aptos-thread-lift", permanent: false },
      { source: "/botox.html", destination: "/botox", permanent: false },
      { source: "/about.html", destination: "/about", permanent: false },
      { source: "/blog.html", destination: "/blog", permanent: false },
      { source: "/black-friday-sale.html", destination: "/black-friday-sale", permanent: false },
      { source: "/privacy.html", destination: "/privacy", permanent: false },
      { source: "/terms.html", destination: "/terms", permanent: false },
      { source: "/refunds.html", destination: "/refunds", permanent: false },
      { source: "/what-causes-rosacea-redness.html", destination: "/what-causes-rosacea-redness", permanent: false },
      { source: "/wrinkles-fine-lines.html", destination: "/wrinkles-fine-lines", permanent: false },
      { source: "/account.html", destination: "/account", permanent: false },
      { source: "/cart.html", destination: "/cart", permanent: false },
      { source: "/checkout.html", destination: "/checkout", permanent: false },
      { source: "/order-confirmed.html", destination: "/order-confirmed", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      /* a file of the prototype ("/account.html", "/black-friday.html") is asked for before the
         route "/[slug]" (procedure and concern pages) gets to answer for every one-part address */
      afterFiles: legacyOrigin ? [{ source: "/:file([^/]+\\.[^/]+)", destination: `${legacyOrigin}/:file` }] : [],
      fallback: legacyOrigin ? [{ source: "/:path*", destination: `${legacyOrigin}/:path*` }] : [],
    };
  },
};

export default nextConfig;
