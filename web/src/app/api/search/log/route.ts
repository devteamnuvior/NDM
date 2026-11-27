import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { searchSite } from "@/lib/search";
import { SEARCH_MAX_QUERY, searchKey } from "@/lib/search-match";
import { isWordPressConfigured, logSearchTerm, settle, WP_TAGS } from "@/lib/wordpress";

/**
 * POST /api/search/log { q, picked }: counts one search for the Popular chips.
 *
 * What is counted is never the text a visitor typed. The server runs the search again and counts the
 * name of one of its own results: the one the visitor chose (`picked`), which must be among them.
 * Anything else counts nothing. So the Popular chips can only ever show names that already exist on
 * the site, and nothing about the visitor is kept.
 */

/** One browser may count this many searches a minute; more are quietly dropped. */
const PER_MINUTE = 20;
const WINDOW_MS = 60_000;
const recent = new Map<string, number[]>();

function allowed(who: string): boolean {
  const now = Date.now();
  if (recent.size > 5000) recent.clear();
  const times = (recent.get(who) ?? []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= PER_MINUTE) {
    recent.set(who, times);
    return false;
  }
  times.push(now);
  recent.set(who, times);
  return true;
}

const done = (counted: boolean) => Response.json({ counted }, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

export async function POST(request: Request) {
  if (!isWordPressConfigured()) return done(false);

  let body: { q?: unknown; picked?: unknown };
  try {
    body = (await request.json()) as { q?: unknown; picked?: unknown };
  } catch {
    return done(false);
  }
  const q = typeof body.q === "string" ? body.q.trim() : "";
  if (q.length < 2 || q.length > SEARCH_MAX_QUERY) return done(false);

  /* only used to slow down a flood, in memory, never stored */
  const who = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(who)) return done(false);

  const hits = await searchSite(q);
  const picked = typeof body.picked === "string" ? searchKey(body.picked) : "";
  const hit = picked ? hits.find((h) => searchKey(h.name) === picked) : undefined;
  if (!hit) return done(false);

  /* the visitor does not wait for WordPress */
  after(async () => {
    const logged = await settle(() => logSearchTerm(hit.name));
    /* the next visitor who opens the search sees the new order */
    if (logged.ok) revalidateTag(WP_TAGS.search, { expire: 0 });
  });
  return done(true);
}
