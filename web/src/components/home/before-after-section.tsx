import { Suspense } from "react";
import { BeforeAfter } from "@/components/home/before-after";
import { getHomeCopy } from "@/lib/home";

/* the home page's Before & After as WordPress has it: its cards, heading, text and button */
async function FromWordPress({ tight }: { tight?: boolean }) {
  const copy = await getHomeCopy();
  return <BeforeAfter copy={copy.results} tight={tight} />;
}

/**
 * The Before & After section of the inner pages (Pricing, Promotion) with the home page's own words and compare
 * cards from WordPress (user, 2026-11-25), so one edit in the home page's "Before And After" box changes every
 * page. While WordPress answers, and when it cannot, the built-in copy shows.
 */
export function BeforeAfterSection({ tight }: { tight?: boolean }) {
  return (
    <Suspense fallback={<BeforeAfter tight={tight} />}>
      <FromWordPress tight={tight} />
    </Suspense>
  );
}
