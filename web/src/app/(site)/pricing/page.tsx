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
import { PRICE_SPECIALS_VIEW, PRICE_TOTAL, PRICE_VIEW } from "@/lib/pricing-view";

export const metadata: Metadata = {
  title: "Treatments & Pricing, NewDermaMed Toronto",
  description: "Treatment prices and current offers at NewDermaMed, Toronto. Every treatment begins with a free consultation at our Uptown or Downtown clinic.",
};

/** Pricing: the film header, the monthly specials, the full price list, then the shared closing sections. */
export default function PricingPage() {
  return (
    <main id="main" data-shell="inner" className="seamless">
      <Breadcrumb items={["Pricing"]} dark />
      <PricingHero total={PRICE_TOTAL} />
      <PriceSpecials specials={PRICE_SPECIALS_VIEW} sub={PRICE_SPECIALS.sub} note={PRICE_SPECIALS.note} />
      <PriceList categories={PRICE_VIEW} total={PRICE_TOTAL} />
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
