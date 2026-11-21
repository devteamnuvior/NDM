import type { Page } from "@playwright/test";
import { pageParity } from "./page";

/* Before & after page: the gallery as it opens, filtered by a treatment, and with a case at full size. */
const GALLERY = 'section[aria-labelledby="gallery-title"]';
/* every photo in the section has arrived (the lower ones load lazily) */
const photos = async (p: Page) => {
  await p.locator(GALLERY).evaluate(async (el) => {
    for (const img of Array.from(el.querySelectorAll("img"))) {
      img.loading = "eager";
      if (!img.complete) await new Promise((r) => { img.onload = r; img.onerror = r; });
    }
  });
};

pageParity({
  name: "before-after",
  paths: {
    legacy: "/before-after.html",
    next: "/before-after",
    /* Deliberate difference (asked by the user, 2026-11-12): the prototype's two filters "Laser Acne" (1 case)
       and "Laser acne" (3 cases) are one category, "Laser acne", in WordPress. The prototype's data is given the
       same merge here, so everything else is still compared. */
    legacyHtml: (html) => html.replaceAll('"Laser Acne"', '"Laser acne"').replace('"Laser acne", "Botox", "Laser acne"]', '"Laser acne", "Botox"]'),
  },
  sectionCount: 2,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "gallery", selector: GALLERY, pixelRatio: 0.01, prepare: photos },
    {
      name: "gallery-filtered",
      selector: GALLERY,
      pixelRatio: 0.01,
      prepare: async (p) => {
        await p.locator(GALLERY).getByRole("button", { name: "Dermamelan", exact: true }).click();
        await photos(p);
      },
    },
    {
      name: "gallery-open",
      selector: GALLERY,
      pixelRatio: 0.01,
      prepare: async (p) => {
        /* Deliberate fix (asked by the user): the full-size view now rises above the site header, so its Close
           button can be clicked. The prototype is given the same lift here, so everything else is still compared. */
        await p.addStyleTag({ content: `${GALLERY}{z-index:95!important}` });
        await p.locator(GALLERY).locator("ul button").first().click();
        await photos(p);
      },
    },
    /* closes the full-size view first, so it does not cover the sections below */
    { name: "testimonials", selector: 'section[aria-labelledby="testimonials"]', pixelRatio: 0.004, prepare: (p) => p.keyboard.press("Escape") },
    /* Deliberate difference: the prototype's page never turns its header dark over the dark footer (its
       build script left out the scroll handler every other page has). The shared header does, as on the
       rest of the site, so the header bar is left out of this picture. */
    { name: "footer", selector: "footer", pixelRatio: 0.004, prepare: (p) => p.addStyleTag({ content: "header{visibility:hidden!important}" }) },
  ],
});
