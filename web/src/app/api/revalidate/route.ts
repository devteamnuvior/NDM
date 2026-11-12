import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { WP_TAGS } from "@/lib/wordpress";

/**
 * POST /api/revalidate: WordPress says "the price list changed" (the ndm-pricing plugin calls this after
 * a product, a variation or a category is saved in wp-admin), or "a page changed" (the ndm-headless
 * plugin, for the legal documents), and the cached copy is dropped. The call
 * must carry the shared secret; it can only clear the tags listed here, never read or change data.
 */
const TAGS = new Set<string>([WP_TAGS.pricing, WP_TAGS.type("pages")]);

function secretMatches(given: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret || secret.length < 32 || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

  if (!secretMatches(request.headers.get("x-ndm-revalidate"))) {
    return Response.json({ revalidated: false }, { status: 401, headers });
  }

  let tag: unknown;
  try {
    tag = ((await request.json()) as { tag?: unknown }).tag;
  } catch {
    tag = undefined;
  }
  if (typeof tag !== "string" || !TAGS.has(tag)) {
    return Response.json({ revalidated: false }, { status: 400, headers });
  }

  /* gone at once: the next visitor gets fresh prices, never an old one */
  revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: true }, { headers });
}
