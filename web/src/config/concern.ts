import { WRINKLES } from "@/config/wrinkles";
import type { ConcernPage } from "@/types/concern";

/**
 * What every concern page shares, word for word from the original concern page. A concern's own content
 * comes from WordPress (the post type "Concerns"); nothing here is typed there.
 */
export const CONCERN_SHARED = {
  /** First step of the breadcrumb. */
  crumb: WRINKLES.crumbs[0],
  /** The clinics, in one line under the header's intro. */
  where: WRINKLES.where,
  /** The section bar. */
  nav: WRINKLES.nav,
  /** The two facts of the glance card that never change; the number of options and the starting price are worked out. */
  facts: { consultation: WRINKLES.facts[1], analysis: WRINKLES.facts[2] },
  /** Heading of What to expect; the steps are the concern's. */
  expect: { tag: WRINKLES.expect.tag, lead: WRINKLES.expect.lead, strong: WRINKLES.expect.strong, text: WRINKLES.expect.text },
  /** Heading of Before and after; the photos are the concern's. */
  results: { lead: WRINKLES.results.lead, strong: WRINKLES.results.strong, text: WRINKLES.results.text },
  why: WRINKLES.why,
} satisfies Record<string, unknown>;

/** Concerns with a built-in copy, shown when WordPress cannot be reached. */
export const BUILT_IN_CONCERNS: Record<string, { page: ConcernPage; title: string; description: string }> = {
  "wrinkles-fine-lines": {
    page: WRINKLES,
    title: "Wrinkles & Fine Lines Treatment Toronto | NewDermaMed",
    description:
      "Treatments for wrinkles and fine lines in Toronto: 11 options compared, with a free consultation and VISIA® skin analysis at our Uptown (Yonge & Sheppard) and Downtown (Bay & College) clinics.",
  },
};
