"use server";

import { updateTag } from "next/cache";
import { requirePricingSession, endPricingSession } from "@/lib/pricing-admin/session";
import { WP_TAGS, WordPressError, savePromotions } from "@/lib/wordpress";
import { PROMO_AREAS, PROMO_ICONS, PROMO_MAX, PROMO_SCOPES, type PromotionInput, type WooAdminPromotion } from "@/types/promotions";
import type { ActionResult } from "@/app/manage/pricing/actions";

/**
 * What the offers' management screen may ask this server to do. As with the price list: the session
 * cookie and the session's own token are checked first, then WordPress checks, with the signed-in
 * person's credentials, that they may manage WooCommerce, and checks every field again.
 */

const FOCUS = /^\d{1,3}% \d{1,3}%$/;

function isOffer(value: unknown): value is PromotionInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    Number.isInteger(o.productId) &&
    (o.productId as number) > 0 &&
    typeof o.name === "string" &&
    o.name.length <= 200 &&
    typeof o.text === "string" &&
    o.text.length <= 600 &&
    PROMO_AREAS.includes(o.area as never) &&
    PROMO_ICONS.includes(o.icon as never) &&
    PROMO_SCOPES.includes(o.scope as never) &&
    typeof o.focus === "string" &&
    FOCUS.test(o.focus) &&
    (o.imageId === undefined || (Number.isInteger(o.imageId) && (o.imageId as number) > 0))
  );
}

export async function savePromotionsAction(csrf: string, offers: PromotionInput[]): Promise<ActionResult<WooAdminPromotion[]>> {
  const session = await requirePricingSession(csrf);
  if (!session) return { ok: false, reason: "signed-out", message: "Your sign-in has ended. Please sign in again." };
  if (!Array.isArray(offers) || offers.length > PROMO_MAX || !offers.every(isOffer)) {
    return { ok: false, reason: "invalid", message: "These offers could not be read. Reload the page and try again." };
  }

  try {
    /* only the known fields go on: nothing else the screen may have sent */
    const clean = offers.map(({ productId, name, text, area, icon, focus, scope, imageId }): PromotionInput => ({ productId, name, text, area, icon, focus, scope, ...(imageId ? { imageId } : {}) }));
    const saved = await savePromotions(session.authorization, clean);
    /* the Promotion page, the home page's wheel and the Black Friday page show the change on their next visit */
    updateTag(WP_TAGS.promotions);
    updateTag(WP_TAGS.pricing);
    return { ok: true, data: saved };
  } catch (error) {
    if (!(error instanceof WordPressError)) throw error; /* a bug, not a WordPress answer */
    if (error.kind === "http") {
      if (error.status === 401) {
        await endPricingSession();
        return { ok: false, reason: "signed-out", message: "Your sign-in has ended. Please sign in again." };
      }
      if (error.status === 403) return { ok: false, reason: "forbidden", message: "This account may not manage the offers." };
      if (error.status === 400 || error.status === 404 || error.status === 409 || error.status === 415) return { ok: false, reason: "invalid", message: error.message };
    }
    return { ok: false, reason: "unreachable", message: "WooCommerce could not be reached. Nothing was changed; please try again." };
  }
}
