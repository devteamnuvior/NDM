import "server-only";
import { unstable_rethrow } from "next/navigation";
import { bfsMax, saleDeals } from "@/components/bf-sale/data";
import { SALE_BADGES, SALE_HEADLINE, SALE_PRICE_CARDS, SALE_TIMERS } from "@/config/sale";
import { dateWords, dayWords, getCampaign, type CampaignPhase } from "@/lib/campaign";
import { getOffers } from "@/lib/offers";
import { fillPrices, getSitePrices } from "@/lib/site-prices";
import { saleWords, torontoTime } from "@/lib/sale-dates";
import type { SaleCopy, SalePhase, SalePriceCard, SaleView } from "@/types/sale";

/*
 * What a sale landing page shows: the page's words joined with WooCommerce. The deals are the lines WooCommerce
 * has in the campaign (or, without a campaign, the lines with an offer), the sale prices are read from the price
 * list, the phases, dates and the checkout code are the campaign's. No price or date is typed on this site.
 */

/** Names compared without regard to case, spacing or the kind of dash. */
const key = (text: string): string => text.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
const same = (a: string, b: string): boolean => key(a) === key(b);

interface SaleOptions {
  look: SaleView["look"];
  planKey: string;
  copy: SaleCopy;
  /** Which phases of the campaign are this page's: the VIP Sale's own, or every phase after it. */
  mine: (phase: CampaignPhase) => boolean;
  /** Where visitors go once the page's window has closed; empty: the page says the sale has ended. */
  after: string;
}

/** Whether the campaign has moved past this page's window (as WooCommerce last answered): the VIP Sale page then redirects. */
export async function saleIsPast(mine: (phase: CampaignPhase) => boolean): Promise<boolean> {
  const campaign = await getCampaign();
  if (!campaign) return false;
  const phases = campaign.phases.filter(mine);
  if (!phases.length) return false;
  if (campaign.over) return true;
  const now = campaign.phases.find((p) => p.id === campaign.phase);
  return !!now && now.from > phases[phases.length - 1].to;
}

export async function buildSale({ look, planKey, copy: raw, mine, after }: SaleOptions): Promise<SaleView> {
  const [prices, campaign] = await Promise.all([getSitePrices(), getCampaign()]);
  const categories = prices?.categories ?? [];
  const own = campaign?.phases.filter(mine) ?? [];
  /* the campaign's prices are on the list only while it runs: its lines say so themselves */
  const running = !!campaign && categories.some((c) => c.items.some((it) => it.options.some((o) => o.sale)));

  /* the page's window and phases: the campaign's, or the page's own dates when WooCommerce holds no campaign */
  let start: number;
  let end: number;
  let phases: SalePhase[];
  if (campaign && own.length) {
    start = own[0].from;
    end = own[own.length - 1].to;
    phases = own.map((p) => ({ from: p.from, to: p.to, eyebrow: p.label, timer: SALE_TIMERS[p.id] ?? `${p.label} ends in`, day: p.lastDay, date: p.lastDate, badge: SALE_BADGES[p.id] ?? "" }));
  } else {
    start = torontoTime(raw.starts) ?? 0;
    end = (torontoTime(raw.ends) ?? 0) + 59_999;
    phases = [{ from: start, to: end, eyebrow: raw.name, timer: "Offers end in", day: dayWords(end), date: dateWords(end), badge: "" }];
  }
  const words = saleWords(start, end);

  const groups = Object.fromEntries(raw.deals.groups.map((g) => [g.category, g.tab]));
  const deals = saleDeals(categories, groups, running);
  const held = new Set(deals.map((d) => d.group));
  const tabs = ["All deals", ...new Set(raw.deals.groups.map((g) => g.tab).filter((t) => held.has(t)))];
  const max = running ? SALE_HEADLINE : bfsMax(deals);
  const code = running && campaign ? campaign.code : "";

  /* the sale prices: each card's line on the price list, with the product's photo when WooCommerce has one */
  let photos = new Map<number, { src: string; set?: string; pos: string }>();
  try {
    photos = new Map((await getOffers()).flatMap((o) => (o.photo ? [[o.id, { src: o.photo.src, set: o.photo.srcSet || undefined, pos: o.position }] as const] : [])));
  } catch (error) {
    unstable_rethrow(error);
    /* no photos: the cards show their quantity instead */
  }
  const cards = !running
    ? []
    : SALE_PRICE_CARDS.flatMap((card): SalePriceCard[] => {
        for (const c of categories) {
          const item = c.items.find((it) => card.product.some((name) => same(it.name, name)));
          const option = item?.options.find((o) => same(o.label, card.option) && o.sale);
          if (!item || !option) continue;
          const photo = photos.get(item.id);
          return [{ title: card.title, qty: card.qty, price: option.price, regular: option.regular, drug: !!card.drug, img: card.drug ? "" : (photo?.src ?? ""), set: card.drug ? undefined : photo?.set, pos: photo?.pos ?? "50% 40%", cat: deals.some((d) => d.id === c.id) ? c.id : null }];
        }
        return [];
      }).slice(0, raw.specials.count);

  /* the words, with their tokens; a sentence whose value is not known is left out */
  const values = { max: max ? String(max) : undefined, dates: words.short, dates_long: words.long, dates_full: words.full, end: words.end, code: code || undefined, /* the phase's name is the browser's to fill in: it follows the clock (see Tape) */ phase: "{{phase}}" };
  const fill = (text: string) => fillPrices(text, values);
  const terms = fill(raw.footer.terms);
  const copy: SaleCopy = {
    ...raw,
    title: fill(raw.title) || `${raw.name} | NewDermaMed Toronto`,
    description: fill(raw.description),
    hero: { ...raw.hero, offer: fill(raw.hero.offer), text: fill(raw.hero.text) },
    gift: running ? fill(raw.gift) : "",
    tape: raw.tape.map(fill).filter(Boolean),
    how: raw.how.map((s) => ({ title: s.title, text: fill(s.text) })).filter((s) => s.text),
    concerns: { ...raw.concerns, text: fill(raw.concerns.text) },
    deals: { ...raw.deals, text: fill(raw.deals.text) },
    specials: { ...raw.specials, tag: fill(raw.specials.tag) },
    plan: { ...raw.plan, note: fill(raw.plan.note) },
    footer: { lead: raw.footer.lead, text: fill(raw.footer.text), terms: /individual results may vary/i.test(terms) ? terms : `${terms} Individual results may vary.`.trim() },
  };

  return { look, planKey, copy, start, end, startDay: dayWords(start), phases, after, code, percent: campaign?.percent ?? 0, max, deals, tabs, cards };
}
