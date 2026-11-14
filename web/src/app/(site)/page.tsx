import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { Appointment } from "@/components/home/appointment";
import { AptosCare } from "@/components/home/aptos-care";
import { BeforeAfter } from "@/components/home/before-after";
import { Hero } from "@/components/home/hero";
import { Journal } from "@/components/home/journal";
import { Process } from "@/components/home/process";
import { Saying } from "@/components/home/saying";
import { Shop } from "@/components/home/shop";
import { Social } from "@/components/home/social";
import { Space } from "@/components/home/space";
import { Start } from "@/components/home/start";
import { Team } from "@/components/home/team";
import { TreatMenu } from "@/components/home/treat-menu";
import { VisitUs } from "@/components/home/visit-us";
import { Specials } from "@/components/specials/specials";
import { Faq } from "@/components/ui/faq";
import { getHomeCopy } from "@/lib/home";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getHomeCopy();
  return { title, ...(description && { description }) };
}

/**
 * Home page: every section, top to bottom. The header and footer come from the root layout. The words of
 * its sections are the WordPress page chosen as the homepage under Settings > Reading; the films, cards, team, cases, reviews,
 * clinics, form, products, posts and reels are the site's, and every price comes from WooCommerce.
 */
export default async function HomePage() {
  const copy = await getHomeCopy();
  return (
    <main id="main">
      <Hero copy={copy.hero} />
      <About copy={copy.about} />
      <Start copy={copy.start} />
      <TreatMenu copy={copy.treatments} />
      <AptosCare copy={copy.aptos} />
      <Space copy={copy.space} />
      <Team copy={copy.team} />
      <BeforeAfter copy={copy.results} />
      <Process copy={copy.process} />
      {/* the offers come from WooCommerce: the rest of the page never waits for them */}
      <Suspense fallback={null}>
        <Specials />
      </Suspense>
      <Saying copy={copy.reviews} />
      <VisitUs copy={copy.visit} />
      {copy.faq.items.length > 0 && <Faq items={copy.faq.items} eyebrow={copy.faq.tag} lead={copy.faq.lead} strong={copy.faq.strong} intro={copy.faq.intro} />}
      <Appointment copy={copy.booking} />
      <Shop copy={copy.shop} />
      <Journal copy={copy.journal} />
      <Social copy={copy.social} />
    </main>
  );
}
