import type { Metadata } from "next";
import { Appointment } from "@/components/home/appointment";
import { BeforeAfter } from "@/components/home/before-after";
import { Process } from "@/components/home/process";
import { Saying } from "@/components/home/saying";
import { Social } from "@/components/home/social";
import { Team } from "@/components/home/team";
import { PromoGrid } from "@/components/promotion/promo-grid";
import { OFFERS } from "@/components/specials/offers";
import { Specials } from "@/components/specials/specials";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { PROMO_FAQS } from "@/config/promotion";

export const metadata: Metadata = {
  title: "Promotions, NewDermaMed Toronto",
  description: "NewDermaMed is Toronto's award-winning cosmetic and laser clinic, with Uptown and Downtown locations. Book a free consultation and VISIA® skin analysis.",
};

/** Promotions: the offers wheel as the page header, every current offer as a card, then the shared closing sections. */
export default function PromotionPage() {
  return (
    <main id="main" data-shell="inner" className="seamless">
      <Breadcrumb items={["Promotions"]} />
      <Specials level="h1" offersOnPage />
      <PromoGrid offers={OFFERS} />
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
