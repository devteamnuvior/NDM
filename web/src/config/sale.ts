import type { SaleCopy } from "@/types/sale";

/*
 * The 2026 holiday sale on this site: what is not in WooCommerce. Prices, the lines in the sale, the checkout
 * code and the dates are WooCommerce's (the ndm-pricing plugin's campaign, cms/campaigns/holiday-sale-2026.json).
 * Offers, dates and terms need Raymond's written approval before the public sees them.
 */

/**
 * The campaign's headline, "Up to 60% off", as decided for its advertising. It is a stated claim, not a number
 * worked out from the price list; without a campaign the pages show the best percentage among their deals.
 */
export const SALE_HEADLINE = 60;

/** The badge on the deal cards, by the campaign's phase. */
export const SALE_BADGES: Record<string, string> = { vip: "SALE PRICE", "black-friday": "BLACK FRIDAY PRICE", "cyber-monday": "CYBER MONDAY PRICE", extended: "EXTENDED PRICE" };

/** Beside the countdown, by phase; a phase not named here says "<its name> ends in". */
export const SALE_TIMERS: Record<string, string> = { "black-friday": "Offers end in", "cyber-monday": "Ends", extended: "Ends" };

/**
 * The cards of "Sale prices": a title and a quantity, and which line of the WooCommerce price list gives the
 * price (product name, as either copy of the price list calls it, and option; case and dashes do not matter).
 * No price is written here; a card whose line is not in the sale is left out.
 * `drug`: a prescription product, shown by name, quantity and price only and kept out of the header's tickets.
 */
export const SALE_PRICE_CARDS: { title: string; qty: string; product: string[]; option: string; drug?: boolean }[] = [
  { title: "Botox®", qty: "60 units", product: ["Botox Cosmetic", "Botox"], option: "60 units", drug: true },
  { title: "Lip filler", qty: "2 syringes", product: ["Lip Enhancement"], option: "2 Syringes" },
  { title: "Cheek and smile-line filler", qty: "2 syringes", product: ["Standard Contour Areas"], option: "2 Syringes" },
  { title: "Sculptra®", qty: "1 vial", product: ["Bio-Stimulator – Sculptra"], option: "1 Vial" },
  { title: "Radiesse®", qty: "1 syringe", product: ["Bio-Stimulator – Radiesse"], option: "1 Syringe" },
  { title: "Skin booster", qty: "1 syringe", product: ["Skin Booster – HA (Hyaluronic Acid)"], option: "1 syringe" },
  { title: "Aptos thread lift", qty: "Face, mid and lower", product: ["Aptos Excellence Visage Method EV PLA/PCL (up to 24 months)", "Aptos Excellence Visage Thread Method"], option: "Face – Mid & Lower" },
];

const GROUPS: SaleCopy["deals"]["groups"] = [
  { category: "laser-hair-removal", tab: "Laser" },
  { category: "laser-acne-treatment", tab: "Laser" },
  { category: "laser-skin-resurfacing", tab: "Laser" },
  { category: "photo-rejuvenation", tab: "Laser" },
  { category: "4d-rejuvalift", tab: "Laser" },
  { category: "2d-3d-laser-skin-tightening", tab: "Laser" },
  { category: "2d-3d-laser-rejuvenation", tab: "Laser" },
  { category: "microneedling", tab: "Skin" },
  { category: "chemical-peel", tab: "Skin" },
  { category: "botox-dysport", tab: "Injectables" },
  { category: "dermal-fillers", tab: "Injectables" },
  { category: "skin-booster-and-bio-stimulators", tab: "Injectables" },
  { category: "aptos-thread-method", tab: "Thread lift" },
  { category: "coolsculpting-tight-sculpting", tab: "Body" },
  { category: "hair-loss", tab: "Hair" },
  { category: "laser-vaginal-tightening", tab: "Wellness" },
];

