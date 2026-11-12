import { pageParity } from "./page";

/* Botox page: every block in page order; the About tabs switched; the second price group opened. */
const sec = (id: string) => `main > section#${id}`;
const by = (id: string) => `main > section[aria-labelledby="${id}"]`;

pageParity({
  name: "botox",
  paths: { legacy: "/botox.html", next: "/botox" },
  sectionCount: 16,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "hero", selector: by("proc-title"), pixelRatio: 0.004 },
    { name: "glance", selector: ".tx-glance" },
    { name: "phone-form", selector: 'main > section[aria-label="Book a free consultation"]', widths: (w) => w < 1024 },
    { name: "section-bar", selector: "nav.tx-nav" },
    { name: "benefits", selector: sec("benefits"), pixelRatio: 0.01 },
    { name: "film", selector: sec("film"), pixelRatio: 0.01 },
    { name: "overview", selector: sec("overview") },
    {
      name: "overview-tab-4",
      selector: sec("overview"),
      prepare: async (p) => {
        await p.locator("#ov-t-3").click();
        await p.waitForTimeout(300);
      },
    },
    { name: "why-choose", selector: sec("why-choose"), pixelRatio: 0.01 },
    { name: "watch", selector: sec("watch"), pixelRatio: 0.01 },
    { name: "results", selector: sec("results"), pixelRatio: 0.01 },
    { name: "prices", selector: sec("prices") },
    {
      name: "prices-second-open",
      selector: sec("prices"),
      prepare: async (p) => {
        await p.locator("#proc-pr-h0").click();
        await p.locator("#proc-pr-h1").click();
        await p.waitForTimeout(700);
      },
    },
    { name: "guide", selector: sec("guide"), pixelRatio: 0.01 },
    { name: "why", selector: sec("why"), pixelRatio: 0.01 },
    { name: "team", selector: by("team"), pixelRatio: 0.004 },
    { name: "testimonials", selector: by("testimonials"), pixelRatio: 0.004 },
    { name: "visit", selector: sec("visit"), pixelRatio: 0.01 },
    { name: "analysis", selector: by("analysis-title"), pixelRatio: 0.01 },
    { name: "faq", selector: by("faq") },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
