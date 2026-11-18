import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SalePage } from "@/components/sale/sale-page";
import { VipClass } from "@/components/vip-sale/vip-class";
import type { CampaignPhase } from "@/lib/campaign";
import { pagePath } from "@/lib/routes";
import { buildSale, saleIsPast } from "@/lib/sale";
import { getVipSaleCopy } from "@/lib/vip-sale";

/*
 * The earlier VIP Sale design, kept at this address since 2026-11-18 (user) when the redesigned page took over
 * /vip-sale. It is a parked copy: linked from nowhere, and always marked "noindex, nofollow" so search engines
 * do not list it or follow its links. Same campaign, deals and prices as /vip-sale.
 */

const mine = (phase: CampaignPhase) => phase.id === "vip";
const view = async () => buildSale({ look: "vip", planKey: "ndm-vip-plan", copy: await getVipSaleCopy(), mine, after: pagePath("blackFridaySale") });

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await view();
  return { title: copy.title, description: copy.description, robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };
}

async function Sale() {
  if (await saleIsPast(mine)) redirect(pagePath("blackFridaySale"));
  return <SalePage view={await view()} />;
}

export default function VipSaleEarlierRoute() {
  return (
    <>
      <VipClass />
      <Sale />
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("vip")' }} />
    </>
  );
}
