import "server-only";
import { BUILT_IN_CONCERNS, CONCERN_SHARED } from "@/config/concern";
import { getArticleSlugs } from "@/lib/blog";
import type { LowestPrice } from "@/lib/price-book";
import { articlePath, concernPath } from "@/lib/post-paths";
import { resolveLabel, toSlug } from "@/lib/routes";
import { fromText, fromTextLong, getSitePrices, lowestOfSource, type SitePrices } from "@/lib/site-prices";
import { getConcern, getConcernList, settle } from "@/lib/wordpress";
import type { ConcernOption, ConcernPage, WPConcern } from "@/types/concern";

/** A concern page ready to show, with its title and description for search engines. */
export interface ConcernView {
  page: ConcernPage;
  title: string;
  description: string;
}

type Low = (LowestPrice & { categoryId: string }) | null;

const ROLES: ConcernOption["role"][] = ["Primary", "Supporting", "Combination", "Bio-stimulator"];
const BIO: ConcernOption["role"] = "Bio-stimulator";

/** The link an editor typed, or the page with this name (a `#/slug` placeholder until that page exists). */
const linkOr = (link: string, name: string) => link || resolveLabel(name).href;

/**
 * A treatment's lowest price in WooCommerce: the product or category picked in WordPress, else the
 * product found by the treatment's name. Null when there is none (or WooCommerce cannot be reached):
 * the page then shows no price. No price is ever typed.
 */
const lowOf = (prices: SitePrices | null, source: string, name: string): Low => (prices ? ((source && lowestOfSource(prices, source)) || prices.book.priceLow(name)) : null);

/** The glance card: the number of options and the starting price are worked out, the other two are shared. */
function facts(count: number, starting: string): ConcernPage["facts"] {
  const list: ConcernPage["facts"] = [["Treatment options", `${count} to compare`], CONCERN_SHARED.facts.consultation, CONCERN_SHARED.facts.analysis];
  if (starting) list.push(["Starting price", starting]);
  return list;
}

/** The lowest of the options' prices, written with its unit ("From $104.30 per session"); empty when none has a price. */
function starting(lows: Low[]): string {
  const known = lows.filter((l): l is NonNullable<Low> => !!l);
  return known.length ? fromTextLong(known.reduce((a, b) => (b.value < a.value ? b : a))) : "";
}

/** The option with WooCommerce's price: the short form for its card, the long form (unit spelled out) for the table. */
function priced(o: ConcernOption, low: Low): { card: ConcernOption; row: ConcernOption } {
  const priceHref = o.priceHref || (low ? `/pricing#pg-${low.categoryId}-h` : "");
  return { card: { ...o, priceHref, price: fromText(low) }, row: { ...o, priceHref, price: fromTextLong(low) } };
}

