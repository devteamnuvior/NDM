/**
 * Prints the site's original ten offers (the cards of the Promotion page and the offers wheel) as JSON,
 * for the one-time import into WooCommerce:
 *
 *   node scripts/export-promotions.mjs | (cd ../cms && docker compose run --rm -T -v "<folder with the ten photos>:/tmp/promo:ro" cli wp ndm-pricing promotions --images=/tmp/promo)
 *
 * "key" names the WooCommerce product an offer hangs on (category slug | treatment, as imported by
 * export-price-list.mjs). "scope" keeps what each card showed before the move: "product" is that
 * treatment's lowest price and offer, "category" the lowest of its whole category. Photos are in
 * src/assets/images (promotion/ and treatments/); copy the ten named here into one folder for --images.
 *
 * After the import the offers are managed at /manage/promotions; this script is not part of the site.
 */
const BIO = "skin-booster-and-bio-stimulators";
const OFFERS = [
  { key: "dermal-fillers|Lip Enhancement", name: "Lip Filler", image: "lip-filler.jpg", focus: "50% 35%", area: "Face", icon: "lips", scope: "product", text: "Add volume, shape and definition to the lips." },
  { key: "microneedling|Microneedling-Face", name: "Microneedling", image: "microneedling.jpg", focus: "50% 40%", area: "Face", icon: "pen", scope: "category", text: "Boost collagen for smoother, firmer skin." },
  { key: "chemical-peel|Purifying Light Peel", name: "Chemical Peel", image: "chemical-peel.jpg", focus: "50% 40%", area: "Face", icon: "drop", scope: "category", text: "Renew tone and texture with a tailored peel." },
  { key: "laser-skin-resurfacing|Laser Skin Resurfacing Extra Small Area", name: "Laser Skin Resurfacing", image: "laser-resurfacing.jpg", focus: "50% 40%", area: "Face", icon: "face", scope: "category", text: "Resurface for clearer, smoother skin." },
  { key: "photo-rejuvenation|Photo-Rejuvenation Extra Small", name: "Photo Rejuvenation", image: "photo-rejuvenation.jpg", focus: "50% 40%", area: "Face", icon: "drop", scope: "category", text: "Even out redness and sun spots." },
  { key: `${BIO}|Skin Booster – HA (Hyaluronic Acid)`, name: "Skin Booster", image: "skin-booster.jpg", focus: "50% 40%", area: "Face", icon: "drop", scope: "product", text: "Deep hydration for a fresh, dewy glow." },
  { key: `${BIO}|Bio-Stimulator – Sculptra`, name: "Sculptra® Liquid Facelift", image: "sculptra-face.webp", focus: "50% 45%", area: "Face", icon: "syringe", scope: "product", text: "Gradual, collagen-building facial lift." },
  { key: `${BIO}|Bio-Stimulator – Radiesse`, name: "Hand Rejuvenation with Radiesse®", image: "hands.webp", focus: "50% 58%", area: "Body", icon: "hand", scope: "product", text: "Restore youthful volume to aging hands." },
  { key: `${BIO}|Bio-Stimulator – Crepey Arm Rejuvenation with Radiesse`, name: "Crepey Arm Rejuvenation", image: "crepey-arms.webp", focus: "50% 55%", area: "Body", icon: "syringe", scope: "category", text: "Smooth and firm crepey skin on the arms." },
  { key: `${BIO}|Bio-Stimulator – Above the Knee Tightening`, name: "Above the Knee Tightening", image: "above-knee.webp", focus: "50% 55%", area: "Body", icon: "drop", scope: "category", text: "Firm loose, sagging skin above the knees." },
];
process.stdout.write(JSON.stringify(OFFERS));
