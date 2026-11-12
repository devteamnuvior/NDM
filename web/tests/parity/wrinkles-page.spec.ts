import { pageParity } from "./page";

/* Wrinkles & fine lines (concern page): every block in page order, except Side by side (see `differs`). */
const sec = (id: string) => `main > section#${id}`;
const by = (id: string) => `main > section[aria-labelledby="${id}"]`;

pageParity({
  name: "wrinkles",
  paths: { legacy: "/wrinkles-fine-lines.html", next: "/wrinkles-fine-lines" },
  sectionCount: 18,
  /* Side by side is not compared: the prototype's table carries hand-typed prices ("From $245"), while every
     price here is read from WooCommerce and written by one rule ("From $245 per session"). Its behaviour is
     covered by tests/wrinkles-page.spec.ts. */
  differs: ["compare"],
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "hero", selector: by("proc-title"), pixelRatio: 0.004 },
    { name: "glance", selector: ".tx-glance" },
    { name: "phone-form", selector: 'main > section[aria-label="Book a free consultation"]', widths: (w) => w < 1024 },
    { name: "section-bar", selector: "nav.tx-nav" },
    { name: "overview", selector: sec("about") },
    { name: "understand", selector: sec("understand") },
    { name: "assess", selector: sec("assess"), pixelRatio: 0.004 },
    {
      name: "options",
      selector: sec("options"),
      pixelRatio: 0.01,
      /* one card's price is worded differently on purpose: the prototype typed "From $413 per session" for
         Exosome Skin Therapy, here it is WooCommerce's price in the cards' short form ("From $413") */
      prepare: (p) =>
        p.evaluate(() => {
          const card = Array.from(document.querySelectorAll("#options article")).find((a) => a.querySelector("h3")?.textContent === "Exosome Skin Therapy");
          const price = card?.querySelector("div > div > span");
          if (price) price.textContent = "\u00a0";
        }),
    },
    { name: "expect", selector: sec("expect") },
    {
      name: "results",
      selector: sec("results"),
      pixelRatio: 0.01,
      /* the photos are the gallery's cases now, named by their category ("Botox"); the prototype typed "Botox®" */
      prepare: (p) =>
        p.evaluate(() => {
          for (const el of document.querySelectorAll("#results figcaption span:first-child")) el.textContent = (el.textContent ?? "").replace("®", "");
        }),
    },
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
