import type { Metadata } from "next";
import { Gallery } from "@/components/before-after/gallery";
import { Saying } from "@/components/home/saying";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GALLERY, GALLERY_CASES } from "@/config/gallery";

export const metadata: Metadata = {
  title: "Before & After Gallery, NewDermaMed Toronto",
  description: `${GALLERY.subs[0]} Individual results may vary.`,
};

/** Before & after: the gallery of cases, then the testimonials. */
export default function BeforeAfterPage() {
  return (
    <main id="main" data-shell="inner">
      <Breadcrumb items={["Before & after"]} />
      <Gallery {...GALLERY} cases={GALLERY_CASES} />
      <Saying />
    </main>
  );
}
