import { connection } from "next/server";
import { getWordPressHealth, isWordPressConfigured, settle } from "@/lib/wordpress";

/**
 * GET /api/cms/health: can this server reach WordPress? Answers at request time (never prerendered,
 * never cached) and says only "ok" or the kind of failure: no address, no credentials, no details.
 */
export async function GET() {
  await connection();

  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

  if (!isWordPressConfigured()) {
    return Response.json({ wordpress: "not-configured" }, { status: 503, headers });
  }

  const health = await settle(getWordPressHealth);
  if (!health.ok) {
    return Response.json({ wordpress: "unreachable", reason: health.error.kind }, { status: 503, headers });
  }
  return Response.json({ wordpress: "ok", environment: health.data.environment }, { headers });
}
