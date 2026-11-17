import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SalePage } from "@/components/sale/sale-page";
import { VipClass } from "@/components/vip-sale/vip-class";
import { VIP_SALE_PATH } from "@/config/vip-sale";
import type { CampaignPhase } from "@/lib/campaign";
import { pagePath } from "@/lib/routes";
import { buildSale, saleIsPast } from "@/lib/sale";
import { absolute } from "@/lib/seo";
import { getVipSaleCopy } from "@/lib/vip-sale";

/** The VIP Sale is the campaign's first phase. */
const mine = (phase: CampaignPhase) => phase.id === "vip";
const view = async () => buildSale({ look: "vip", planKey: "ndm-vip-plan", copy: await getVipSaleCopy(), mine, after: pagePath("blackFridaySale") });

/** Title, description and social card from the page's settings in WordPress. */
export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await view();
  const { title, description } = copy;
  return {
    title,
    description,
    alternates: { canonical: absolute(VIP_SALE_PATH) },
    openGraph: { title, description, url: absolute(VIP_SALE_PATH), images: [absolute(copy.hero.photo.src)] },
    robots: copy.noindex ? { index: false, follow: false } : undefined,
  };
}

/** The page with its settings (WordPress) and its deals and prices (WooCommerce). Once the VIP Sale is over it hands over to Black Friday. */
async function Sale() {
  if (await saleIsPast(mine)) redirect(pagePath("blackFridaySale"));
  return <SalePage view={await view()} />;
}

/** The VIP Sale page. It has its own header and footer, so it sits outside the (site) layout. */
export default function VipSaleRoute() {
  return (
    <>
      <VipClass />
      {/* no Suspense around it: everything it reads is cached, so the page's content is in the first HTML and
          paints at once (inside a boundary it arrives hidden and is only shown by a script, after the photos and fonts) */}
      <Sale />
      {/* the page's look hangs on a class on <html>: set before the first paint. An inline script waits for the
          stylesheet, and the browser reads nothing below it meanwhile, so it comes after the page's content:
          placed above it, the first paint was empty and the content only showed after the scripts had run */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("vip")' }} />
    </>
  );
}
