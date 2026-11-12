import { pageParity } from "./page";

/* Aptos Thread Lift page: every block in page order, then the price group folded. */
const sec = (id: string) => `main > section#${id}`;
const by = (id: string) => `main > section[aria-labelledby="${id}"]`;

pageParity({
  name: "aptos",
  paths: { legacy: "/aptos-thread-lift.html", next: "/aptos-thread-lift" },
  sectionCount: 18,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "hero", selector: by("proc-title"), pixelRatio: 0.004 },
    { name: "glance", selector: ".tx-glance" },
    { name: "phone-form", selector: 'main > section[aria-label="Book a free consultation"]', widths: (w) => w < 1024 },
    { name: "section-bar", selector: "nav.tx-nav" },
    { name: "what", selector: sec("what"), pixelRatio: 0.004 },
    { name: "how", selector: sec("how") },
    { name: "safety", selector: sec("safety"), pixelRatio: 0.004 },
    { name: "duration", selector: by("duration-title") },
    { name: "candidate", selector: sec("candidate"), pixelRatio: 0.004 },
    { name: "expect", selector: sec("expect") },
    { name: "results", selector: sec("results"), pixelRatio: 0.004 },
    { name: "care", selector: sec("care") },
    { name: "combinations", selector: sec("combinations"), pixelRatio: 0.004 },
    { name: "prices", selector: sec("prices") },
    {
      name: "prices-folded",
      selector: sec("prices"),
      prepare: async (p) => {
        await p.locator("#tx-pr-h").click();
        await p.waitForTimeout(700);
      },
    },
    { name: "why", selector: sec("why"), pixelRatio: 0.01 },
    { name: "team", selector: by("team"), pixelRatio: 0.004 },
    { name: "testimonials", selector: by("testimonials"), pixelRatio: 0.004 },
    { name: "visit", selector: sec("visit"), pixelRatio: 0.01 },
    { name: "analysis", selector: by("analysis-title"), pixelRatio: 0.01 },
    { name: "faq", selector: by("faq") },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
