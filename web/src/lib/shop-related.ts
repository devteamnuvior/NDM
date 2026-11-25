import type { ShopCard } from "@/types/shop";

/*
 * Which products show around a product (its page) and in the shop's routine, worked out from the store's own data
 * only. No server code: the prototype (shop-product.html) runs the same functions.
 */

const shared = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;
const byName = (a: ShopCard, b: ShopCard) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });

/** "Complete the routine": up to four products of the same product line (else the same brand and category), in stock. */
export function sameLine(product: ShopCard, all: ShopCard[], count = 4): ShopCard[] {
  const pool = all.filter((p) => p.id !== product.id && p.inStock && p.image);
  const line = product.line ? pool.filter((p) => p.line === product.line) : [];
  const near = line.length ? line : pool.filter((p) => p.brand === product.brand && shared(p.categories, product.categories) > 0);
  return near.sort((a, b) => shared(b.concerns, product.concerns) - shared(a.concerns, product.concerns) || byName(a, b)).slice(0, count);
}

/** "You may also like": up to four products that share its concerns and category, leaving out `skip` (the routine row). */
export function alsoLike(product: ShopCard, all: ShopCard[], skip: ShopCard[] = [], count = 4): ShopCard[] {
  const out = new Set([product.id, ...skip.map((p) => p.id)]);
  const score = (p: ShopCard) => shared(p.concerns, product.concerns) * 2 + shared(p.categories, product.categories) + shared(p.ingredients, product.ingredients) * 0.5 + (p.brand === product.brand ? 0.5 : 0);
  return all
    .filter((p) => !out.has(p.id) && p.inStock && p.image)
    .map((p) => [p, score(p)] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || byName(a[0], b[0]))
    .slice(0, count)
    .map(([p]) => p);
}

export interface RoutineStep {
  step: string;
  p: ShopCard;
}

const isType = (p: ShopCard, t: string) => p.productTypes.includes(t);
const pick = (all: ShopCard[], used: Set<number>, tests: ((p: ShopCard) => boolean)[]): ShopCard | undefined => {
  for (const test of tests) {
    const found = all.filter((p) => p.inStock && p.image && !used.has(p.id) && !p.areas.includes("Intimate") && test(p)).sort((a, b) => b.regular - a.regular)[0];
    if (found) {
      used.add(found.id);
      return found;
    }
  }
  return undefined;
};

/**
 * Two example routines of three steps (cleanse, treat, moisturise), picked from the store's product types,
 * ingredients and names: a morning one around vitamin C, an evening one around retinol and a night cream.
 * A step the store has nothing for is left out.
 */
export function routines(all: ShopCard[]): { id: "morning" | "evening"; label: string; steps: RoutineStep[] }[] {
  const make = (tests: [string, ((p: ShopCard) => boolean)[]][]) => {
    const used = new Set<number>();
    return tests.flatMap(([step, t]) => {
      const p = pick(all, used, t);
      return p ? [{ step, p }] : [];
    });
  };
  const cleanser = (p: ShopCard) => isType(p, "Cleansers and Toners");
  const serum = (p: ShopCard) => isType(p, "Concentrates and Serums");
  const cream = (p: ShopCard) => isType(p, "Creams and Gels") && p.areas.includes("Face") && !p.areas.includes("Eyes");
  return [
    {
      id: "morning",
      label: "Morning",
      steps: make([
        ["Cleanse", [(p) => cleanser(p) && /foam|mousse|gel/i.test(p.name), cleanser]],
        ["Treat", [(p) => serum(p) && p.ingredients.includes("Vitamin C"), serum]],
        ["Moisturise", [(p) => cream(p) && p.concerns.includes("Dry/Dehydrated Skin") && !/night/i.test(p.name), (p) => cream(p) && !/night/i.test(p.name)]],
      ]),
    },
    {
      id: "evening",
      label: "Evening",
      steps: make([
        ["Cleanse", [(p) => cleanser(p) && /micellar|cleanser/i.test(p.name), cleanser]],
        ["Treat", [(p) => serum(p) && p.ingredients.includes("Retinol"), (p) => p.ingredients.includes("Retinol")]],
        ["Moisturise", [(p) => cream(p) && /night/i.test(p.name), cream]],
      ]),
    },
  ].filter((r) => r.steps.length > 1) as { id: "morning" | "evening"; label: string; steps: RoutineStep[] }[];
}
