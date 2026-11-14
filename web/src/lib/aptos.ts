import "server-only";
import type { TxPriceGroup } from "@/components/treatment/price-group";
import { APTOS, APTOS_PRICE, APTOS_SLUG, BUILT_IN_APTOS } from "@/config/aptos";
import { picked, priceValues } from "@/lib/procedure";
import { fillPrices, fillPricesDeep, getSitePrices, type SitePrices } from "@/lib/site-prices";
import { priceGroup } from "@/lib/treatment-prices";
import { getAptosPage, settle } from "@/lib/wordpress";
import type { WPAptosPage } from "@/types/aptos";
import type { TreatmentPage } from "@/types/treatment";

/** A page of the Aptos design ready to show: its content with every amount filled in, and its price list. */
export interface AptosView {
  page: TreatmentPage;
  /** The price list: one group per WooCommerce product picked for this page. Empty: no price table. */
  groups: TxPriceGroup[];
  /** Which sections the page has content for; the others are left out of the page and of the section bar. */
  has: Record<AptosSection, boolean>;
  faq: { lead: string; strong: string; intro: string };
  title: string;
  description: string;
}

export type AptosSection = "what" | "how" | "safety" | "duration" | "candidate" | "expect" | "results" | "care" | "combinations" | "prices" | "sessions" | "why" | "faq";

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The page title when none is written, or when its price is not known. */
const plainTitle = (name: string) => `${name.replace(/[®™]/g, "")} Toronto, Free Consultation | NewDermaMed`;

/** Which sections have content. */
function sections(p: TreatmentPage, groups: TxPriceGroup[]): Record<AptosSection, boolean> {
  return {
    what: p.intro.text.length > 0,
    how: p.steps.items.length > 0,
    safety: p.safety.text.length > 0,
    duration: !!p.duration.stat,
    candidate: p.fit.yes.length + p.fit.no.length > 0,
    expect: p.expect.items.length > 0,
    results: (p.results.pics?.length ?? p.results.cases?.length ?? 0) > 0,
    care: p.care.before.length + p.care.after.length > 0,
    combinations: p.pair.groups.length + p.pair.links.length > 0,
    prices: groups.length > 0,
    sessions: !!p.sessions.stat,
    why: p.why.items.length > 0,
    faq: p.faqs.length > 0,
  };
}

/** The page with WooCommerce's amounts written into its copy, and only the sections it has content for. */
function build(raw: TreatmentPage, groups: TxPriceGroup[], seo: { title: string; description: string; fallback: string }, faq: AptosView["faq"]): AptosView {
  const values = priceValues(groups, [raw, seo, faq]);
  const filled = fillPricesDeep(raw, values);
  /* a question whose answer lost its only sentence (its price is not known) is left out */
  const page: TreatmentPage = {
    ...filled,
    faqs: filled.faqs.filter(([q, a]) => q && a),
  };
  const has = sections(page, groups);
  page.nav = page.nav.filter(([id]) => (has as Record<string, boolean>)[id] ?? true);
  return {
    page,
    groups,
    has,
    faq: fillPricesDeep(faq, values),
    title: fillPrices(seo.title, values) || seo.fallback,
    description: fillPrices(seo.description, values) || page.sub,
  };
}

/** The price list of a WordPress page: one group per picked product, with only the options the row names. */
function priceGroups(wp: WPAptosPage, prices: SitePrices | null): TxPriceGroup[] {
  if (!prices) return [];
  const seen = new Set<number>();
  return wp.content.price_list.flatMap((row) => {
    const found = picked(prices, row.price_source);
    /* the editor's title, text and options belong to the one product of the row; a whole category shows each product as it is */
    const own = found.length === 1;
    return found.flatMap(({ category, item }): TxPriceGroup[] => {
      if (seen.has(item.id)) return [];
      seen.add(item.id);
      const options = own && row.options.length ? item.options.filter((o) => row.options.some((name) => same(name, o.label))) : item.options;
      if (!options.length) return [];
      const unit = category.perUnit ? options.find((o) => /regular/i.test(o.label))?.label : undefined;
      return [
        {
          ...priceGroup(
            {
              name: item.name,
              title: (own && row.name) || item.name,
              blurb: (own && row.blurb) || item.note,
            },
            options,
            unit,
          ),
          category: category.name,
        },
      ];
    });
  });
}

