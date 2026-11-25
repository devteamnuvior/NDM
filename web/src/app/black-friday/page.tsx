import type { Metadata } from "next";
import { bfsMax } from "@/components/bf-sale/data";
import { VipSaleV2 } from "@/components/sale/vip-sale-v2";
import { VipClass } from "@/components/vip-sale/vip-class";
import { BLACK_FRIDAY_V2, BLACK_FRIDAY_V2_LIST_KEY } from "@/config/black-friday-v2";
import { BLACK_FRIDAY_COPY } from "@/config/sale";
import type { CampaignPhase } from "@/lib/campaign";
import { pagePath } from "@/lib/routes";
import { redirect } from "next/navigation";
import { buildSale, saleIsPast } from "@/lib/sale";
import { absolute } from "@/lib/seo";

/*
 * The Black Friday page (user, 2026-11-19): the VIP Sale page's layout (components/sale/vip-sale-v2.tsx) with its
 * own words (config/black-friday-v2.ts) in the Black Friday colours (class "vbf" on <html>,
 * styles/page-black-friday-v2.css). Deals, prices and the campaign are WooCommerce's. The earlier Black Friday
 * page is kept at /black-friday-2.
 */

/** Black Friday is every phase of the campaign after the VIP Sale: Black Friday, Cyber Monday, Black Friday Extended. */
const mine = (phase: CampaignPhase) => phase.id !== "vip";
/* once the sale has ended (Mon, Dec 7, 11:59 pm Toronto) the page sends visitors to the home page (Black Friday brief, Task 08) */
const AFTER = "/";
const view = () => buildSale({ look: "bfs", planKey: BLACK_FRIDAY_V2_LIST_KEY, copy: BLACK_FRIDAY_COPY, mine, after: AFTER });

export async function generateMetadata(): Promise<Metadata> {
  const { deals, phases, copy } = await view();
  const fill = (text: string) => text.replaceAll("{{max}}", String(bfsMax(deals))).replaceAll("{{day}}", phases.at(-1)?.day ?? "");
  const title = fill(BLACK_FRIDAY_V2.title);
  const description = fill(BLACK_FRIDAY_V2.description);
  const path = pagePath("blackFridaySale");
  return { title, description, alternates: { canonical: absolute(path) }, openGraph: { title, description, url: absolute(path), images: [absolute(copy.hero.photo.src)] } };
}

/** The page with its deals and prices, both from WooCommerce. */
async function Sale() {
  return <VipSaleV2 view={await view()} words={BLACK_FRIDAY_V2} />;
}

/** It has its own header and footer, so it sits outside the (site) layout. */
export default async function BlackFridayPage() {
  /* WooCommerce's answer on the server; the page's own clock does the same in the browser (VipSaleV2) */
  if (await saleIsPast(mine)) redirect(AFTER);
  return (
    <>
      <VipClass extra="vbf" />
      {/* no Suspense around it: everything it reads is cached, so the page's content is in the first HTML */}
      <Sale />
      {/* the page's look hangs on classes on <html>, set by a script placed after the content */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("vip","vbf")' }} />
    </>
  );
}
