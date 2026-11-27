import "server-only";
import { VIP_SALE_COPY } from "@/config/vip-sale";
import { getVipSalePage, settle } from "@/lib/wordpress";
import type { VipSaleCopy, WPVipSalePage } from "@/types/vip-sale";

/*
 * The VIP Sale page's settings and words, from WordPress (the page with the template "VIP Sale page").
 * lib/sale.ts joins them with the campaign and the prices in WooCommerce.
 */

/** The WordPress page as the page reads it. An empty field keeps the built-in words; an empty list keeps the built-in list. */
function fromWordPress(wp: WPVipSalePage): VipSaleCopy {
  const c = wp.content;
  const d = VIP_SALE_COPY;
  const slug = (source: string) => (source.startsWith("category:") ? source.slice(9) : "");
  const how = c.how.filter((s) => s.title);
  const concerns = c.concerns.filter((x) => x.name).map((x) => ({ name: x.name, text: x.text, categories: x.categories.map((k) => slug(k.category)).filter(Boolean) }));
  const groups = c.groups.map((g) => ({ category: slug(g.category), tab: g.tab })).filter((g) => g.category && g.tab);
  const count = Number.parseInt(c.specials_count, 10);
  return {
    title: c.seo_title || d.title,
    description: c.seo_description || d.description,
    noindex: c.noindex,
    name: c.sale_name || d.name,
    starts: c.starts || d.starts,
    ends: c.ends || d.ends,
    hero: {
      lead: c.heading_1 || d.hero.lead,
      strong: c.heading_2 || d.hero.strong,
      offer: c.offer_words || d.hero.offer,
      text: c.intro || d.hero.text,
      photo: c.photo ? { src: c.photo.src, width: c.photo.width, height: c.photo.height } : d.hero.photo,
    },
    gift: c.gift || d.gift,
    tape: c.tape.length ? c.tape : d.tape,
    how: how.length ? how : d.how,
    concerns: { lead: c.concerns_lead || d.concerns.lead, strong: c.concerns_strong || d.concerns.strong, text: c.concerns_text || d.concerns.text, items: concerns.length ? concerns : d.concerns.items },
    deals: { lead: c.deals_lead || d.deals.lead, strong: c.deals_strong || d.deals.strong, text: c.deals_text || d.deals.text, groups: groups.length ? groups : d.deals.groups },
    specials: { tag: c.specials_tag || d.specials.tag, lead: c.specials_lead || d.specials.lead, strong: c.specials_strong || d.specials.strong, count: count >= 0 && count <= 12 ? count : d.specials.count },
    plan: { lead: c.plan_lead || d.plan.lead, strong: c.plan_strong || d.plan.strong, note: c.plan_note || d.plan.note },
    clinics: { tag: c.clinics_tag || d.clinics.tag, lead: c.clinics_lead || d.clinics.lead, strong: c.clinics_strong || d.clinics.strong },
    footer: { lead: c.footer_lead || d.footer.lead, text: c.footer_text || d.footer.text, terms: c.footer_terms || d.footer.terms },
  };
}

/**
 * The page's settings and words: the published WordPress page with the template "VIP Sale page" (or the
 * slug "vip-sale"); the built-in copy when WordPress cannot be reached or has no such published page.
 */
export async function getVipSaleCopy(): Promise<VipSaleCopy> {
  const read = await settle(getVipSalePage);
  return read.ok && read.data ? fromWordPress(read.data) : VIP_SALE_COPY;
}
