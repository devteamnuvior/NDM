import type { CategoryRef, PricingPatch, WooAdminProduct, WooAdminTree, WooAdminVariation, WooPricingTree, WooPromoLabel } from "@/types/pricing";

/**
 * The management screen's working copy of the price list, and what turns it into one set of changes.
 * Nothing here talks to a server: the screen edits a draft, and Save sends only the difference between
 * the draft and what WooCommerce holds.
 */

export interface DraftCategory {
  /** Stable key on the screen: "c12" for WooCommerce category 12, the "new-…" ref for an unsaved one. */
  key: string;
  /** WooCommerce category ID; null until the category has been saved. */
  id: number | null;
  slug: string;
  name: string;
  description: string;
  visible: boolean;
  perUnit: boolean;
  /** The category's products, in display order. */
  productIds: number[];
}

export interface Draft {
  categories: DraftCategory[];
  /** Every product on the screen by its WooCommerce ID (a product can sit in several categories). */
  products: Record<number, WooAdminProduct>;
}

export function toDraft(tree: WooAdminTree): Draft {
  const products: Record<number, WooAdminProduct> = {};
  const categories = tree.categories.map((c): DraftCategory => {
    for (const p of c.products) products[p.id] = p;
    return { key: `c${c.id}`, id: c.id, slug: c.slug, name: c.name, description: c.description, visible: c.visible, perUnit: c.perUnit, productIds: c.products.map((p) => p.id) };
  });
  return { categories, products };
}

