import "server-only";
import { ABOUT_COPY } from "@/config/about";
import { getAboutPage, settle } from "@/lib/wordpress";
import type { AboutCopy, WPAboutPage } from "@/types/about";

/** The WordPress page as the sections read it. A gallery row without a photo is left out. */
function fromWordPress(wp: WPAboutPage): AboutCopy {
  const c = wp.content;
  return {
    title: c.seo_title || ABOUT_COPY.title,
    description: c.seo_description || ABOUT_COPY.description,
    header: { tag: c.header_tag, lead: c.heading_1, strong: c.heading_2, text: c.intro, stats: c.stats },
    team: { tag: c.team_tag, lead: c.team_lead, strong: c.team_strong, intro: c.team_intro },
    clinics: { tag: c.clinics_tag, lead: c.clinics_lead, strong: c.clinics_strong },
    gallery: {
      photos: c.photos.flatMap((p) => (p.image ? [{ src: p.image.src, title: p.title, alt: p.image.alt }] : [])),
      tag: c.awards_tag,
      line: c.awards_line,
      lead: c.awards_lead,
      strong: c.awards_strong,
      text: c.awards_text,
    },
    faq: {
      tag: c.faq_tag,
      lead: c.faq_lead,
      strong: c.faq_strong,
      intro: c.faq_intro,
      items: c.faqs.flatMap((f): [string, string][] => (f.q && f.a ? [[f.q, f.a]] : [])),
    },
    contact: { tag: c.contact_tag, lead: c.contact_lead, strong: c.contact_strong, text: c.contact_text },
  };
}

/**
 * The About page's words and gallery photos: the published WordPress post of the type "About Page".
 * When WordPress cannot be reached, or the page is not published, the built-in copy is shown.
 */
export async function getAboutCopy(): Promise<AboutCopy> {
  const read = await settle(getAboutPage);
  return read.ok && read.data ? fromWordPress(read.data) : ABOUT_COPY;
}
