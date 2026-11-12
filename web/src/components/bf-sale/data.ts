import type { Offer } from "@/components/specials/offers";
import { PRICE_CATEGORIES } from "@/config/prices";

/*
 * Data of the Black Friday sale page, from the prototype's src/bf-sale-ui.jsx. The deals are built from the price
 * list: one per category, with the treatments (areas) and packages that carry an offer. This page shows the
 * packages and their prices interactively, so the price list is part of its script (it is not on other pages).
 */

export const BFS = { start: '2026-11-27T00:00:00-05:00', end: '2026-11-30T23:59:00-05:00', when: 'Friday, Nov 27 to Monday, Nov 30', whenShort: 'Nov 27 to 30' };

/** Prescription drugs stay out of the promotion. */
const BFS_SKIP = ['botox-dysport', 'latisse'];

const BFS_GROUP: Record<string, string> = {
  'laser-hair-removal': 'Laser', 'laser-vein': 'Laser', 'laser-acne-treatment': 'Laser', 'laser-skin-resurfacing': 'Laser', 'photo-rejuvenation': 'Laser',
  '4d-rejuvalift': 'Laser', '2d-3d-laser-skin-tightening': 'Laser', '2d-3d-laser-rejuvenation': 'Laser',
  microneedling: 'Skin', facial: 'Skin', 'chemical-peel': 'Skin', 'depigmenting-treatment': 'Skin',
  'dermal-fillers': 'Injectables', 'skin-booster-and-bio-stimulators': 'Injectables', 'aptos-thread-method': 'Injectables',
  'coolsculpting-tight-sculpting': 'Body', 'non-surgical-butt-lift': 'Body', 'hair-loss': 'Hair',
  'laser-vaginal-tightening': 'Wellness', 'snoring-treatment': 'Wellness', 'toenail-fungus-removal': 'Wellness',
};

export const BFS_TABS = ['All deals', 'Laser', 'Skin', 'Injectables', 'Body', 'Hair', 'Wellness'];

export const BFS_CONCERNS: [name: string, text: string, categoryIds: string[]][] = [
  ['Unwanted hair', 'Choose your area and laser hair removal package.', ['laser-hair-removal']],
  ['Lines and wrinkles', 'Treatments that may soften lines and refresh the skin.', ['dermal-fillers', 'skin-booster-and-bio-stimulators', 'microneedling', 'laser-skin-resurfacing', '4d-rejuvalift']],
  ['Loose or sagging skin', 'Lifting and tightening for the face, neck and body.', ['aptos-thread-method', '2d-3d-laser-skin-tightening', '4d-rejuvalift', 'skin-booster-and-bio-stimulators']],
  ['Volume and contour', 'Lips, cheeks, jawline and more.', ['dermal-fillers', 'skin-booster-and-bio-stimulators', 'aptos-thread-method']],
  ['Stubborn fat', 'Non-invasive body contouring.', ['coolsculpting-tight-sculpting']],
  ['Acne and scars', 'Laser, peels, facials and microneedling.', ['laser-acne-treatment', 'microneedling', 'chemical-peel', 'laser-skin-resurfacing', 'facial']],
  ['Spots and pigment', 'Options for an uneven skin tone.', ['photo-rejuvenation', 'depigmenting-treatment', 'chemical-peel', '2d-3d-laser-rejuvenation']],
  ['Veins and redness', 'Laser and light for visible veins and redness.', ['laser-vein', 'photo-rejuvenation']],
  ['Hair thinning', 'PRP scalp treatments.', ['hair-loss']],
];

/** A package of a treatment: [label, price, regular price (0 when none), offer tag]. */
export type Opt = [label: string, price: number, regular: number, tag?: string];
/** A treatment (or area) of a category, with its packages. */
export type Item = [name: string, note: string, options: Opt[]];

export interface Deal {
  id: string;
  /** The price-list category. */
  c: { name: string; blurb: string };
  /** The tab it sits under (Laser, Skin, ...). */
  group: string;
  /** The treatments that carry an offer. */
  items: Item[];
  /** Largest percentage offer, 0 when the offers are package deals. */
  pct: number;
  offer: string;
  from: number;
}

/** A line of "my plan". */
export interface PlanLine {
  key: string;
  cat: string;
  item: string;
  opt: string;
  price: number;
  /** Regular price, 0 when there is none. */
  reg: number;
  tag: string;
}

/* the price list ties "OFF" to its number with a no-break space, so any white space is accepted */
const bfsPct = (t: string | undefined): number => {
  const m = /(\d+)%\s*OFF$/i.exec(t ?? "");
  return m && !/GET 1/i.test(t ?? "") ? Number(m[1]) : 0;
};

/** An offer tag in sentence case ("BUY 1 GET 1 FREE" -> "Buy 1 get 1 free"). */
export const bfsTag = (t: string | undefined): string =>
  t
    ? t
        .replace(/\bOFF\b/g, "off")
        .replace(/^BUY 1 GET 1/i, "Buy 1 get 1")
        .replace(/\bFREE\b/, "free")
        .replace(/^Save \$(\d+)\sOff$/i, "Save $$$1")
    : "";

export const BFS_DEALS: Deal[] = PRICE_CATEGORIES.filter((c) => !BFS_SKIP.includes(c.id) && BFS_GROUP[c.id])
  .map((c) => {
    const all: Item[] = c.items.map((it) => [it.name, it.note, it.options.map((o): Opt => [o.label, o.price, o.regular, o.tag])]);
    const items = all.filter((it) => it[2].some((o) => o[2] > 0 || o[3]));
    const tags = items.flatMap((it) => it[2].map((o) => o[3]).filter((t): t is string => !!t));
    const pct = Math.max(0, ...tags.map(bfsPct));
    const prices = items.flatMap((it) => it[2].filter((o) => o[2] > 0 || o[3]).map((o) => o[1]));
    return { c: { name: c.name, blurb: c.blurb }, id: c.id, group: BFS_GROUP[c.id], items, pct, offer: pct ? `Up to ${pct}%\u00a0off` : bfsTag(tags[0]), from: Math.min(...prices) };
  })
  .filter((d) => d.items.length);

export const BFS_MAX = Math.max(...BFS_DEALS.map((d) => d.pct));

/** A treatment's name without its category in front ("Laser Hair Removal - Underarms" -> "Underarms"). */
export const bfsShort = (name: string, cat: string): string =>
  name.replace(new RegExp("^" + cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[-–]?\\s*", "i"), "").replace(/^LHR - /, "") || name;

/** A monthly special as this page's tickets show it. */
export interface SpecialCard {
  n: string;
  img: string;
  pos: string;
  /** Lowest price, without the dollar sign. */
  p: string;
  /** "per session", or empty. */
  u: string;
  deal: string;
  d: string;
  /** Its category on the pricing page. */
  h: string;
}

/** The current offers (read from WooCommerce by the page) as this page's tickets. */
export const bfsSpecials = (offers: Offer[]): SpecialCard[] => offers.map((o) => ({ n: o.name, img: o.photo?.src ?? "", pos: o.position, p: o.price, u: o.unit, deal: o.deal, d: o.text, h: o.href }));