const sameLabel = (a: WooPromoLabel, b: WooPromoLabel) => a.text.trim() === b.text.trim() && a.enabled === b.enabled;
const sameList = (a: readonly unknown[], b: readonly unknown[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const cleanLabel = (l: WooPromoLabel): WooPromoLabel => ({ text: l.text.trim(), enabled: l.enabled && l.text.trim() !== "" });
const refOf = (c: DraftCategory): CategoryRef => c.id ?? (c.key as `new-${string}`);

export interface Changes {
  patch: PricingPatch;
  /** How many things differ from WooCommerce. */
  count: number;
  /** Keys of categories with unsaved changes ("c12", "new-1"), and IDs of changed products and variations. */
  categories: Set<string>;
  products: Set<number>;
  variations: Set<number>;
  /** What stops a save, in plain words; empty when the draft can be saved. */
  problems: string[];
}

/** The difference between what WooCommerce holds (`saved`) and the draft. */
export function changesOf(saved: Draft, draft: Draft): Changes {
  const patch: PricingPatch = {};
  const changed = { categories: new Set<string>(), products: new Set<number>(), variations: new Set<number>() };
  const problems: string[] = [];
  const before = new Map(saved.categories.map((c) => [c.key, c]));

  const names = new Set<string>();
  for (const c of draft.categories) {
    const name = c.name.trim();
    if (!name) problems.push("A category has no name.");
    else if (names.has(name.toLowerCase())) problems.push(`Two categories are named “${name}”.`);
    names.add(name.toLowerCase());

    const was = before.get(c.key);
    if (!was) {
      (patch.createCategories ??= []).push({ ref: c.key as `new-${string}`, name, description: c.description.trim(), visible: c.visible, perUnit: c.perUnit });
      if (c.productIds.length) (patch.categories ??= []).push({ id: refOf(c), products: c.productIds });
      changed.categories.add(c.key);
      continue;
    }

    const entry: NonNullable<PricingPatch["categories"]>[number] = { id: refOf(c) };
    if (name !== was.name) entry.name = name;
    if (c.description.trim() !== was.description) entry.description = c.description.trim();
    if (c.visible !== was.visible) entry.visible = c.visible;
    if (c.perUnit !== was.perUnit) entry.perUnit = c.perUnit;
    if (!sameList(c.productIds, was.productIds)) entry.products = c.productIds;
    if (Object.keys(entry).length > 1) {
      (patch.categories ??= []).push(entry);
      changed.categories.add(c.key);
    }
  }

  const orderChanged = !sameList(draft.categories.map((c) => c.key), saved.categories.map((c) => c.key));
  if (orderChanged) patch.categoryOrder = draft.categories.map(refOf);

  for (const p of Object.values(draft.products)) {
    const was = saved.products[p.id] ?? p; /* a product just added from the search: compared with itself */
    const what = p.name.trim() || `Product ${p.id}`;
    if (!p.name.trim()) problems.push("A product has no name.");
    const entry: NonNullable<PricingPatch["products"]>[number] = { id: p.id };
    if (p.name.trim() !== was.name) entry.name = p.name.trim();
    if (p.note.trim() !== was.note) entry.note = p.note.trim();
    if (p.hidden !== was.hidden) entry.hidden = p.hidden;
    if (!sameLabel(p.label, was.label)) entry.label = cleanLabel(p.label);

    /* its card in Promotions: taken out, put in, or changed */
    if (!p.promo && was.promo) entry.promo = null;
    else if (p.promo) {
      const { order, imageId, ...card } = p.promo;
      const clean = { ...card, name: card.name.trim(), text: card.text.trim() };
      const old = saved.products[p.id]?.promo ?? null; /* a product just added from the search has no saved copy: its card is sent as it stands */
      const same = old && old.name === clean.name && old.text === clean.text && old.area === clean.area && old.icon === clean.icon && old.focus === clean.focus && old.scope === clean.scope;
      if (!same || imageId || order !== old.order) entry.promo = { ...clean, ...(!old || order !== old.order ? { position: order } : {}), ...(imageId ? { imageId } : {}) };
    }

    /* a product without variations carries its own price */
    if (!p.variations.length && !was.variations.length && (p.regularPrice.trim() !== was.regularPrice || p.salePrice.trim() !== was.salePrice)) {
      const bad = priceProblem(p.regularPrice, p.salePrice);
      if (bad) problems.push(`${what}: ${bad}`);
      if (p.regularPrice.trim() !== was.regularPrice) entry.regularPrice = p.regularPrice.trim();
      if (p.salePrice.trim() !== was.salePrice) entry.salePrice = p.salePrice.trim();
    }

    const kept = new Set(p.variations.map((v) => v.id));
    const removed = was.variations.filter((v) => !kept.has(v.id)).map((v) => v.id);
    if (removed.length) entry.removeVariations = removed;

    const names = new Map<string, number>();
    for (const v of p.variations) names.set(v.label.trim().toLowerCase(), (names.get(v.label.trim().toLowerCase()) ?? 0) + 1);

    for (const v of p.variations) {
      const name = v.label.trim();
      const old = v.id > 0 ? (was.variations.find((x) => x.id === v.id) ?? v) : null;
      const priced = !old || v.regularPrice.trim() !== old.regularPrice || v.salePrice.trim() !== old.salePrice;
      if (priced) {
        const bad = priceProblem(v.regularPrice, v.salePrice);
        if (bad) problems.push(`${what}, ${name || "new option"}: ${bad}`);
      }

      if (!old) {
        if (!name) problems.push(`${what}: a new option has no name.`);
        else if (name.includes("|")) problems.push(`${what}: an option name cannot hold the “|” sign.`);
        else if ((names.get(name.toLowerCase()) ?? 0) > 1) problems.push(`${what} has two options named “${name}”.`);
        (entry.addVariations ??= []).push({ ref: variationRef(v.id) as `newv-${string}`, name, regularPrice: v.regularPrice.trim(), salePrice: v.salePrice.trim(), hidden: v.hidden, label: cleanLabel(v.promo) });
        changed.variations.add(v.id);
        continue;
      }

      const row: NonNullable<PricingPatch["variations"]>[number] = { id: v.id };
      if (v.hidden !== old.hidden) row.hidden = v.hidden;
      if (!sameLabel(v.promo, old.promo)) row.label = cleanLabel(v.promo);
      if (v.regularPrice.trim() !== old.regularPrice) row.regularPrice = v.regularPrice.trim();
      if (v.salePrice.trim() !== old.salePrice) row.salePrice = v.salePrice.trim();
      if (Object.keys(row).length > 1) {
        (patch.variations ??= []).push(row);
        changed.variations.add(v.id);
      }
    }

    /* the order is sent when it changed among the options that stay, or when an option is new */
    const stayed = was.variations.filter((v) => kept.has(v.id)).map((v) => v.id);
    if (p.variations.length && (entry.addVariations || !sameList(p.variations.filter((v) => v.id > 0).map((v) => v.id), stayed))) entry.variationOrder = p.variations.map((v) => variationRef(v.id));

    if (Object.keys(entry).length > 1) {
      (patch.products ??= []).push(entry);
      changed.products.add(p.id);
    }
  }

  const count = changed.categories.size + changed.products.size + changed.variations.size + (orderChanged ? 1 : 0);
  return { patch, count, ...changed, problems: [...new Set(problems)] };
}

/**
 * The draft as visitors would see it, by the same rules the public list follows: hidden categories,
 * hidden or unpublished products, hidden or switched-off variations and switched-off labels are left out.
 */
export function toPublicTree(draft: Draft): WooPricingTree {
  const label = (l: WooPromoLabel) => (l.enabled && l.text.trim() ? { text: l.text.trim(), enabled: true } : null);
  return {
    currency: "CAD",
    categories: draft.categories
      .filter((c) => c.visible)
      .map((c) => ({
        id: c.id ?? 0,
        slug: c.id ? c.slug : c.key,
        name: c.name.trim(),
        description: c.description.trim(),
        perUnit: c.perUnit,
        products: c.productIds
          .map((id) => draft.products[id])
          .filter((p) => p && p.status === "publish" && !p.hidden)
          .map((p) => ({
            ...p,
            name: p.name.trim(),
            note: p.note.trim(),
            label: label(p.label),
            variations: p.variations.filter((v) => !v.hidden && v.enabled && v.price !== "").map((v) => ({ ...v, promo: label(v.promo) })),
          }))
          .filter((p) => (p.type === "variable" ? p.variations.length > 0 : p.price !== "")),
      }))
      .filter((c) => c.products.length > 0),
  };
}

const PRICE = /^\d{1,7}(\.\d{1,2})?$/;

/** What is wrong with a pair of prices, in plain words; "" when they can be saved. */
export function priceProblem(regular: string, sale: string): string {
  const r = regular.trim();
  const s = sale.trim();
  if (!PRICE.test(r)) return "enter a regular price such as 120 or 99.50.";
  if (s && !PRICE.test(s)) return "the sale price must be a number such as 120 or 99.50.";
  if (s && Number(s) >= Number(r)) return "the sale price must be lower than the regular price.";
  return "";
}

/** A new option is known by a negative number on the screen and by this ref when it is saved. */
export const variationRef = (id: number): number | `newv-${string}` => (id > 0 ? id : `newv-${-id}`);

/** Price fields after an edit: the price to pay is the sale price when there is one. */
export function withPrices<T extends { regularPrice: string; salePrice: string; price: string; onSale: boolean }>(target: T, regular: string, sale: string): T {
  return { ...target, regularPrice: regular, salePrice: sale, price: sale.trim() || regular.trim(), onSale: sale.trim() !== "" };
}

/** An empty new option for a product; `id` is a negative number unique on the screen. */
export function newVariation(id: number, order: number): WooAdminVariation {
  return { id, label: "", attributes: [], promo: { text: "", enabled: false }, order, price: "", regularPrice: "", salePrice: "", onSale: false, sku: "", stockStatus: "instock", hidden: false, enabled: true };
}

/** Takes the entry at `from` out and puts it back at `to`. */
export function relocated<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [entry] = next.splice(from, 1);
  if (entry === undefined) return [...list];
  next.splice(Math.max(0, Math.min(next.length, to)), 0, entry);
  return next;
}

/** Moves the entry at `index` one place up (-1) or down (+1). */
export function moved<T>(list: readonly T[], index: number, by: -1 | 1): T[] {
  const to = index + by;
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
