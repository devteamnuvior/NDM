import { findEntry, getCartCatalog } from "@/lib/cart-catalog";
import { WordPressError } from "@/lib/wordpress";

/**
 * POST /api/cart/check: the browser's cart asks what WooCommerce says about its lines. For each line
 * the answer is the current name, option and price, or null when it is no longer on the price list.
 * It reads the same public data the Pricing page shows; nothing personal is sent or kept.
 */
const MAX_LINES = 100;

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

  let lines: unknown;
  try {
    lines = ((await request.json()) as { lines?: unknown }).lines;
  } catch {
    lines = null;
  }
  if (!Array.isArray(lines) || lines.length > MAX_LINES) {
    return Response.json({ error: "invalid" }, { status: 400, headers });
  }

  try {
    const catalog = await getCartCatalog();
    const answer = lines.map((line) => (typeof line === "object" && line !== null ? findEntry(catalog, line as Record<string, unknown>) : null));
    return Response.json({ lines: answer }, { headers });
  } catch (error) {
    if (!(error instanceof WordPressError)) throw error;
    /* WooCommerce cannot be reached: the cart stays as it is, and the order step checks again */
    return Response.json({ error: "unavailable" }, { status: 503, headers });
  }
}