/** A WordPress concern as the page's sections read it, joined with what every concern page shares. */
function fromWordPress(wp: WPConcern, prices: SitePrices | null, articles: string[]): ConcernView {
  const c = wp.content;
  /* a row takes from its WooCommerce product whatever the editor left empty: title, summary, image */
  const rows = c.options.map((o) => ({ ...o, name: o.name || o.product?.name || "", line: o.line || o.product?.description || "", image: o.image ?? o.product?.image ?? null })).filter((o) => o.name);
  const lows = rows.map((o) => lowOf(prices, o.price_source, o.name));
  const all = rows.map((o, i) =>
    priced(
      {
        key: toSlug(o.name),
        name: o.name,
        role: ROLES.find((r) => r === o.role) ?? "Primary",
        fit: o.fit,
        line: o.line,
        price: "",
        priceHref: o.price_link,
        href: linkOr(o.link, o.name),
        img: o.image?.src ?? "",
        visit: o.visit,
        course: o.course,
        down: o.down,
        res: o.res,
      },
      lows[i],
    ),
  );
  /* the Bio-stimulators group comes after the other options, on the cards and in the table */
  const ordered = [...all.filter((o) => o.card.role !== BIO), ...all.filter((o) => o.card.role === BIO)];
  const desktop = wp.hero?.src ?? "";

  const page: ConcernPage = {
    short: wp.title,
    crumbs: [CONCERN_SHARED.crumb, wp.title],
    title: [c.heading_1 || wp.title, c.heading_2],
    sub: c.intro,
    hero: { desktop, mobile: c.hero_mobile?.src ?? desktop, position: c.hero_position || "50% 50%", alt: wp.hero?.alt ?? "" },
    where: CONCERN_SHARED.where,
    facts: facts(all.length, starting(lows)),
    /* a concern without steps has no What to expect section: it is left out of the section bar too */
    nav: CONCERN_SHARED.nav.filter(([id]) => id !== "expect" || c.expect.length > 0),
    lede: c.lede,
    pages: c.pages.map((x) => ({ name: x.name, href: linkOr(x.link, x.name) })),
    gallery: c.gallery,
    notice: c.notice,
    cause: c.cause,
    assess: { text: c.assess_text, points: c.assess_points },
    options: ordered.filter((o) => o.card.role !== BIO).map((o) => o.card),
    bio: ordered.filter((o) => o.card.role === BIO).map((o) => o.card),
    rx: { text: c.rx_text, links: c.rx_links.map((x) => ({ name: x.name, href: linkOr(x.link, x.name) })) },
    compare: ordered.map((o) => o.row),
    expect: { ...CONCERN_SHARED.expect, items: c.expect.map((s) => [s.when, s.title, s.text]) },
    results: { ...CONCERN_SHARED.results, pics: c.cases.map((r) => ({ src: r.image.src, label: r.label || r.title })) },
    home: c.home.map((h) => ({
      title: h.title,
      category: h.category,
      text: h.text,
      product: h.product_name ? { name: h.product_name, size: h.product_size, img: h.product_image, href: h.product_link } : undefined,
    })),
    /* a post that has text opens its article page on this site; one without text keeps the "#/slug" placeholder */
    articles: c.journal.map((a) => ({ title: a.title, href: articles.includes(a.slug) ? articlePath(a.slug) : `#/${a.slug}`, date: a.date, topic: a.topic, img: a.image?.src ?? "", excerpt: a.excerpt })),
    /* a card takes from its WooCommerce product whatever the editor left empty: title, tag (the product's category), image */
    related: c.related
      .map((r) => ({ name: r.name || r.product?.name || "", kind: r.kind || r.product?.category || "", img: (r.image ?? r.product?.image)?.src ?? "", link: r.link }))
      .filter((r) => r.name)
      .map((r) => ({ name: r.name, menu: r.name, img: r.img, kind: r.kind, href: r.link || undefined })),
    why: CONCERN_SHARED.why,
    faqs: c.faqs.map((f) => [f.q, f.a]),
  };

  return { page, title: c.seo_title || `${wp.title} Treatment Toronto | NewDermaMed`, description: c.seo_description || c.intro };
}

/** The built-in copy of a concern (shown when WordPress cannot be reached), with WooCommerce's prices when those can be read. */
function builtIn(slug: string, prices: SitePrices | null): ConcernView | null {
  const own = BUILT_IN_CONCERNS[slug];
  if (!own) return null;
  const p = own.page;
  const list = [...p.options, ...p.bio];
  const lows = list.map((o) => lowOf(prices, "", o.name));
  const all = list.map((o, i) => priced(o, lows[i]));
  return {
    ...own,
    page: {
      ...p,
      facts: facts(list.length, starting(lows)),
      options: all.filter((o) => o.card.role !== BIO).map((o) => o.card),
      bio: all.filter((o) => o.card.role === BIO).map((o) => o.card),
      compare: all.map((o) => o.row),
    },
  };
}

/**
 * The concern page at this address: the published WordPress post with this slug. Null when there is
 * none. When WordPress cannot be reached, a concern with a built-in copy shows that copy.
 */
export async function getConcernView(slug: string): Promise<ConcernView | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const read = await settle(() => getConcern(slug));
  if (read.ok && !read.data) return null;
  const prices = await getSitePrices();
  return read.ok && read.data ? fromWordPress(read.data, prices, await getArticleSlugs()) : builtIn(slug, prices);
}

/** The slugs of every published concern (empty when WordPress cannot be reached). */
export async function getConcernSlugs(): Promise<string[]> {
  const read = await settle(getConcernList);
  return read.ok ? read.data.map((c) => c.slug) : [];
}

/** Every published concern with its address ("/concerns/wrinkles-fine-lines"); empty when WordPress cannot be reached. */
export async function getConcernPaths(): Promise<{ slug: string; path: string }[]> {
  return (await getConcernSlugs()).map((slug) => ({ slug, path: concernPath(slug) }));
}
