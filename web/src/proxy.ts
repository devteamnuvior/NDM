import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Page addresses are lowercase. The old WordPress site answered an address whatever its capitals, so ads,
 * emails and other sites still hold links like "/Skin/Medical-Dermatology/mole-removal": send those to
 * the lowercase address for good (301) instead of "not found". Only the path changes; what follows "?"
 * is kept as typed (order keys, reset tokens), and so are %XX escapes.
 */
export function lowercasePath(pathname: string): string {
  return pathname.replace(/%[0-9A-Fa-f]{2}|[A-Z]+/g, (part) => (part[0] === "%" ? part : part.toLowerCase()));
}

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  const lower = lowercasePath(request.nextUrl.pathname);
  if (lower === request.nextUrl.pathname) return NextResponse.next();
  /* Next.js sends a redirect to the same site as a path ("/pricing"), so the server's own host
     (127.0.0.1 behind Apache) never reaches a visitor */
  const url = request.nextUrl.clone();
  url.pathname = lower;
  return NextResponse.redirect(url, 301);
}

export const config = {
  /* pages only: never Next.js's own files, the API, the management screens, the public assets, or any
     file (a last part with a dot), whose names may have capitals */
  matcher: ["/((?!_next/|api/|manage|assets/|\\.well-known/|.*\\.[^/]+$).*)"],
};
