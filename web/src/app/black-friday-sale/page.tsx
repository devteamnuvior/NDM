import type { Metadata } from "next";
import { BfSalePage } from "@/components/bf-sale/bf-sale";
import { BfsClass } from "@/components/bf-sale/bfs-class";
import { bfsDeals, bfsSpecials, type SpecialCard } from "@/components/bf-sale/data";
import { getOffers } from "@/lib/offers";
import { getSitePrices } from "@/lib/site-prices";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Black Friday 2026: Up to 60% Off Treatments | NewDermaMed Toronto",
  description: "NewDermaMed Black Friday, November 27 to 30: offers on laser, skin, injectable and body treatments at our Uptown and Downtown Toronto clinics. Build your plan and book a free consultation.",
};

/** The page with the deals and the current offers, both from WooCommerce; without them (WooCommerce unreachable) those sections are empty. */
async function Sale() {
  let specials: SpecialCard[] = [];
  try {
    specials = bfsSpecials(await getOffers());
  } catch (error) {
    unstable_rethrow(error);
    console.error("[offers] the current offers could not be read from WooCommerce:", error instanceof Error ? error.message : error);
    await connection(); /* not kept: the next request asks again */
  }
  const deals = bfsDeals((await getSitePrices())?.categories ?? []);
  return <BfSalePage specials={specials} deals={deals} />;
}

/** The Black Friday sale page. It has its own header and footer, so it sits outside the (site) layout. */
export default function BlackFridaySalePage() {
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
