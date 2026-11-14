import type { Page } from "@playwright/test";
import { pageParity } from "./page";

/* Promotion page: every section in page order, the wheel turned, and the offers grid filtered. */
const SPECIALS = 'section[aria-labelledby="specials"]';
const OFFERS = 'section[aria-labelledby="offers"]';

/* the payment providers' logos come from their own CDNs: wait until they have arrived */
const logos = (p: Page) =>
  p
    .waitForFunction((sel) => Array.from(document.querySelectorAll<HTMLImageElement>(`${sel} [aria-label="Payment plan providers"] img`)).every((i) => i.complete), SPECIALS, { timeout: 20_000 })
    .catch(() => {});

pageParity({
  name: "promotion",
  paths: { legacy: "/promotion.html", next: "/promotion" },
  sectionCount: 9,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "wheel", selector: SPECIALS, pixelRatio: 0.004, prepare: logos },
    {
      name: "wheel-turned",
      selector: SPECIALS,
      pixelRatio: 0.004,
      prepare: async (p) => {
        const next = p.locator(SPECIALS).getByRole("button", { name: "Next offer" });
        await next.click();
        await next.click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(900);
      },
    },
    { name: "offers", selector: OFFERS, pixelRatio: 0.01 },
    {
      name: "offers-body",
      selector: OFFERS,
      pixelRatio: 0.01,
      prepare: async (p) => {
        await p.locator(OFFERS).getByRole("button", { name: "Body" }).click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(400);
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
