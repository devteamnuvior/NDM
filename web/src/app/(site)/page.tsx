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
import { FAQS } from "@/config/home";

/** Home page: every section, top to bottom. The header and footer come from the root layout. */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Start />
      <TreatMenu />
      <AptosCare />
      <Space />
      <Team />
      <BeforeAfter />
      <Process />
      <Specials />
      <Saying />
      <VisitUs />
      <Faq items={FAQS} />
      <Appointment />
      <Shop />
      <Journal />
      <Social />
    </main>
  );
}
