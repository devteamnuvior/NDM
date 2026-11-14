import { pageParity } from "./page";

/* Black Friday sale page: its own header, every section, a concern picked, a deal added to the plan, the footer. */
const deals = "main > section#deals";

pageParity({
  name: "bf-sale",
  paths: { legacy: "/black-friday-sale.html", next: "/black-friday-sale" },
  sectionCount: 8,
  sections: [
    { name: "header", selector: "body header" },
    { name: "hero", selector: 'main > section[aria-labelledby="bfs-title"]', pixelRatio: 0.01 },
    { name: "stats", selector: 'main > section[aria-label="Black Friday at a glance"]' },
    { name: "how", selector: "main > section#how" },
    { name: "concerns", selector: "main > section#concerns" },
    { name: "deals", selector: deals },
    {
      name: "deals-tab-skin",
      selector: deals,
      prepare: async (p) => {
        await p.locator(deals).getByRole("tab", { name: "Skin" }).click();
        await p.waitForTimeout(300);
      },
    },
    {
      name: "deals-in-plan",
      selector: deals,
      prepare: async (p) => {
        const card = p.locator(`${deals} article`).first();
        await card.getByRole("group").getByRole("button").nth(1).click();
        await card.getByRole("button", { name: "Add to my plan" }).click();
        await p.waitForTimeout(300);
      },
    },
    { name: "specials", selector: "main > section#specials", pixelRatio: 0.01 },
    /* the plan holds the deal added above */
    { name: "plan", selector: "main > section#plan" },
    {
      name: "plan-empty",
      selector: "main > section#plan",
      prepare: async (p) => {
        await p.locator("#plan").getByRole("button", { name: "Clear my plan" }).click();
        await p.waitForTimeout(300);
      },
    },
    { name: "clinics", selector: "main > section#clinics", pixelRatio: 0.01 },
    { name: "footer", selector: "body footer", pixelRatio: 0.004 },
  ],
});
