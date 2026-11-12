import { pageParity } from "./page";

/* Wrinkles & fine lines (concern page): every block in page order; on phones one option opened in the side-by-side list. */
const sec = (id: string) => `main > section#${id}`;
const by = (id: string) => `main > section[aria-labelledby="${id}"]`;

pageParity({
  name: "wrinkles",
  paths: { legacy: "/wrinkles-fine-lines.html", next: "/wrinkles-fine-lines" },
  sectionCount: 18,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "hero", selector: by("proc-title"), pixelRatio: 0.004 },
    { name: "glance", selector: ".tx-glance" },
    { name: "phone-form", selector: 'main > section[aria-label="Book a free consultation"]', widths: (w) => w < 1024 },
    { name: "section-bar", selector: "nav.tx-nav" },
    { name: "overview", selector: sec("about") },
    { name: "understand", selector: sec("understand") },
    { name: "assess", selector: sec("assess"), pixelRatio: 0.004 },
    { name: "options", selector: sec("options"), pixelRatio: 0.01 },
    { name: "compare", selector: sec("compare"), pixelRatio: 0.01 },
    {
      name: "compare-open",
      selector: sec("compare"),
      widths: (w) => w < 768,
      pixelRatio: 0.01,
      prepare: async (p) => {
        await p.locator("#compare details summary").nth(1).click();
        await p.waitForTimeout(300);
      },
    },
    { name: "expect", selector: sec("expect") },
    { name: "results", selector: sec("results"), pixelRatio: 0.01 },
    { name: "home-care", selector: sec("home-care"), pixelRatio: 0.004 },
    { name: "why", selector: sec("why"), pixelRatio: 0.01 },
    { name: "team", selector: by("team"), pixelRatio: 0.004 },
    { name: "testimonials", selector: by("testimonials"), pixelRatio: 0.004 },
    { name: "articles", selector: sec("read"), pixelRatio: 0.01 },
    { name: "related", selector: sec("related"), pixelRatio: 0.01 },
    { name: "visit", selector: sec("visit"), pixelRatio: 0.01 },
    { name: "analysis", selector: by("analysis-title"), pixelRatio: 0.01 },
    { name: "faq", selector: by("faq") },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
