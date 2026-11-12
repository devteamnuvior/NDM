/** The clinic's financing page (live site). */
export const FINANCING_URL = "https://newdermamedlaserclinic.com/fees-financing/";

/**
 * Flexible payment plans. Affirm is the clinic's current partner; Klarna and Afterpay are placeholders
 * until the clinic confirms its other providers.
 */
export const AFFIRM_PREQUAL_URL = "https://www.affirm.ca/apps/prequal/?public_api_key=BHATVTE1I4OXSB6K&page_type=landing&use_promo=true&locale=en-CA&utm_source=mp_isw_view_prequal&unit_price=500";
export const PAYMENT_LOGOS: { name: string; src: string; height: string }[] = [
  { name: "Affirm", src: "https://cdn-assets.affirm.com/images/blue_logo-transparent_bg.png", height: "h-[17px]" },
  { name: "Klarna", src: "https://x.klarnacdn.net/payment-method/assets/badges/generic/klarna.svg", height: "h-[24px]" },
  { name: "Afterpay", src: "https://static.afterpay.com/integration/logo-afterpay-colour.svg", height: "h-[15px]" },
];
