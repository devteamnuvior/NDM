import type { Metadata } from "next";
import { Suspense } from "react";
import { BfsClass } from "@/components/bf-sale/bfs-class";
import { SalePage } from "@/components/sale/sale-page";
import { BLACK_FRIDAY_COPY } from "@/config/sale";
import type { CampaignPhase } from "@/lib/campaign";
import { pagePath } from "@/lib/routes";
import { buildSale } from "@/lib/sale";
import { absolute } from "@/lib/seo";

/** Black Friday is every phase of the campaign after the VIP Sale: Black Friday, Cyber Monday, Black Friday Extended. */
const mine = (phase: CampaignPhase) => phase.id !== "vip";
const view = () => buildSale({ look: "bfs", planKey: "ndm-bf-plan", copy: BLACK_FRIDAY_COPY, mine, after: "" });

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await view();
  const { title, description } = copy;
  const path = pagePath("blackFridaySale");
  return { title, description, alternates: { canonical: absolute(path) }, openGraph: { title, description, url: absolute(path), images: [absolute(copy.hero.photo.src)] } };
}

/** The page with its deals and prices, both from WooCommerce; without them (WooCommerce unreachable) those sections are empty. */
async function Sale() {
  return <SalePage view={await view()} />;
}

/** The Black Friday page. It has its own header and footer, so it sits outside the (site) layout. */
export default function BlackFridayPage() {
  return (
    <>
      {/* the page's look hangs on a class on <html>: set it before the first paint */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("bfs")' }} />
      <BfsClass />
      <Suspense fallback={null}>
        <Sale />
      </Suspense>
    </>
  );
}
