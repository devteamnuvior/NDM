import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VipSaleV2 } from "@/components/sale/vip-sale-v2";
import { VipClass } from "@/components/vip-sale/vip-class";
import { bfsMax } from "@/components/bf-sale/data";
import { VIP_SALE_PATH } from "@/config/vip-sale";
import { VIP2, VIP2_LIST_KEY } from "@/config/vip-sale-v2";
import type { CampaignPhase } from "@/lib/campaign";
import { pagePath } from "@/lib/routes";
import { buildSale, saleIsPast } from "@/lib/sale";
import { absolute } from "@/lib/seo";
import { getVipSaleCopy } from "@/lib/vip-sale";

/*
 * The VIP Sale page: since 2026-11-18 (user) the redesigned page (the marketing team's redesign document of
 * 2026-11-17 and the changes after it), which was first shown at /vip-sale-v2. The earlier design now lives at
 * /vip-sale-v2, kept out of search engines. Deals, prices and the campaign are WooCommerce's, as before; the page's
 * search-engine switch is still the WordPress VIP Sale page's "noindex" setting.
 */

/** The VIP Sale is the campaign's first phase. */
const mine = (phase: CampaignPhase) => phase.id === "vip";
const view = async () => buildSale({ look: "vip", planKey: VIP2_LIST_KEY, copy: await getVipSaleCopy(), mine, after: pagePath("blackFridaySale") });

export async function generateMetadata(): Promise<Metadata> {
  const { deals, phases, copy } = await view();
  const fill = (text: string) => text.replaceAll("{{max}}", String(bfsMax(deals))).replaceAll("{{day}}", phases.at(-1)?.day ?? "");
  const title = fill(VIP2.title);
  const description = fill(VIP2.description);
  return {
    title,
    description,
    alternates: { canonical: absolute(VIP_SALE_PATH) },
    openGraph: { title, description, url: absolute(VIP_SALE_PATH), images: [absolute(copy.hero.photo.src)] },
    robots: copy.noindex ? { index: false, follow: false } : undefined,
  };
}

/** Once the VIP Sale is over the address hands over to Black Friday. */
async function Sale() {
  if (await saleIsPast(mine)) redirect(pagePath("blackFridaySale"));
  return <VipSaleV2 view={await view()} />;
}

/** It has its own header and footer, so it sits outside the (site) layout. */
export default function VipSaleRoute() {
  return (
    <>
      <VipClass />
      {/* no Suspense around it: everything it reads is cached, so the page's content is in the first HTML and
          paints at once (inside a boundary it arrives hidden and is only shown by a script, after the photos and fonts) */}
      <Sale />
      {/* the page's look hangs on a class on <html>, set by a script placed after the content: above it, the
          browser read nothing below it until the stylesheet had loaded */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("vip")' }} />
    </>
  );
}
