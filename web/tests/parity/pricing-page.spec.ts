import type { Page } from "@playwright/test";
import { pageParity } from "./page";

/* Pricing page: every section in page order, then the price list opened and searched. */
const list = (p: Page) => p.locator("#prices");

pageParity({
  name: "pricing",
  paths: { legacy: "/pricing.html", next: "/pricing" },
  sectionCount: 10,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "hero", selector: 'section[aria-labelledby="pricing-title"]', pixelRatio: 0.004 },
    { name: "specials", selector: "#specials" },
    { name: "price-list", selector: "#prices" },
    {
      name: "price-list-open",
      selector: "#prices",
      prepare: async (p) => {
        await list(p).locator("#pg-dermal-fillers-h").click();
        await p.waitForTimeout(700);
        await list(p).locator("#pr-dermal-fillers-0-h").click();
      },
    },
    {
      name: "price-list-search",
      selector: "#prices",
      prepare: async (p) => {
        await list(p).getByRole("searchbox").fill("laser hair");
      },
    },
    { name: "team", selector: 'section[aria-labelledby="team"]', pixelRatio: 0.004 },
    { name: "process", selector: 'section[aria-labelledby="process"]', pixelRatio: 0.01 },
    { name: "before-after", selector: 'section[aria-labelledby="results"]', pixelRatio: 0.004 },
    { name: "testimonials", selector: 'section[aria-labelledby="testimonials"]', pixelRatio: 0.004 },
    { name: "faq", selector: 'section[aria-labelledby="faq"]' },
    { name: "booking", selector: 'section[aria-labelledby="book"]', pixelRatio: 0.02 },
    { name: "social", selector: 'section[aria-labelledby="social"]', pixelRatio: 0.004 },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
