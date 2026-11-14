import { BOTOX } from "@/config/botox";
import type { ProcedurePage } from "@/types/treatment";

/**
 * What every procedure page shares, word for word from the original Botox page. A procedure's own
 * content comes from WordPress (the post type "Procedures"); nothing here is typed there.
 */
export const PROCEDURE_SHARED = {
  /** First step of the breadcrumb. */
  crumb: BOTOX.crumbs[0],
  /** The clinics, in one line under the header's intro. */
  where: BOTOX.where,
  /** The section bar; a section the procedure has no content for is left out of it. */
  nav: BOTOX.nav,
  /** The offer card of the header: its title is the procedure's, its figure is WooCommerce's largest offer. */
  offer: { tag: BOTOX.offer!.tag, big: BOTOX.offer!.big, href: BOTOX.offer!.href, cta: BOTOX.offer!.cta },
  /** Benefits: the section's tag, and the background a diagram is shown whole on. */
  intro: { id: BOTOX.intro.id, tag: BOTOX.intro.tag, contain: BOTOX.intro.contain },
  /** The clinic film; its heading starts with the procedure's name. */
  film: { src: BOTOX.film.src, poster: BOTOX.film.poster, strong: BOTOX.film.strong, text: BOTOX.film.text, chips: BOTOX.film.chips },
  overview: { tag: BOTOX.overview.tag },
  choose: { tag: BOTOX.choose.tag, lead: BOTOX.choose.lead },
  reel: { lead: BOTOX.reel.lead, strong: BOTOX.reel.strong },
  results: { strong: BOTOX.results.strong, text: BOTOX.results.text },
  prices: { strong: BOTOX.prices.strong },
  guide: { tag: BOTOX.guide.tag },
  why: BOTOX.why,
  faq: { lead: BOTOX.faq.lead, sub: BOTOX.faq.sub },
} satisfies Record<string, unknown>;

/** Procedures with a built-in copy, shown when WordPress cannot be reached. Its price list names WooCommerce products (`page.prices`). */
export const BUILT_IN_PROCEDURES: Record<string, { page: ProcedurePage; title: string; description: string; type: string }> = {
  botox: {
    page: BOTOX,
    /* its post type in WordPress, which gives its address: /injectables/botox */
    type: "Injectables",
    title: "Botox Toronto from {{price}}/Unit, Free Consultation | NewDermaMed",
    description:
      "Botox® Cosmetic in Toronto from {{price}} per unit, packages up to {{maxoff}} off. Free consultation and VISIA® skin analysis at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.",
  },
};
