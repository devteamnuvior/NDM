/**
 * Site features that can be switched off without deleting their code.
 *
 * offerPopup: the first-visit offer pop-up ("10% off", components/layout/offer-popup.tsx). Switched off on
 * the user's request (2026-11-13): it is not rendered on any page, so no timer, scroll depth, exit intent or
 * "?offer" preview can open it, and its code is left out of the browser bundle. Set to true to bring it back;
 * its component, styles and tests are kept as they were.
 */
export const FEATURES = {
  offerPopup: false,
} as const;
