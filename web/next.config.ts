import type { NextConfig } from "next";

/**
 * While the site is migrated section by section, pages that Next.js does not serve yet can be passed
 * through to the original static prototype. Set LEGACY_ORIGIN (for example http://localhost:5174, the
 * prototype served with `python3 -m http.server 5174` from the repository root) to turn this on.
 */
const legacyOrigin = process.env.LEGACY_ORIGIN?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
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
      { source: "/cart.html", destination: "/cart", permanent: false },
      { source: "/checkout.html", destination: "/checkout", permanent: false },
      { source: "/order-confirmed.html", destination: "/order-confirmed", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: legacyOrigin ? [{ source: "/:path*", destination: `${legacyOrigin}/:path*` }] : [],
    };
  },
};

export default nextConfig;
