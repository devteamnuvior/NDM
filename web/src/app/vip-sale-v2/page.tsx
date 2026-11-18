import type { Metadata } from "next";
import { VipSaleV2 } from "@/components/sale/vip-sale-v2";
import { VipClass } from "@/components/vip-sale/vip-class";
import { bfsMax } from "@/components/bf-sale/data";
import { VIP2, VIP2_LIST_KEY } from "@/config/vip-sale-v2";
import type { CampaignPhase } from "@/lib/campaign";
import { buildSale } from "@/lib/sale";
import { getVipSaleCopy } from "@/lib/vip-sale";

/*
 * The redesigned VIP Sale page, a clone for review beside the live /vip-sale: phase 1 and phase 2 of the
 * marketing team's redesign document (2026-11-17) and the changes that follow it. It reads the same campaign,
 * deals and prices from WooCommerce as /vip-sale; only the page around them is new. Kept out of search engines
 * and linked from nowhere.
 */

const mine = (phase: CampaignPhase) => phase.id === "vip";
const view = async () => buildSale({ look: "vip", planKey: VIP2_LIST_KEY, copy: await getVipSaleCopy(), mine, after: "" });

export async function generateMetadata(): Promise<Metadata> {
  const { deals, phases } = await view();
  const fill = (text: string) => text.replaceAll("{{max}}", String(bfsMax(deals))).replaceAll("{{day}}", phases.at(-1)?.day ?? "");
  return { title: fill(VIP2.title), description: fill(VIP2.description), robots: { index: false, follow: false } };
}

async function Sale() {
  return <VipSaleV2 view={await view()} />;
}

export default function VipSaleV2Route() {
  return (
    <>
      <VipClass />
      {/* no Suspense around it and the class script after the content, as on /vip-sale (see that page) */}
      <Sale />
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("vip")' }} />
    </>
  );
}
