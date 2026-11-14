import "server-only";
import { HOME_COPY, TREAT_ALL_TAB } from "@/config/home";
import type { TreatmentCard, TreatmentTab } from "@/config/home-treatments";
import { getHomePage, settle } from "@/lib/wordpress";
import type { StartConcern, StartPanel } from "@/config/home-start";
import { resolveLabel, toSlug } from "@/lib/routes";
import type { HomeCopy, PointIcon, ProofIcon, WPHomePage, WPStartPanel, WPTreatTab } from "@/types/home";

const PROOF_ICONS: ProofIcon[] = ["physician", "award", "clinics", "analysis"];
const POINT_ICONS: PointIcon[] = ["check", "thread", "shield"];

/** The icon picked in the edit screen ("Award") as the site names it; an unknown one becomes the first. */
function icon<T extends string>(known: T[], picked: string): T {
  const name = picked.toLowerCase() as T;
  return known.includes(name) ? name : known[0];
}

/**
 * The panels of "Where would you like to start?": a panel without a photo, a concern without its button
 * words and a treatment without a name (typed or its product's) are left out. Prices are not here: the
 * section reads them from WooCommerce. No panel left: null (the built-in panels are shown).
 */
function panelsFrom(rows: WPStartPanel[]): StartPanel[] | null {
  const ids = new Set<string>();
  /* ids are worked out from the words, so they stay readable; a repeated one gets a number */
  const unique = (base: string) => {
    let id = base || "item";
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    return id;
  };
  const panels = rows.flatMap((p): StartPanel[] => {
    if (!p.image) return [];
    const concerns = p.concerns.flatMap((c): StartConcern[] => {
      if (!c.label) return [];
      const options = c.options.flatMap((o) => {
        const name = o.name || o.product?.name || "";
        return name ? [{ name, what: o.what, price: "", href: o.link || resolveLabel(name).href, source: o.price_source }] : [];
      });
      return [
        {
          id: unique(`xo-${toSlug(c.label)}`),
          label: c.label,
          title: c.title || c.label,
          lede: c.lede,
          options,
          facts: c.facts.filter((f) => f.term || f.text),
          ...(c.note && { note: c.note }),
          /* the button's own link too (without script): an empty one stays on the section */
          more: { href: c.more_link || "#start", label: c.more_label },
        },
      ];
    });
    const position = p.position || "center";
    return [
      {
        id: unique(toSlug(p.title)),
        title: p.title,
        sub: p.sub,
        heading: p.heading || p.title,
        text: p.text,
        image: { src: p.image.src, srcSet: p.image.srcset ?? "", position, positionOpen: p.position_open || position },
        concerns,
        ...(!concerns.length && p.link && { analysisHref: p.link }),
        ...(!concerns.length && p.link_label && { analysisLabel: p.link_label }),
      },
    ];
  });
  return panels.length ? panels : null;
}

/**
 * The tabs of "Treatments, by what they do". A card takes its picked product's name, short description,
 * image and category, and whatever is typed on the card replaces them for that card only. A tab without
 * a name, and a card without a title or an image, are left out; so is a tab left with no card. Prices
 * are not here: the section reads them from WooCommerce. No tab left: null (the built-in tabs are shown).
 */
function tabsFrom(rows: WPTreatTab[]): TreatmentTab[] | null {
  const ids = new Set<string>();
  const unique = (base: string) => {
    let id = base || "tab";
    for (let n = 2; ids.has(id) || id === "all"; n++) id = `${base}-${n}`;
    ids.add(id);
    return id;
  };
  const tabs = rows.flatMap((t): TreatmentTab[] => {
    if (!t.label) return [];
    const cards = t.cards.flatMap((c): TreatmentCard[] => {
      const name = c.name || c.product?.name || "";
      const image = c.image || c.product?.image;
      if (!name || !image) return [];
      return [
        {
          name,
          text: c.text || c.product?.description || "",
          /* never an amount: only shown when WooCommerce has no price for the card */
          price: c.price_note,
          href: c.link || resolveLabel(name).href,
          image: { src: image.src, srcSet: image.srcset ?? "" },
          tag: c.tag || c.product?.category || t.label,
          source: c.price_source,
        },
      ];
    });
    if (!cards.length) return [];
    return [{ id: unique(toSlug(t.label)), label: t.label, all: t.all_label ? { href: t.all_link || "#treatments", label: t.all_label } : null, cards }];
  });
  return tabs.length ? tabs : null;
}

