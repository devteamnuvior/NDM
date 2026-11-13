import "server-only";
import { HOME_COPY } from "@/config/home";
import { getHomePage, settle } from "@/lib/wordpress";
import type { HomeCopy, PointIcon, ProofIcon, WPHomePage } from "@/types/home";

const PROOF_ICONS: ProofIcon[] = ["physician", "award", "clinics", "analysis"];
const POINT_ICONS: PointIcon[] = ["check", "thread", "shield"];

/** The icon picked in the edit screen ("Award") as the site names it; an unknown one becomes the first. */
function icon<T extends string>(known: T[], picked: string): T {
  const name = picked.toLowerCase() as T;
  return known.includes(name) ? name : known[0];
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
    start: { tag: c.start_tag, lead: c.start_lead, strong: c.start_strong },
    treatments: {
      tag: c.treat_tag,
      lead: c.treat_lead,
      strong: c.treat_strong,
      text: c.treat_text,
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
