/**
 * The folder the site is served from: "" at a domain's root (the default), "/react" when it shares
 * https://newdermamedlaserclinic.com/react with WordPress. Set at build time with NEXT_BASE_PATH (see
 * next.config.ts); the same value reaches the browser through NEXT_PUBLIC_BASE_PATH.
 *
 * Next.js adds the folder by itself to `Link`, `router.push`, redirects, `next/image` imports, fonts and
 * its own files. Everything else written as an address from the root ("/pricing", "/assets/...",
 * fetch("/api/...")) goes through `withBase`, where it is rendered or requested.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/**
 * An address of this site with the folder in front: "/pricing" -> "/react/pricing". Anything else is
 * returned unchanged: "#book", "https://...", "//cdn...", "tel:", "mailto:", an address that already
 * starts with the folder, and values that are not text (an imported image). Safe to apply twice.
 */
export function withBase<T>(url: T): T {
  if (!BASE_PATH || typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) return url;
  if (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`) || url.startsWith(`${BASE_PATH}?`) || url.startsWith(`${BASE_PATH}#`)) return url;
  return `${BASE_PATH}${url}` as T;
}

/** A `srcset` list ("/a.webp 720w, /b.webp 1440w") with the folder in front of each address. */
export function withBaseSrcSet<T>(srcSet: T): T {
  if (!BASE_PATH || typeof srcSet !== "string") return srcSet;
  return srcSet
    .split(",")
    .map((part) => part.replace(/^(\s*)(\S+)/, (_, space: string, url: string) => space + withBase(url)))
    .join(",") as T;
}

/** A path as the browser shows it without the folder: "/react/pricing" -> "/pricing" (for comparing with the site's own paths). */
export function withoutBase(path: string): string {
  if (!BASE_PATH) return path;
  if (path === BASE_PATH) return "/";
  return path.startsWith(`${BASE_PATH}/`) ? path.slice(BASE_PATH.length) : path;
}

/** Root-relative `href` and `src` addresses inside HTML that came from WordPress, with the folder in front. */
export function withBaseHtml(html: string): string {
  if (!BASE_PATH) return html;
  return html.replace(/(\s(?:href|src)=)(["'])(\/(?!\/)[^"']*)\2/g, (_, attr: string, quote: string, url: string) => `${attr}${quote}${withBase(url)}${quote}`);
}
