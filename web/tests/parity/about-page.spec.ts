import type { Page } from "@playwright/test";
import { pageParity } from "./page";

/* About page: every section in page order; a team profile opened; the gallery viewer opened; the form sent. */
const sec = (id: string) => `main > section#${id}`;
/* The map tiles come from a map server as they are needed, in no fixed order: they are left out of the
   comparison (pins, legend, controls and the cards around the maps are compared). */
const noTiles = async (p: Page) => {
  await p.waitForFunction(() => document.querySelectorAll(".clinic-map .leaflet-marker-icon").length === 8, undefined, { timeout: 20_000 });
  await p.addStyleTag({ content: ".leaflet-tile-pane{visibility:hidden!important}.map-card,.map-dot{transition:none!important;animation:none!important}" });
  await p.waitForTimeout(600);
};

pageParity({
  name: "about",
  paths: { legacy: "/about.html", next: "/about" },
  sectionCount: 8,
  sections: [
    { name: "breadcrumb", selector: "nav.crumbs" },
    { name: "film", selector: sec("top"), pixelRatio: 0.01 },
    { name: "team", selector: sec("team"), pixelRatio: 0.01 },
    { name: "clinics", selector: sec("clinics"), pixelRatio: 0.01, prepare: noTiles },
    { name: "gallery", selector: sec("gallery"), pixelRatio: 0.01 },
    { name: "process", selector: 'main > section[aria-labelledby="process"]', pixelRatio: 0.01 },
    { name: "faq", selector: 'main > section[aria-labelledby="faq"]' },
    { name: "contact", selector: sec("contact") },
    {
      name: "contact-sent",
      selector: sec("contact"),
      prepare: async (p) => {
        const form = p.locator("#contact form");
        await form.getByLabel("Your name").fill("Test Person");
        await form.getByLabel("Your email").fill("test@example.com");
        await form.getByLabel("Which clinic?").selectOption("Uptown Clinic");
        await form.getByLabel("How can we help?").fill("A question about parking.");
        await form.getByRole("button", { name: "Send message" }).click();
      },
    },
    { name: "social", selector: 'main > section[aria-labelledby="social"]', pixelRatio: 0.004 },
    { name: "footer", selector: "footer", pixelRatio: 0.004 },
  ],
});
