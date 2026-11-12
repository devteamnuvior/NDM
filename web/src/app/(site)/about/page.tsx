import type { Metadata } from "next";
import { AboutClinics } from "@/components/about/about-clinics";
import { AboutContact } from "@/components/about/about-contact";
import { AboutFilm } from "@/components/about/about-film";
import { AboutGallery } from "@/components/about/about-gallery";
import { AboutTeam } from "@/components/about/about-team";
import { Process } from "@/components/home/process";
import { Social } from "@/components/home/social";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Faq } from "@/components/ui/faq";
import { ABOUT_FAQS } from "@/config/about";

export const metadata: Metadata = {
  title: "About Us, NewDermaMed Cosmetic & Laser Clinic in Toronto",
  description: "Meet the NewDermaMed medical team and visit our Uptown and Downtown Toronto clinics: addresses, hours, parking, a clinic gallery and answers to common questions.",
};

/** About: the clinic film as the header, the team, the two clinics with their maps, the gallery and awards, contact. */
export default function AboutPage() {
  return (
    <main id="main" data-shell="inner" data-page="about">
      <Breadcrumb items={["About us"]} dark />
      <AboutFilm />
      <AboutTeam />
      <AboutClinics />
      <AboutGallery />
      <Process />
      <Faq items={ABOUT_FAQS} eyebrow="FAQ" lead="Your top questions," strong="answered" intro="Everything you need to know about our team, our clinics and your first visit." />
      <AboutContact />
      <Social />
    </main>
  );
}
