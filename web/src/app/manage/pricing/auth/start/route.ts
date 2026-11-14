import { withBase } from "@/lib/base-path";
import { APP_ID, APP_NAME, MANAGE_PATH, isPricingAdminConfigured, newSignInState, siteOrigin, wordpressBase } from "@/lib/pricing-admin/session";

/**
 * Starts the sign-in: sends the browser to WordPress's own "authorize application" screen. The person
 * signs in there (their password never reaches this site) and approves; WordPress then returns to
 * /manage/pricing/auth/callback.
 */
export async function GET(request: Request) {
  const site = siteOrigin(request);
  if (!isPricingAdminConfigured() || !site) {
    return Response.redirect(new URL(withBase(`${MANAGE_PATH}?problem=setup`), request.url), 303);
  }

  const state = await newSignInState();
  /* which management screen asked: only a known name is passed on, never an address */
  const to = new URL(request.url).searchParams.get("to") === "promotions" ? "&to=promotions" : "";
  const target = new URL(`${wordpressBase()}/wp-admin/authorize-application.php`);
  target.searchParams.set("app_name", APP_NAME);
  target.searchParams.set("app_id", APP_ID);
  target.searchParams.set("success_url", `${site}${withBase(`${MANAGE_PATH}/auth/callback`)}?state=${state}${to}`);
  target.searchParams.set("reject_url", `${site}${withBase(MANAGE_PATH)}?problem=declined`);

  return new Response(null, { status: 303, headers: { Location: target.toString(), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
