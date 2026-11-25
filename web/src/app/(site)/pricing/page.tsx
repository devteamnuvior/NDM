import type { Metadata } from "next";
import { Appointment } from "@/components/home/appointment";
import { BeforeAfterSection } from "@/components/home/before-after-section";
import { Process } from "@/components/home/process";
import { Saying } from "@/components/home/saying";
import { Social } from "@/components/home/social";
import { Team } from "@/components/home/team";
import { PriceList, type PriceListSale } from "@/components/pricing/price-list";
import { PriceSpecials } from "@/components/pricing/price-specials";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { PriceCountdown } from "@/components/pricing/price-countdown";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { PRICE_FAQS, PRICE_SPECIALS } from "@/config/pricing";
import { PRICE_NAMES } from "@/config/price-names";
import { SALE_HEADLINE } from "@/config/sale";
import { priceSpecials } from "@/lib/offer-prices";
import { pagePath } from "@/lib/routes";
import { dateWords } from "@/lib/campaign";
import type { WooCampaign } from "@/types/pricing";
import type { WooPromotion } from "@/types/promotions";
import { buildPricingView } from "@/lib/pricing-view";
import { getPricingTree, getPromotions } from "@/lib/wordpress";
import { PriceListNotice } from "@/components/pricing/price-list-notice";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Treatments & Pricing, NewDermaMed Toronto",
  description: "Treatment prices and current offers at NewDermaMed, Toronto. Every treatment begins with a free consultation at our Uptown or Downtown clinic.",
};

/**
 * What the price list says about the sale while one runs: the checkout code's line under every package it
 * applies to, and the Black Friday banner above the list. Since 2026-11-19 (user) the banner and the list's look
 * are Black Friday's in every phase, the VIP Sale's days included: it ends with the campaign and opens /black-friday.
 */
function saleOnPriceList(campaign: WooCampaign | null | undefined): PriceListSale | null {
  if (!campaign || campaign.over || !campaign.phase) return null;
  const banner = {
    name: "Black Friday",
    text: `up to ${SALE_HEADLINE}%\u00a0off selected packages. Eligible packages take an extra ${campaign.percent}%\u00a0off, applied at checkout.`,
    cta: "See the Black Friday deals",
    href: pagePath("blackFridaySale"),
    ends: dateWords(Date.parse(campaign.end)),
  };
  return { code: campaign.code, percent: campaign.percent, banner, look: "bf" };
}

/**
 * The parts of the page that show the price list, read from WooCommerce (cached, refreshed the moment
 * something changes there). When WooCommerce cannot be reached the page says so and tries again on the
 * next visit, instead of showing prices it cannot vouch for.
 */
async function PriceSections() {
  let tree;
  let view;
  let sale: PriceListSale | null = null;
  try {
    tree = await getPricingTree();
    view = buildPricingView(tree, PRICE_NAMES);
    sale = saleOnPriceList(tree.campaign);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[pricing] the price list could not be read from WooCommerce:", error instanceof Error ? error.message : error);
    await connection(); /* not kept: the next request asks again */
    return (
      <>
        <PricingHero total={null} />
        <PriceListNotice state="error" />
      </>
    );
  }

  /* the monthly specials are a list kept in WooCommerce; one that is also an offer shows the offer's own figures, so the wheel and this page agree */
  let promotions: WooPromotion[] = [];
  try {
    promotions = await getPromotions();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[pricing] the offers could not be read from WooCommerce:", error instanceof Error ? error.message : error);
  }
  /* a plugin older than the list: the offers themselves, which is what the list starts as */
  const chosen = tree.specials ?? promotions.map((p) => ({ productId: p.productId, name: p.name, scope: p.scope, productName: p.productName }));
  const specials = priceSpecials(tree, chosen, promotions);

  if (!view.categories.length) {
    return (
      <>
        <PricingHero total={null} />
        <PriceListNotice state="empty" />
      </>
    );
  }

  return (
    <>
      <PricingHero total={view.total} />
      <PriceCountdown />
      {specials.length > 0 && <PriceSpecials specials={specials} sub={PRICE_SPECIALS.sub} note={PRICE_SPECIALS.note} />}
      <PriceList categories={view.categories} total={view.total} sale={sale} />
    </>
  );
}

/** Pricing: the film header, the monthly specials, the full price list, then the shared closing sections. */
export default function PricingPage() {
  return (
    <main id="main" data-shell="inner" className="seamless">
      <Breadcrumb items={["Pricing"]} dark />
      <Suspense
        fallback={
          <>
            <PricingHero total={null} />
            <PriceListNotice state="loading" />
          </>
        }
      >
        <PriceSections />
      </Suspense>
      <Team inner />
      <Process />
      <BeforeAfterSection />
      <Saying />
      <Faq items={PRICE_FAQS} eyebrow="FAQ" lead="Your top questions," strong="answered" intro="Everything you need to know before starting your journey with us." />
      <Appointment />
      <Social />
    </main>
  );
}
