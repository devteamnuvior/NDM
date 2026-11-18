import type { Metadata } from "next";
import { HubPage } from "@/components/procedures/hub-page";
import { JsonLd } from "@/components/ui/json-ld";
import { ABOUT_CLINICS } from "@/config/about";
import { CLINICS } from "@/config/site";
import { getProceduresHub } from "@/lib/procedures-hub";
import { absolute, breadcrumbList, publisher, siteOrigin } from "@/lib/seo";

const TITLE = "Cosmetic & Laser Treatments in Toronto | NewDermaMed";
const DESCRIPTION =
  "Explore around 50 non-surgical cosmetic and laser treatments at our North York and Downtown Toronto clinics, by treatment or concern. Free consultation.";
const PATH = "/procedures";

export function generateMetadata(): Metadata {
  const url = absolute(PATH);
  const image = absolute("/assets/home/hero/reception.jpg");
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "NewDermaMed", locale: "en_CA", title: TITLE, description: DESCRIPTION, images: [{ url: image, alt: "The NewDermaMed clinic reception in Toronto" }] },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [image] },
  };
}

/** Both clinics as schema.org MedicalClinic entities, with what the site itself states (address, phone, hours, map position). */
function clinicsGraph(): Record<string, unknown>[] {
  const origin = siteOrigin() ?? "";
  const hours = [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "19:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "17:00" },
  ];
  return CLINICS.map((c) => {
    const about = ABOUT_CLINICS.find((a) => a.id === c.id);
    const [street, rest = ""] = about?.address ?? [c.address, ""];
    const m = /^(.*),\s*ON\s+(\S+\s?\S+)$/.exec(rest);
    return {
      "@type": "MedicalClinic",
      "@id": `${origin}/#clinic-${c.id}`,
      name: `NewDermaMed ${c.name}`,
      url: absolute("/about"),
      telephone: `+1-${c.phone}`,
      address: { "@type": "PostalAddress", streetAddress: street, addressLocality: m?.[1] ?? "Toronto", addressRegion: "ON", postalCode: m?.[2] ?? "", addressCountry: "CA" },
      ...(about ? { geo: { "@type": "GeoCoordinates", latitude: about.position[0], longitude: about.position[1] }, hasMap: about.map } : {}),
      openingHoursSpecification: hours,
      parentOrganization: publisher(),
    };
  });
}

/**
 * /procedures, the treatments hub: every procedure page WordPress holds, by group, with the finder,
 * concerns, comparisons, technology, the visit, both clinics and questions (`getProceduresHub`).
 */
export default async function ProceduresIndex() {
  const view = await getProceduresHub();
  const url = absolute(PATH);
  const items = view.groups.flatMap((g) => g.cards);
  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "CollectionPage",
            "@id": `${url}#page`,
            url,
            name: "Cosmetic & laser treatments in Toronto",
            description: DESCRIPTION,
            inLanguage: "en-CA",
            publisher: publisher(),
            about: CLINICS.map((c) => ({ "@id": `${siteOrigin() ?? ""}/#clinic-${c.id}` })),
            mainEntity: {
              "@type": "ItemList",
              name: "Treatments at NewDermaMed",
              numberOfItems: items.length,
              itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: absolute(c.path) })),
            },
          },
          breadcrumbList([["Procedures", PATH]]),
          ...clinicsGraph(),
        ]}
      />
      <HubPage view={view} />
    </>
  );
}