/* the prescription product sits under no concern; facials, depigmenting and vein treatments are not in the sale */
const CONCERNS: SaleCopy["concerns"]["items"] = [
  { name: "Unwanted hair", text: "Choose your area and laser hair removal package.", categories: ["laser-hair-removal"] },
  { name: "Lines and wrinkles", text: "Treatments that may soften lines and refresh the skin.", categories: ["dermal-fillers", "skin-booster-and-bio-stimulators", "microneedling", "laser-skin-resurfacing", "4d-rejuvalift"] },
  { name: "Loose or sagging skin", text: "Lifting and tightening for the face, neck and body.", categories: ["aptos-thread-method", "2d-3d-laser-skin-tightening", "4d-rejuvalift", "skin-booster-and-bio-stimulators"] },
  { name: "Volume and contour", text: "Lips, cheeks, jawline and more.", categories: ["dermal-fillers", "skin-booster-and-bio-stimulators", "aptos-thread-method"] },
  { name: "Stubborn fat", text: "Non-invasive body contouring.", categories: ["coolsculpting-tight-sculpting"] },
  { name: "Acne and scars", text: "Laser, peels and microneedling.", categories: ["laser-acne-treatment", "microneedling", "chemical-peel", "laser-skin-resurfacing"] },
  { name: "Spots and pigment", text: "Options for an uneven skin tone.", categories: ["photo-rejuvenation", "chemical-peel", "2d-3d-laser-rejuvenation"] },
  { name: "Hair thinning", text: "PRP scalp treatments.", categories: ["hair-loss"] },
  { name: "Intimate wellness", text: "Laser vaginal tightening.", categories: ["laser-vaginal-tightening"] },
];

const GIFT = "+$200 gift with your purchase · first 20 purchases · given in clinic";
const FINE_PRINT =
  "Selected packages only; single sessions at regular price. Code {{code}} applies to eligible packages. Injectables and Aptos at fixed sale prices. Not included: laser vein, facials, depigmenting, non-surgical butt lift, hip dip, snoring, toenail, Latisse, Dysport, hyperhidrosis, laser hair rejuvenation, filler single syringes, filler 3 and 4 syringes, filler combination packages, Belkyra. Consultation required. Individual results may vary.";
const HOW: SaleCopy["how"] = [
  { title: "Choose", text: "your treatment" },
  { title: "Pick", text: "your package and add it to your plan" },
  { title: "Check out", text: "with code {{code}} for your full sale price" },
];
const PLAN_NOTE = "Prices in CAD, before tax. Code {{code}} applies to eligible packages. Consultation required before treatment.";

/** What the two sale pages share; each page's own words follow. */
export const SALE_SHARED = { groups: GROUPS, concerns: CONCERNS, gift: GIFT, finePrint: FINE_PRINT, how: HOW, planNote: PLAN_NOTE };

/** The Black Friday page's words (its phases, labels and dates are the campaign's). */
export const BLACK_FRIDAY_COPY: SaleCopy = {
  title: "Black Friday 2026: Up to {{max}}% Off Treatments | NewDermaMed Toronto",
  description: "NewDermaMed Black Friday: up to {{max}}% off selected treatment packages at our Uptown and Downtown Toronto clinics. Build your plan and check out with code {{code}}.",
  noindex: false,
  name: "Black Friday",
  starts: "2026-11-20 00:00",
  ends: "2026-12-07 23:59",
  hero: {
    lead: "Black",
    strong: "Friday",
    offer: "selected treatment packages",
    text: "Up to {{max}}% off selected treatment packages, plus a $200 gift with your purchase. Add code {{code}} at checkout for your full sale price.",
    photo: { src: "/assets/hero/clinic-exterior.jpg", width: 1536, height: 1024 },
  },
  gift: GIFT,
  tape: ["{{phase}}", "Up to {{max}}% off", "+$200 gift with your purchase", "Code {{code}} at checkout", "Free consultation and VISIA® skin analysis", "Uptown and Downtown Toronto"],
  how: HOW,
  concerns: { lead: "What brings you", strong: "in today?", text: "Tap a concern and we shortlist the Black Friday deals for it. Tap it again to see everything.", items: CONCERNS },
  deals: { lead: "Build", strong: "your plan.", text: "Add any package to your plan and your savings add up below. Then check out with code {{code}}, or book a free consultation first.", groups: GROUPS },
  specials: { tag: "Fixed sale prices", lead: "Sale", strong: "prices", count: 7 },
  plan: { lead: "All your favourites,", strong: "together.", note: PLAN_NOTE },
  clinics: { tag: "Two Toronto clinics", lead: "Find your", strong: "NewDermaMed." },
  footer: { lead: "Black Friday ends", text: "Book your free consultation and VISIA® skin analysis, or check out with code {{code}}.", terms: FINE_PRINT },
};
