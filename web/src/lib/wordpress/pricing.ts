import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PricingPatch, PricingSaveResult, WooAdminProduct, WooAdminTree, WooPricingTree } from "@/types/pricing";
import { wpFetch } from "./client";
import { WP_TAGS } from "./tags";

/**
 * The price list in WooCommerce, through the ndm-pricing plugin's routes (ndm/v1/pricing). WooCommerce
 * is the only place prices, products, variations and categories live; nothing here keeps a copy beyond
 * the page cache.
 */

const PATH = "ndm/v1/pricing";
/** Management requests read or write the whole list in one go: they may take longer than a page read. */
const ADMIN_TIMEOUT_MS = 30_000;

/**
 * The public price list. Cached and tagged: a save on the management screen, or a change made in
 * wp-admin (WordPress calls /api/revalidate), clears it; the hourly refresh is only a safety net.
 */
export async function getPricingTree(): Promise<WooPricingTree> {
  "use cache";
  cacheLife("hours");
  cacheTag(WP_TAGS.all, WP_TAGS.pricing);

  const { data } = await wpFetch<WooPricingTree>(PATH);
  return data;
}

/*
 * The management routes. Never cached, and always sent with the signed-in administrator's own
 * credentials (`authorization`): WordPress decides on every request whether that person may do it.
 */

export async function getPricingAdminUser(authorization: string): Promise<{ id: number; name: string }> {
  return (await wpFetch<{ id: number; name: string }>(`${PATH}/admin/me`, { authorization })).data;
}

export async function getPricingAdminTree(authorization: string): Promise<WooAdminTree> {
  return (await wpFetch<WooAdminTree>(`${PATH}/admin/tree`, { authorization, timeoutMs: ADMIN_TIMEOUT_MS })).data;
}

export async function searchPricingProducts(authorization: string, search: string, exclude: number[]): Promise<WooAdminProduct[]> {
  const { data } = await wpFetch<{ products: WooAdminProduct[] }>(`${PATH}/admin/products`, { authorization, query: { search, exclude }, timeoutMs: ADMIN_TIMEOUT_MS });
  return data.products;
}

export async function savePricing(authorization: string, patch: PricingPatch): Promise<PricingSaveResult> {
  return (await wpFetch<PricingSaveResult>(`${PATH}/admin/save`, { authorization, body: patch, timeoutMs: ADMIN_TIMEOUT_MS })).data;
}
