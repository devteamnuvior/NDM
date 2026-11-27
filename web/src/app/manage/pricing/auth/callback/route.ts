import { WordPressError, getPricingAdminUser } from "@/lib/wordpress";
import { MANAGE_PATH, PROMOTIONS_PATH, basicAuth, isPricingAdminConfigured, revokeApplicationPassword, safeEqual, siteOrigin, startPricingSession, takeSignInState, wordpressOrigin } from "@/lib/pricing-admin/session";
import { withBase } from "@/lib/base-path";

/**
 * WordPress returns here after the person approved the sign-in, with their login and a new application
 * password. Before anything is kept: the answer must belong to the sign-in this browser started, come
 * from our WordPress, and the account must be allowed to manage the price list (WordPress says so).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const site = siteOrigin(request) ?? url.origin;
  /* back to the screen that asked for the sign-in: one of our two, chosen by name */
  const home = url.searchParams.get("to") === "promotions" ? PROMOTIONS_PATH : MANAGE_PATH;
  const back = (problem?: string) =>
    new Response(null, {
      status: 303,
      headers: { Location: `${site}${withBase(home)}${problem ? `?problem=${problem}` : ""}`, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });

  if (!isPricingAdminConfigured()) return back("setup");

  const expected = await takeSignInState();
  const state = url.searchParams.get("state");
  const login = url.searchParams.get("user_login");
  const password = url.searchParams.get("password");
  const from = url.searchParams.get("site_url");

  if (!expected || !state || !safeEqual(state, expected)) return back("expired");
  if (!login || !password || login.length > 100 || password.length > 100) return back("declined");

  const authorization = basicAuth(login, password);

  let sameSite = false;
  try {
    sameSite = !!from && new URL(from).origin === wordpressOrigin();
  } catch {
    sameSite = false;
  }
  if (!sameSite) return back("expired");

  try {
    const user = await getPricingAdminUser(authorization);
    await startPricingSession(login, password, user.name);
    return back();
  } catch (error) {
    if (error instanceof WordPressError && error.kind === "http" && (error.status === 403 || error.status === 401)) {
      /* a real WordPress account, but not one that may manage the price list: take the access away again */
      await revokeApplicationPassword(authorization);
      return back("forbidden");
    }
    return back("unreachable");
  }
}