/** A WordPress page as the sections read it. The section bar and the fixed pieces (logo, team photo) are the site's. */
function fromWordPress(wp: WPAptosPage, prices: SitePrices | null): AptosView {
  const c = wp.content;
  const name = wp.title;
  const desktop = wp.hero?.src ?? "";
  /* a section's tag is also its name in the section bar */
  const tags: Record<string, string> = {
    what: c.what_tag,
    how: c.how_tag,
    safety: c.safety_tag,
    candidate: c.fit_tag,
    combinations: c.pair_tag,
  };

  const page: TreatmentPage = {
    crumbs: [APTOS.crumbs[0], name],
    title: [c.heading_1 || name, c.heading_2],
    sub: c.intro,
    hero: {
      desktop,
      mobile: c.hero_mobile?.src ?? desktop,
      position: c.hero_position || "50% 50%",
      alt: wp.hero?.alt ?? "",
    },
    facts: c.facts.map((f) => [f.label, f.value]),
    nav: APTOS.nav.map(([id, label]) => [id, tags[id] || label]),
    intro: {
      tag: c.what_tag || APTOS.intro.tag,
      lead: c.what_lead,
      strong: c.what_strong,
      ring: c.what_ring || undefined,
      text: c.what_text,
      note: c.what_note || undefined,
      img: c.what_image?.src ?? "",
      alt: c.what_image?.alt ?? "",
      position: c.what_position || undefined,
      points: c.what_points.map((x) => [x.title, x.text]),
    },
    steps: {
      tag: c.how_tag || APTOS.steps.tag,
      lead: c.how_lead,
      strong: c.how_strong,
      text: c.how_text,
      items: c.how_steps.map((x) => [x.title, x.text]),
    },
    safety: {
      tag: c.safety_tag || APTOS.safety.tag,
      lead: c.safety_lead,
      strong: c.safety_strong,
      product: {
        img: c.product_image?.src ?? "",
        alt: c.product_image?.alt ?? "",
        tag: c.product_tag,
        name: c.product_name,
        note: c.product_note,
      },
      text: c.safety_text,
      safeguards: c.safeguards,
    },
    duration: {
      lead: c.lasting_lead,
      strong: c.lasting_strong,
      text: c.lasting_text,
      logo: APTOS.duration.logo,
      logoAlt: APTOS.duration.logoAlt,
      stat: c.lasting_figure,
      unit: c.lasting_unit,
      label: c.lasting_label,
      note: c.lasting_note,
    },
    fit: {
      tag: c.fit_tag || APTOS.fit.tag,
      lead: c.fit_lead,
      strong: c.fit_strong,
      text: c.fit_text,
      yes: c.fit_yes,
      no: c.fit_no,
      img: c.fit_image?.src ?? "",
      alt: c.fit_image?.alt ?? "",
      position: c.fit_position || "50% 50%",
    },
    expect: {
      lead: c.expect_lead,
      strong: c.expect_strong,
      items: c.expect_steps.map((x) => [x.when, x.title, x.text]),
    },
    /* the cases of the "Before & After" post type picked for this page: each is one photo that shows before and after */
    results: {
      lead: c.results_lead,
      strong: c.results_strong,
      text: c.results_text,
      pics: c.cases.map((r) => ({
        src: r.image.src,
        label: r.label || r.title,
      })),
    },
    care: {
      lead: c.care_lead,
      strong: c.care_strong,
      text: c.care_text,
      before: c.care_before,
      after: c.care_after,
    },
    pair: {
      tag: c.pair_tag || APTOS.pair.tag,
      lead: c.pair_lead,
      strong: c.pair_strong,
      text: c.pair_text,
      groups: c.pair_groups.map((g) => [g.when, g.treatments]),
      links: c.pair_links.map((l) => ({
        name: l.name,
        menu: l.menu || l.name,
        tag: l.tag,
        img: l.image?.src ?? "",
        line: l.line,
      })),
    },
    prices: {
      lead: c.prices_lead,
      strong: c.prices_strong,
      intro: c.prices_intro,
      title: "",
      name: "",
      category: "",
      blurb: "",
    },
    sessions: {
      stat: c.sessions_figure,
      unit: c.sessions_unit,
      text: c.sessions_text,
      chips: c.sessions_chips,
    },
    why: {
      alt: APTOS.why.alt,
      position: APTOS.why.position,
      lead: c.why_lead,
      strong: c.why_strong,
      items: c.why_items.map((x) => [x.figure, x.unit, x.text]),
    },
    faqs: c.faqs.map((f) => [f.q, f.a]),
  };

  return build(
    page,
    priceGroups(wp, prices),
    {
      title: c.seo_title,
      description: c.seo_description,
      fallback: plainTitle(name),
    },
    { lead: c.faq_lead, strong: c.faq_strong, intro: c.faq_intro },
  );
}

/** The built-in copy of a page (shown when WordPress cannot be reached), with WooCommerce's prices when those can be read. */
function builtIn(slug: string, prices: SitePrices | null): AptosView | null {
  const own = BUILT_IN_APTOS[slug];
  if (!own) return null;
  const pr = own.page.prices;
  const options = (prices?.book.priceRows(APTOS_PRICE.category, APTOS_PRICE.item) ?? []).filter((o) => APTOS_PRICE.area.test(o.label));
  const groups = options.length
    ? [
        {
          ...priceGroup({ name: pr.name, title: pr.title, blurb: pr.blurb }, options),
          category: pr.category,
        },
      ]
    : [];
  return build(
    own.page,
    groups,
    {
      title: own.title,
      description: own.description,
      fallback: plainTitle(own.page.crumbs[own.page.crumbs.length - 1]),
    },
    own.faq,
  );
}

/**
 * The Aptos page, at its one address (/aptos-thread-lift): the published WordPress page with the
 * template "Aptos Thread Lift page". Null for any other address, or when WordPress has no published
 * Aptos page. When WordPress cannot be reached, the built-in copy shows.
 */
export async function getAptosView(slug: string): Promise<AptosView | null> {
  if (slug !== APTOS_SLUG) return null;
  const read = await settle(getAptosPage);
  if (read.ok && !read.data) return null;
  const prices = await getSitePrices();
  return read.ok && read.data ? fromWordPress(read.data, prices) : builtIn(slug, prices);
}

/** The Aptos page's address when WordPress has it published (empty when it has not, or cannot be reached). */
export async function getAptosSlugs(): Promise<string[]> {
  const read = await settle(getAptosPage);
  return read.ok && read.data ? [APTOS_SLUG] : [];
}
