import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Gallery } from "@/components/before-after/gallery";
import { GalleryNotice } from "@/components/before-after/gallery-notice";
import { Saying } from "@/components/home/saying";
import { ProcAnalysis } from "@/components/treatment/proc-analysis";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GALLERY } from "@/config/gallery";
import { getGallery } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Before & After Gallery, NewDermaMed Toronto",
  description: `${GALLERY.subs[0]} Individual results may vary.`,
};

/**
 * The gallery, read from WordPress: every post of the type "Before & After", filtered by its taxonomy
 * "Category", under the intro of the WordPress page "Before & After" (cached, refreshed the moment
 * something changes there). When WordPress cannot be reached the page says so and tries again on the
 * next visit.
 */
async function GallerySection() {
  let view;
  try {
    view = await getGallery();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[before-after] the gallery could not be read from WordPress:", error instanceof Error ? error.message : error);
    await connection(); /* not kept: the next request asks again */
    return <GalleryNotice state="error" />;
  }
  if (!view.cases.length) return <GalleryNotice state="empty" />;
  return <Gallery labels={view.labels} cases={view.cases} pages={view.pages} />;
}

/** Before & after: the photo header and the gallery of cases, then the testimonials and Start your journey (redesign, 2026-11-18). */
export default function BeforeAfterPage() {
  return (
    <main id="main" data-shell="inner" data-page="before-after">
      <Breadcrumb items={["Before & after"]} dark />
      <Suspense fallback={<GalleryNotice state="loading" />}>
        <GallerySection />
      </Suspense>
      <Saying />
      <ProcAnalysis />
    </main>
  );
}
