import type { Metadata } from "next";
import { Appointment } from "@/components/home/appointment";
import { BeforeAfter } from "@/components/home/before-after";
import { Process } from "@/components/home/process";
import { Saying } from "@/components/home/saying";
import { Social } from "@/components/home/social";
import { Team } from "@/components/home/team";
import { PromoGrid } from "@/components/promotion/promo-grid";
import { Specials } from "@/components/specials/specials";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { PROMO_FAQS } from "@/config/promotion";
import { PromoNotice } from "@/components/promotion/promo-notice";
import { getOffers } from "@/lib/offers";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Promotions, NewDermaMed Toronto",
  description: "NewDermaMed is Toronto's award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.",
};

/**
 * The parts of the page that show the offers, read from WooCommerce (cached, refreshed the moment
 * something changes there). When WooCommerce cannot be reached the page says so and tries again on the
 * next visit, instead of showing offers it cannot vouch for.
 */
async function OfferSections() {
  let offers;
  try {
    offers = await getOffers();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[offers] the current offers could not be read from WooCommerce:", error instanceof Error ? error.message : error);
    await connection(); /* not kept: the next request asks again */
    return <PromoNotice state="error" />;
  }
  if (!offers.length) return <PromoNotice state="empty" />;
  return (
    <>
      <Specials level="h1" offersOnPage offers={offers} />
      <PromoGrid offers={offers} />
    </>
  );
}

/** Promotions: the offers wheel as the page header, every current offer as a card, then the shared closing sections. */
export default function PromotionPage() {
  return (
    <main id="main" data-shell="inner" className="seamless">
      <Breadcrumb items={["Promotions"]} />
      <Suspense fallback={<PromoNotice state="loading" />}>
        <OfferSections />
      </Suspense>
      <Team inner />
      <Process />
      <BeforeAfter />
      <Saying />
      <Faq items={PROMO_FAQS} eyebrow="FAQ" lead="Your top questions," strong="answered" intro="Everything you need to know before starting your journey with us." />
      <Appointment />
      <Social />
    </main>
  );
}
