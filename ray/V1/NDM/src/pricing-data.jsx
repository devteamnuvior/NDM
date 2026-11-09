/* Prices live in ONE place: src/live/pricing.json (the single source of truth).
   build_pricing.py generates the PRICE_CATS array from it, so editing pricing.json updates the
   pricing page, the treatment/concern pages and the promotion offers on rebuild. This file holds
   only the curated Monthly Specials, whose prices are read live from PRICE_CATS (see specialFrom). */

/* the live pricing page's "EXCLUSIVE MONTHLY SPECIALS" block (approval item C2, 7 Nov 2026): name, price and the price list section each "Buy" opens */
/* each card is [display name, treatment name in PRICE_CATS or '' for the whole category, category section id];
   the price is not stored, it is read live from the cheapest option (see specialFrom), so editing the
   price list below updates these cards automatically. the most popular treatment types in the market,
   spread across face, body, skin and hair; prescription drugs (Botox, Dysport) are kept out of this
   promo block. '' = show the lowest price anywhere in that category (its label is the category);
   a named treatment = show that one treatment's lowest option (so the label stays accurate). */
const PRICE_SPECIALS = { title: 'Exclusive monthly specials', sub: 'Save on cosmetic treatment, apply for financing now', note: 'for selected packages', items: [
  ['Laser Hair Removal', '', 'pg-laser-hair-removal'], ['Lip Filler', 'Lip Enhancement', 'pg-dermal-fillers'], ['Microneedling', '', 'pg-microneedling'], ['Chemical Peel', '', 'pg-chemical-peel'],
  ['CoolSculpting', 'Regular Treatment Zone', 'pg-coolsculpting-tight-sculpting'], ['Photo Rejuvenation', '', 'pg-photo-rejuvenation'], ['PRP Hair Restoration', 'PRP Scalp - Small', 'pg-hair-loss'], ['Sculptra', 'Bio-Stimulator – Sculptra', 'pg-skin-booster-and-bio-stimulators'],
] };
