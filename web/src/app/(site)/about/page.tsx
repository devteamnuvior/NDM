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
import { getAboutCopy } from "@/lib/about";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getAboutCopy();
  return { title, description };
}

/**
 * About: the clinic film as the header, the team, the two clinics with their maps, the gallery and awards,
 * contact. Its words and gallery photos are the WordPress post of the type "About Page"; the film, the
 * team, the clinics, How it works and the form are the site's.
 */
export default async function AboutPage() {
  const copy = await getAboutCopy();
  return (
    <main id="main" data-shell="inner" data-page="about">
      <Breadcrumb items={["About us"]} dark />
      <AboutFilm copy={copy.header} />
      <AboutTeam copy={copy.team} />
      <AboutClinics copy={copy.clinics} />
      <AboutGallery copy={copy.gallery} />
      <Process />
      {copy.faq.items.length > 0 && <Faq items={copy.faq.items} eyebrow={copy.faq.tag} lead={copy.faq.lead} strong={copy.faq.strong} intro={copy.faq.intro} />}
      <AboutContact copy={copy.contact} />
      <Social />
    </main>
  );
}
