import "server-only";
import type { TxPriceGroup } from "@/components/treatment/price-group";
import { BUILT_IN_PROCEDURES, PROCEDURE_SHARED } from "@/config/procedure";
import { procedurePath } from "@/lib/post-paths";
import { formatPrice } from "@/lib/price-book";
import { fillPrices, fillPricesDeep, getSitePrices, type SitePrices } from "@/lib/site-prices";
import { priceGroup } from "@/lib/treatment-prices";
import { getProcedure, getProcedureList, settle } from "@/lib/wordpress";
import type { WPProcedure } from "@/types/procedure";
import type { ProcedurePage } from "@/types/treatment";

/** A procedure page ready to show: its content with every amount filled in, and its price list. */
export interface ProcedureView {
  page: ProcedurePage;
  /** The price list: one group per WooCommerce product picked for this procedure. Empty: no price section. */
  groups: TxPriceGroup[];
  title: string;
  description: string;
  /** The page's address: its post type's folder and its slug ("/injectables/botox"). */
  path: string;
}

type Category = SitePrices["categories"][number];
type Item = Category["items"][number];

/** One product of the price list as the page shows it: WooCommerce's product, under the editor's title and text. */
interface Source {
  category: Category;
  item: Item;
  title: string;
  blurb: string;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * What an editor picked in WordPress ("product:<id>", or "category:<slug>" for every product of a
 * category) as products of the WooCommerce price list. Nothing when it is no longer on the list.
 */
export function picked(prices: SitePrices, source: string): { category: Category; item: Item }[] {
  const [kind, value] = source.split(":");
  if (kind === "category") {
    const category = prices.categories.find((c) => c.id === value);
    return category ? category.items.map((item) => ({ category, item })) : [];
  }
  for (const category of prices.categories) {
    const item = kind === "product" ? category.items.find((it) => it.id === Number(value)) : undefined;
    if (item) return [{ category, item }];
  }
  return [];
}

/** A product as a group of the price table. In a category priced per unit, the "Regular" option is the price of one unit. */
function toGroup({ category, item, title, blurb }: Source): TxPriceGroup {
  const unit = category.perUnit ? item.options.find((o) => /regular/i.test(o.label))?.label : undefined;
  return { ...priceGroup({ name: item.name, title, blurb }, item.options, unit), category: category.name };
}

/** The price of one unit of a group (products priced per unit), else its lowest price. */
function unitPrice(g: TxPriceGroup | undefined): number | undefined {
  if (!g?.rows.length) return undefined;
  return g.rows.find((r) => r.unit)?.price ?? Math.min(...g.rows.map((r) => r.price));
}

/** The percentage offers on a group's options, lowest and highest. */
function offers(g: TxPriceGroup | undefined): [low: number, high: number] | undefined {
  const offs = (g?.rows ?? []).map((r) => Number(/^(\d+)%\s*OFF$/i.exec(r.tag ?? "")?.[1] ?? 0)).filter(Boolean);
  return offs.length ? [Math.min(...offs), Math.max(...offs)] : undefined;
}

/**
 * The amounts the copy asks for, all from the price list's groups (WooCommerce): `{{price}}` one unit
 * of the first product (or its lowest price), `{{price2}}` of the second, `{{pricex20}}` 20 units of
 * the first, `{{off}}` the offers on the first ("10% to 30%"), `{{maxoff}}` the largest ("30%").
 * A token with no price behind it gets no value: its sentence is then left out.
 */
export function priceValues(groups: TxPriceGroup[], texts: unknown): Record<string, string | undefined> {
  const values: Record<string, string | undefined> = {};
  for (const [, key] of JSON.stringify(texts).matchAll(/\{\{([\w-]+)\}\}/g)) {
    const price = /^price(\d*)(?:x(\d+))?$/.exec(key);
    const off = /^(off|maxoff)(\d*)$/.exec(key);
    if (price) {
      const one = unitPrice(groups[Number(price[1] || 1) - 1]);
      values[key] = one === undefined ? undefined : formatPrice(one * Number(price[2] || 1));
    } else if (off) {
      const range = offers(groups[Number(off[2] || 1) - 1]);
      values[key] = !range ? undefined : off[1] === "maxoff" || range[0] === range[1] ? `${range[1]}%` : `${range[0]}% to ${range[1]}%`;
    }
  }
  return values;
}

/** Which sections of the section bar the procedure has content for. */
function sections(p: ProcedurePage, groups: TxPriceGroup[]): Record<string, boolean> {
  return {
    benefits: p.intro.text.length > 0,
    overview: p.overview.tabs.length > 0,
    "why-choose": p.choose.cards.length > 0,
    watch: !!p.reel.src,
    results: (p.results.pics?.length ?? 0) > 0,
    prices: groups.length > 0,
    guide: p.guide.items.length > 0 || p.guide.related.length > 0,
    faq: p.faqs.length > 0,
  };
}

/** The page with WooCommerce's amounts written into its copy, and only the sections it has content for. */
function build(raw: ProcedurePage, sources: Source[], seo: { title: string; description: string; fallback: string }, path: string): ProcedureView {
  /* one group per product, whatever was picked twice */
  const groups = sources.filter((s, i) => sources.findIndex((x) => x.item.id === s.item.id) === i).map(toGroup);
  const values = priceValues(groups, [raw, seo]);
  const filled = fillPricesDeep(raw, values);
  const has = sections(filled, groups);
  const page: ProcedurePage = {
    ...filled,
    nav: filled.nav.filter(([id]) => has[id] ?? true),
    /* the offer card only while WooCommerce has an offer on the first product */
    offer: values.maxoff ? filled.offer : undefined,
  };
  return { page, groups, title: fillPrices(seo.title, values) || seo.fallback, description: fillPrices(seo.description, values) || filled.sub, path };
}

/** The page title when none is written, or when its price is not known. */
const plainTitle = (name: string) => `${name.replace(/[®™]/g, "")} Toronto, Free Consultation | NewDermaMed`;

/** A WordPress procedure as the page's sections read it, joined with what every procedure page shares. */
function fromWordPress(wp: WPProcedure, prices: SitePrices | null): ProcedureView {
  const c = wp.content;
  const S = PROCEDURE_SHARED;
  const name = wp.title;
  const desktop = wp.hero?.src ?? "";

  const sources: Source[] = prices
    ? c.price_list.flatMap((row) => {
        const found = picked(prices, row.price_source);
        /* the editor's title and text belong to the one product of the row; a whole category shows each product under its own */
        const own = found.length === 1;
        return found.map(({ category, item }) => ({ category, item, title: (own && row.name) || item.name, blurb: (own && row.blurb) || item.note }));
      })
    : [];

  const page: ProcedurePage = {
    crumbs: [S.crumb, ...(c.group ? [c.group] : []), name],
    title: [c.heading_1 || name, c.heading_2],
    sub: c.intro,
    hero: { desktop, mobile: c.hero_mobile?.src ?? desktop, position: c.hero_position || "50% 50%", alt: wp.hero?.alt ?? "" },
    where: S.where,
    offer: c.offer_title ? { ...S.offer, title: c.offer_title } : undefined,
    facts: c.facts.map((f) => [f.label, f.value]),
    nav: S.nav,
    intro: {
      ...S.intro,
      contain: c.benefits_diagram ? S.intro.contain : undefined,
      lead: c.benefits_lead,
      strong: c.benefits_strong,
      img: c.benefits_image?.src ?? "",
      alt: c.benefits_image?.alt ?? "",
      text: c.benefits_text,
      chips: c.benefits_chips.length ? c.benefits_chips : undefined,
      note: c.benefits_note || undefined,
      points: [],
    },
    film: { ...S.film, lead: name },
    overview: {
      ...S.overview,
      lead: c.about_lead,
      strong: c.about_strong,
      tabs: c.tabs.map((t) => ({ label: t.label, stat: [t.figure, t.figure_label], text: t.text, link: t.link ? [t.link, t.link_label || t.link] : undefined })),
    },
    choose: {
      ...S.choose,
      lead: c.choose_lead || S.choose.lead,
      strong: c.choose_strong || `${name}?`,
      img: c.choose_image?.src ?? "",
      alt: c.choose_image?.alt ?? "",
      cards: c.cards.map((x) => [x.title, x.text]),
    },
    reel: { ...S.reel, src: c.reel_video, poster: c.reel_poster?.src ?? "", tag: name, text: c.reel_text },
    why: S.why,
    results: { ...S.results, lead: `${name} before`, pics: c.cases.map((r) => ({ src: r.image.src, label: r.label || r.title })) },
    prices: { lead: c.prices_lead || `How much does ${name}`, strong: c.prices_strong || S.prices.strong, category: "", unitLabel: "", groups: [] },
    guide: {
      ...S.guide,
      lead: c.guide_lead,
      strong: c.guide_strong,
      intro: c.guide_intro,
      items: c.guide.map((g) => ({ q: g.q, a: g.a, list: g.list.length ? g.list : undefined })),
      updated: wp.updated,
      related: c.related.map((r) => ({ name: r.name, img: r.image?.src ?? "", kind: r.kind })),
    },
    faq: { ...S.faq, strong: name },
    faqs: c.faqs.map((f) => [f.q, f.a]),
  };

  return build(page, sources, { title: c.seo_title, description: c.seo_description, fallback: plainTitle(name) }, procedurePath(wp.type, wp.slug));
}

/** The built-in copy of a procedure (shown when WordPress cannot be reached), with WooCommerce's prices when those can be read. */
function builtIn(slug: string, prices: SitePrices | null): ProcedureView | null {
  const own = BUILT_IN_PROCEDURES[slug];
  if (!own) return null;
  const list = own.page.prices;
  const category = prices?.categories.find((c) => same(c.name, list.category));
  const sources = list.groups.flatMap((g): Source[] => {
    const item = category?.items.find((it) => same(it.name, g.name));
    return category && item ? [{ category, item, title: g.title, blurb: g.blurb }] : [];
  });
  return build(own.page, sources, { title: own.title, description: own.description, fallback: plainTitle(own.page.crumbs[own.page.crumbs.length - 1]) }, procedurePath(own.type, slug));
}

/**
 * The procedure page at this address: the published WordPress post with this slug. Null when there
 * is none. When WordPress cannot be reached, a procedure with a built-in copy shows that copy.
 */
export async function getProcedureView(slug: string): Promise<ProcedureView | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const read = await settle(() => getProcedure(slug));
  if (read.ok && !read.data) return null;
  const prices = await getSitePrices();
  return read.ok && read.data ? fromWordPress(read.data, prices) : builtIn(slug, prices);
}

/** The slugs of every published procedure (empty when WordPress cannot be reached). */
export async function getProcedureSlugs(): Promise<string[]> {
  return (await getProcedurePaths()).map((p) => p.slug);
}

/** Every published procedure with its address ("/injectables/botox"); empty when WordPress cannot be reached. */
export async function getProcedurePaths(): Promise<{ slug: string; path: string }[]> {
  const read = await settle(getProcedureList);
  return read.ok ? read.data.map((p) => ({ slug: p.slug, path: procedurePath(p.type, p.slug) })) : [];
}