/** The WordPress page as the sections read it. A row without its words, or a photo row without a photo, is left out. */
function fromWordPress(wp: WPHomePage): HomeCopy {
  const c = wp.content;
  return {
    title: c.seo_title || HOME_COPY.title,
    description: c.seo_description,
    hero: {
      tagline: c.hero_tagline,
      lead: c.hero_lead,
      strong: c.hero_strong,
      intro: c.hero_intro,
      button: c.hero_button,
      proof: c.hero_proof.flatMap((p) => (p.label ? [{ icon: icon(PROOF_ICONS, p.icon), label: p.label }] : [])),
      brands: c.hero_brands,
    },
    about: {
      tag: c.about_tag,
      lead: c.about_lead,
      strong: c.about_strong,
      text: c.about_text,
      highlight: c.about_highlight,
      stats: c.about_stats.filter((s) => s.figure || s.label),
    },
    start: { tag: c.start_tag, lead: c.start_lead, strong: c.start_strong, panels: panelsFrom(c.start_panels ?? []) ?? HOME_COPY.start.panels },
    treatments: {
      tag: c.treat_tag,
      lead: c.treat_lead,
      strong: c.treat_strong,
      text: c.treat_text,
      allTab: {
        label: c.treat_all_tab || TREAT_ALL_TAB.label,
        all: { href: c.treat_all_link || TREAT_ALL_TAB.all.href, label: c.treat_all_button || TREAT_ALL_TAB.all.label },
      },
      tabs: tabsFrom(c.treat_tabs ?? []) ?? HOME_COPY.treatments.tabs,
    },
    aptos: {
      tag: c.aptos_tag,
      lead: c.aptos_lead,
      strong: c.aptos_strong,
      intro: c.aptos_intro,
      chip: {
        before: c.aptos_chip_before,
        number: c.aptos_chip_number,
        after: c.aptos_chip_after,
      },
      dials: c.aptos_dials.filter((d) => d.value || d.label),
      points: c.aptos_points.flatMap((p) => (p.label ? [{ icon: icon(POINT_ICONS, p.icon), label: p.label }] : [])),
      areas: {
        tag: c.areas_tag,
        lead: c.areas_lead,
        strong: c.areas_strong,
        text: c.areas_text,
        photos: c.areas_photos.flatMap((p) => (p.image ? [{ src: p.image.src, label: p.label, alt: p.image.alt }] : [])),
      },
    },
    space: { tag: c.space_tag, lead: c.space_lead, strong: c.space_strong },
    team: {
      tag: c.team_tag,
      lead: c.team_lead,
      strong: c.team_strong,
      text: c.team_text,
    },
    results: {
      tag: c.results_tag,
      lead: c.results_lead,
      strong: c.results_strong,
      text: c.results_text,
    },
    process: {
      tag: c.process_tag,
      lead: c.process_lead,
      strong: c.process_strong,
      steps: c.process_steps.filter((s) => s.title),
    },
    reviews: {
      tag: c.reviews_tag,
      lead: c.reviews_lead,
      strong: c.reviews_strong,
      note: c.reviews_note,
    },
    visit: {
      tag: c.visit_tag,
      lead: c.visit_lead,
      strong: c.visit_strong,
      text: c.visit_text,
    },
    faq: {
      tag: c.faq_tag,
      lead: c.faq_lead,
      strong: c.faq_strong,
      intro: c.faq_intro,
      items: c.faqs.flatMap((f): [string, string][] => (f.q && f.a ? [[f.q, f.a]] : [])),
    },
    booking: { lead: c.book_lead, strong: c.book_strong, text: c.book_text },
    shop: {
      tag: c.shop_tag,
      lead: c.shop_lead,
      strong: c.shop_strong,
      text: c.shop_text,
      button: c.shop_button,
      link: c.shop_link || HOME_COPY.shop.link,
      /* typed in WordPress (not WooCommerce): a product without a name or a photo is left out */
      products: (() => {
        const link = c.shop_link || HOME_COPY.shop.link;
        const list = (c.shop_products ?? []).flatMap((p) => (p.name && p.image ? [{ name: p.name, size: p.size, image: p.image.src, href: p.link || link }] : []));
        return list.length ? list : HOME_COPY.shop.products;
      })(),
    },
    journal: {
      tag: c.journal_tag,
      lead: c.journal_lead,
      strong: c.journal_strong,
    },
    social: {
      tag: c.social_tag,
      lead: c.social_lead,
      strong: c.social_strong,
      text: c.social_text,
      button: c.social_button,
      note: c.social_note,
    },
  };
}

/**
 * The home page's words and its Aptos marking photos: the WordPress page chosen as the homepage under
 * Settings > Reading. When WordPress cannot be reached, or has no home page to give (none chosen, not
 * published, no words saved), the built-in copy is shown.
 */
export async function getHomeCopy(): Promise<HomeCopy> {
  const read = await settle(getHomePage);
  return read.ok && read.data ? fromWordPress(read.data) : HOME_COPY;
}
