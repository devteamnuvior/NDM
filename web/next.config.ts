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

/**
 * How many workers a build may start. Next.js counts the machine's CPUs, which inside the live server's
 * build container is all 32 of the host's although the container is capped at 8 CPUs and 4 GB: 31 workers
 * do not fit in that memory. scripts/deploy-live.sh sets NEXT_BUILD_CPUS=8; unset, Next.js decides.
 */
const buildCpus = Number(process.env.NEXT_BUILD_CPUS) || 0;

/**
 * Photos kept in WordPress's media library may go through the image optimizer (src/lib/optimized-image.ts):
 * only files under wp-content/uploads of the WordPress this site reads (WORDPRESS_PUBLIC_URL, WORDPRESS_API_URL).
 * A WordPress on this machine (local work) is a local address, which the optimizer refuses unless told otherwise.
 */
const wordpressUploads = [process.env.WORDPRESS_PUBLIC_URL, process.env.WORDPRESS_API_URL].flatMap((raw) => {
  try {
    const url = new URL((raw ?? "").trim());
    const folder = url.pathname.replace(/\/wp-json.*$/, "").replace(/\/+$/, "");
    return [{ protocol: url.protocol.replace(":", "") as "http" | "https", hostname: url.hostname, port: url.port, pathname: `${folder}/wp-content/uploads/**` }];
  } catch {
    return [];
  }
});
const wordpressIsLocal = wordpressUploads.some((p) => p.hostname === "localhost" || p.hostname === "127.0.0.1");

const nextConfig: NextConfig = {
  ...(buildCpus > 0 ? { experimental: { cpus: buildCpus } } : {}),
  /* a second build (for example the /react one) can go to its own folder, leaving .next as it is */
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    remotePatterns: wordpressUploads,
    qualities: [60, 75],
    ...(wordpressIsLocal ? { dangerouslyAllowLocalIP: true } : {}),
  },
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
      { source: "/botox.html", destination: "/injectables/botox", permanent: false },
      { source: "/about.html", destination: "/about", permanent: false },
      { source: "/blog.html", destination: "/blog", permanent: false },
      { source: "/black-friday-sale.html", destination: "/black-friday", permanent: false },
      { source: "/black-friday-sale", destination: "/black-friday", permanent: false },
      { source: "/vip-sale.html", destination: "/vip-sale", permanent: false },
      { source: "/privacy.html", destination: "/privacy", permanent: false },
      { source: "/terms.html", destination: "/terms", permanent: false },
      { source: "/refunds.html", destination: "/refunds", permanent: false },
      { source: "/what-causes-rosacea-redness.html", destination: "/blog/what-causes-rosacea-redness", permanent: false },
      { source: "/wrinkles-fine-lines.html", destination: "/concerns/wrinkles-fine-lines", permanent: false },
      /* pages made from a WordPress post moved into their post type's folder (src/lib/post-paths.ts); a post
         added later is sent on by the page "/[slug]" itself */
      { source: "/botox", destination: "/injectables/botox", permanent: false },
      { source: "/wrinkles-fine-lines", destination: "/concerns/wrinkles-fine-lines", permanent: false },
      { source: "/what-causes-rosacea-redness", destination: "/blog/what-causes-rosacea-redness", permanent: false },
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
         route "/[slug]" (the Aptos page and the old addresses of post pages) gets to answer for every one-part address */
      afterFiles: legacyOrigin ? [{ source: "/:file([^/]+\\.[^/]+)", destination: `${legacyOrigin}/:file` }] : [],
      fallback: legacyOrigin ? [{ source: "/:path*", destination: `${legacyOrigin}/:path*` }] : [],
    };
  },
};

export default nextConfig;
