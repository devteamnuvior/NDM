import type { VipSaleCopy } from "@/types/vip-sale";
import json from "./vip-sale.json";

/**
 * The VIP Sale page's built-in settings and words: what the page shows when WordPress cannot be reached,
 * has no VIP Sale page, or the page is not published, and the source of the one-time import
 * (`node scripts/export-vip-sale.mjs | wp ndm vip-sale-import`). Edit the live page in WordPress, not here.
 * No price or percentage is written there: {{max}} is the best offer on the WooCommerce price list.
 * Dates, offers and terms are placeholders until Raymond approves them.
 */
export const VIP_SALE_COPY: VipSaleCopy = json;

/** The page's address on the site, whatever its name in WordPress. */
export const VIP_SALE_PATH = "/vip-sale";
