/**
 * Monthly specials: the ten most-wanted treatments on the offers wheel. Price, unit and offer shown on
 * each card come from the price list (see components/specials/specials.tsx); the values here are only
 * used when a treatment is not on it.
 */

export type SpecialIconName = "pen" | "lips" | "syringe" | "hand" | "drop" | "face";

export type SpecialPhoto = "lip-filler" | "microneedling" | "chemical-peel" | "laser-resurfacing" | "photo-rejuvenation" | "skin-booster" | "sculptra-face" | "hands" | "crepey-arms" | "above-knee";

export interface Special {
  name: string;
  photo: SpecialPhoto;
  /** Focus point of the round photo. */
  position: string;
  /** Fallback price, without the dollar sign. */
  price: string;
  /** Fallback unit ("per syringe"); empty shows "for selected packages". */
  unit: string;
  /** Fallback offer; empty shows no badge. */
  deal: string;
  /** Category label on the card. */
  tag: string;
  area: "Face" | "Body";
  /** Line icon on the offers grid. */
  icon: SpecialIconName;
  /** Price-list category the Buy button opens on the pricing page. */
  category: string;
  text: string;
}

export const SPECIALS: Special[] = [
  { name: "Lip Filler", photo: "lip-filler", position: "50% 35%", price: "562.50", unit: "per syringe", deal: "Buy 1 get 1 50% off", tag: "Dermal Fillers", area: "Face", icon: "lips", category: "dermal-fillers", text: "Add volume, shape and definition to the lips." },
  { name: "Microneedling", photo: "microneedling", position: "50% 40%", price: "245", unit: "", deal: "Up to 50% off", tag: "Microneedling", area: "Face", icon: "pen", category: "microneedling", text: "Boost collagen for smoother, firmer skin." },
  { name: "Chemical Peel", photo: "chemical-peel", position: "50% 40%", price: "104.30", unit: "per session", deal: "Up to 30% off", tag: "Chemical Peel", area: "Face", icon: "drop", category: "chemical-peel", text: "Renew tone and texture with a tailored peel." },
  { name: "Laser Skin Resurfacing", photo: "laser-resurfacing", position: "50% 40%", price: "140", unit: "per session", deal: "Up to 30% off", tag: "Laser Skin Resurfacing", area: "Face", icon: "face", category: "laser-skin-resurfacing", text: "Resurface for clearer, smoother skin." },
  { name: "Photo Rejuvenation", photo: "photo-rejuvenation", position: "50% 40%", price: "192.50", unit: "per session", deal: "Up to 60% off", tag: "Photo-Rejuvenation", area: "Face", icon: "drop", category: "photo-rejuvenation", text: "Even out redness and sun spots." },
  { name: "Skin Booster", photo: "skin-booster", position: "50% 40%", price: "399", unit: "", deal: "Buy 1 get 1 50% off", tag: "Skin Booster and Bio-stimulators", area: "Face", icon: "drop", category: "skin-booster-and-bio-stimulators", text: "Deep hydration for a fresh, dewy glow." },
  { name: "Sculptra® Liquid Facelift", photo: "sculptra-face", position: "50% 45%", price: "699", unit: "", deal: "", tag: "Skin Booster and Bio-stimulators", area: "Face", icon: "syringe", category: "skin-booster-and-bio-stimulators", text: "Gradual, collagen-building facial lift." },
  { name: "Hand Rejuvenation with Radiesse®", photo: "hands", position: "50% 58%", price: "599", unit: "", deal: "", tag: "Skin Booster and Bio-stimulators", area: "Body", icon: "hand", category: "skin-booster-and-bio-stimulators", text: "Restore youthful volume to aging hands." },
  { name: "Crepey Arm Rejuvenation", photo: "crepey-arms", position: "50% 55%", price: "599", unit: "", deal: "", tag: "Skin Booster and Bio-stimulators", area: "Body", icon: "syringe", category: "skin-booster-and-bio-stimulators", text: "Smooth and firm crepey skin on the arms." },
  { name: "Above the Knee Tightening", photo: "above-knee", position: "50% 55%", price: "599", unit: "", deal: "", tag: "Skin Booster and Bio-stimulators", area: "Body", icon: "drop", category: "skin-booster-and-bio-stimulators", text: "Firm loose, sagging skin above the knees." },
];

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
