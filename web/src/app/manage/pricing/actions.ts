"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { MANAGE_PATH, endPricingSession, requirePricingSession, revokeApplicationPassword } from "@/lib/pricing-admin/session";
import { WP_TAGS, WordPressError, getPricingAdminTree, savePricing, searchPricingProducts } from "@/lib/wordpress";
import type { PricingPatch, PricingSaveResult, WooAdminProduct, WooAdminTree } from "@/types/pricing";

/**
 * What the management screen may ask this server to do. Each call checks the session cookie and the
 * session's own token first, then goes to WordPress with the signed-in person's credentials, where
 * their right to manage WooCommerce is checked again. Nothing here trusts the screen.
 */

export type ActionResult<T> = { ok: true; data: T } | { ok: false; reason: "signed-out" | "forbidden" | "invalid" | "unreachable"; message: string };

const SIGNED_OUT = { ok: false, reason: "signed-out", message: "Your sign-in has ended. Please sign in again." } as const;

async function failure(error: unknown): Promise<ActionResult<never>> {
  if (error instanceof WordPressError && error.kind === "http") {
    if (error.status === 401) {
      await endPricingSession();
      return SIGNED_OUT;
    }
    if (error.status === 403) return { ok: false, reason: "forbidden", message: "This account may not manage the price list." };
    if (error.status === 400 || error.status === 404 || error.status === 409 || error.status === 415) return { ok: false, reason: "invalid", message: error.message };
  }
  if (!(error instanceof WordPressError)) throw error; /* a bug, not a WordPress answer */
  return { ok: false, reason: "unreachable", message: "WooCommerce could not be reached. Nothing was changed; please try again." };
}

const PATCH_KEYS = new Set(["createCategories", "categories", "categoryOrder", "products", "variations"]);
const MAX_PATCH_BYTES = 400_000;

/** A first look at the changes: the right outer shape and a sensible size. WordPress checks every field. */
function isPatch(value: unknown): value is PricingPatch {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  for (const [key, list] of Object.entries(value)) {
    if (!PATCH_KEYS.has(key) || !Array.isArray(list) || list.length > 1000) return false;
    if (key !== "categoryOrder" && list.some((entry) => typeof entry !== "object" || entry === null || Array.isArray(entry))) return false;
  }
  return JSON.stringify(value).length <= MAX_PATCH_BYTES;
}

export async function saveChangesAction(csrf: string, patch: PricingPatch): Promise<ActionResult<PricingSaveResult>> {
  const session = await requirePricingSession(csrf);
  if (!session) return SIGNED_OUT;
  if (!isPatch(patch)) return { ok: false, reason: "invalid", message: "These changes could not be read. Reload the page and try again." };

  try {
    const result = await savePricing(session.authorization, patch);
    updateTag(WP_TAGS.pricing); /* the public Pricing page shows the change on its next visit */
    return { ok: true, data: result };
  } catch (error) {
    return failure(error);
  }
}

export async function reloadTreeAction(csrf: string): Promise<ActionResult<WooAdminTree>> {
  const session = await requirePricingSession(csrf);
  if (!session) return SIGNED_OUT;
  try {
    return { ok: true, data: await getPricingAdminTree(session.authorization) };
  } catch (error) {
    return failure(error);
  }
}

export async function searchProductsAction(csrf: string, search: string, exclude: number[]): Promise<ActionResult<WooAdminProduct[]>> {
  const session = await requirePricingSession(csrf);
  if (!session) return SIGNED_OUT;
  if (typeof search !== "string" || !Array.isArray(exclude) || exclude.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { ok: false, reason: "invalid", message: "That search could not be read." };
  }
  try {
    return { ok: true, data: await searchPricingProducts(session.authorization, search.trim().slice(0, 100), exclude.slice(0, 1000)) };
  } catch (error) {
    return failure(error);
  }
}

/** Signs out: the application password is deleted in WordPress, so the cookie is worthless even if copied. */
export async function signOutAction(csrf: string): Promise<void> {
  const session = await requirePricingSession(csrf);
  if (session) await revokeApplicationPassword(session.authorization);
  await endPricingSession();
  redirect(MANAGE_PATH);
}
