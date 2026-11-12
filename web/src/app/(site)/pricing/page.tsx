import type { Metadata } from "next";
import { Appointment } from "@/components/home/appointment";
import { BeforeAfter } from "@/components/home/before-after";
import { Process } from "@/components/home/process";
import { Saying } from "@/components/home/saying";
import { Social } from "@/components/home/social";
import { Team } from "@/components/home/team";
import { PriceList } from "@/components/pricing/price-list";
import { PriceSpecials } from "@/components/pricing/price-specials";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { PRICE_FAQS, PRICE_SPECIALS } from "@/config/pricing";
import { PRICE_NAMES } from "@/config/price-names";
import { buildPricingView } from "@/lib/pricing-view";
import { getPricingTree } from "@/lib/wordpress";
import { PriceListNotice } from "@/components/pricing/price-list-notice";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Treatments & Pricing, NewDermaMed Toronto",
  description: "Treatment prices and current offers at NewDermaMed, Toronto. Every treatment begins with a free consultation at our Uptown or Downtown clinic.",
};

/**
 * The parts of the page that show the price list, read from WooCommerce (cached, refreshed the moment
 * something changes there). When WooCommerce cannot be reached the page says so and tries again on the
 * next visit, instead of showing prices it cannot vouch for.
 */
async function PriceSections() {
  let view;
  try {
    view = buildPricingView(await getPricingTree(), PRICE_NAMES);
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
      {view.specials.length > 0 && <PriceSpecials specials={view.specials} sub={PRICE_SPECIALS.sub} note={PRICE_SPECIALS.note} />}
      <PriceList categories={view.categories} total={view.total} />
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
      <BeforeAfter />
      <Saying />
      <Faq items={PRICE_FAQS} eyebrow="FAQ" lead="Your top questions," strong="answered" intro="Everything you need to know before starting your journey with us." />
      <Appointment />
      <Social />
    </main>
  );
}
