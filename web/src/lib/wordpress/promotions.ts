import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PromotionInput, WooAdminPromotion, WooPromotion } from "@/types/promotions";
import { wpFetch } from "./client";
import { getWordPressConfig } from "./config";
import { WordPressError } from "./errors";
import { WP_TAGS } from "./tags";

/**
 * The current offers in WooCommerce, through the ndm-pricing plugin's routes (ndm/v1/promotions).
 * Which treatments are on offer, their card text and their photo live in WooCommerce; their prices are
 * the price list's.
 */

const PATH = "ndm/v1/promotions";
const ADMIN_TIMEOUT_MS = 30_000;

/**
 * The public offers. Cached with the price list's tag as well: an offer shows prices, so whatever
 * clears the price list (a save, a change in wp-admin) clears this too.
 */
export async function getPromotions(): Promise<WooPromotion[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.pricing, WP_TAGS.promotions);

  const { data } = await wpFetch<{ offers: WooPromotion[] }>(PATH);
  return data.offers;
}

/* The management routes: never cached, always with the signed-in administrator's own credentials. */

export async function getAdminPromotions(authorization: string): Promise<WooAdminPromotion[]> {
  return (await wpFetch<{ offers: WooAdminPromotion[] }>(`${PATH}/admin`, { authorization, timeoutMs: ADMIN_TIMEOUT_MS })).data.offers;
}

export async function savePromotions(authorization: string, offers: PromotionInput[]): Promise<WooAdminPromotion[]> {
  return (await wpFetch<{ offers: WooAdminPromotion[] }>(`${PATH}/admin/save`, { authorization, body: { offers }, timeoutMs: ADMIN_TIMEOUT_MS })).data.offers;
}

/**
 * Puts a photo in WordPress's media library (its own route, which checks that this person may upload
 * files) and answers with its ID and address. The file's bytes and type were checked by the caller.
 */
export async function uploadPromotionPhoto(authorization: string, file: { bytes: ArrayBuffer; type: string; name: string }): Promise<{ id: number; src: string }> {
  const path = "wp/v2/media";
  let response: Response;
  try {
    response = await fetch(`${getWordPressConfig().apiUrl}/${path}`, {
      method: "POST",
      headers: { Authorization: authorization, Accept: "application/json", "Content-Type": file.type, "Content-Disposition": `attachment; filename="${file.name}"` },
      body: file.bytes,
      signal: AbortSignal.timeout(60_000),
      redirect: "error",
    });
  } catch (cause) {
    throw new WordPressError("network", "WordPress could not be reached.", { path, cause });
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new WordPressError("parse", `WordPress answered ${response.status} with something that is not JSON.`, { path, status: response.status, cause });
  }
  const media = body as { id?: unknown; source_url?: unknown; message?: unknown; code?: unknown };
  if (!response.ok || typeof media.id !== "number" || typeof media.source_url !== "string") {
    throw new WordPressError("http", typeof media.message === "string" ? media.message : `WordPress answered ${response.status}.`, { path, status: response.ok ? 502 : response.status, code: typeof media.code === "string" ? media.code : undefined });
  }
  return { id: media.id, src: media.source_url };
}
