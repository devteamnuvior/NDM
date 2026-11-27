import "server-only";
import { SALE_HEADLINE } from "@/config/sale";
import { dateWords, getCampaign } from "@/lib/campaign";
import type { ShopSale } from "@/types/shop";

/**
 * The holiday sale as the shop's header slide shows it: the phase running now and the Black Friday phase, both
 * from WooCommerce's campaign on the clinic site (never typed here), and the sale's headline as the home page's
 * tapes and the sale tab say it. Null when no campaign runs, it is over, or WooCommerce cannot be reached.
 * The page never reads the clock: the slide's countdown runs in the browser.
 */
export async function getShopSale(): Promise<ShopSale | null> {
  const campaign = await getCampaign();
  if (!campaign || campaign.over) return null;
  const bf = campaign.phases.find((p) => p.id === "black-friday");
  if (!bf) return null;
  const now = campaign.phases.find((p) => p.id === campaign.phase) ?? null;
  return {
    now: now ? { label: now.label, to: now.to } : null,
    blackFriday: { label: bf.label, from: bf.from, to: bf.to, days: `${dateWords(bf.from)} to ${dateWords(bf.to)}` },
    headline: `Up to ${SALE_HEADLINE}% off selected treatments`,
    link: campaign.phase === "vip" ? "/vip-sale" : "/black-friday",
    cta: campaign.phase === "vip" ? "Shop the VIP Sale" : `See ${now?.label ?? bf.label} offers`,
  };
}
