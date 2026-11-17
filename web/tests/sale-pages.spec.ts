import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/**
 * The two landing pages of the 2026 holiday sale on the Next.js build: /vip-sale (the campaign's first
 * phase) and /black-friday (Black Friday, Cyber Monday, Black Friday Extended). They need WordPress
 * running with the campaign stored (`wp ndm-pricing campaign --apply < cms/campaigns/holiday-sale-2026.json`)
 * and, for these tests, the campaign in its window: its prices are on the price list only while it runs.
 * The pages' clocks are set in the browser; the prices are whatever WooCommerce answers now.
 */

test.use({ viewport: { width: 1440, height: 900 } });

const at = (page: Page, when: string) => page.clock.setFixedTime(new Date(when));
const card = (page: Page, name: string | RegExp) => page.locator("#deals article").filter({ has: page.getByRole("heading", { name, exact: true }) });
/* the per-unit card goes by the treatments it has in the sale: "Botox Cosmetic", or "Botox Cosmetic & Hyperhidrosis" */
const BOTOX_CARD = /^Botox Cosmetic( & .+)?$/;

test("VIP Sale: its own look and words, the gift line, the timer, no Black Friday wording", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await at(page, "2026-11-15T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/vip-sale.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/vip-sale`);
  await expect(page).toHaveTitle("VIP Sale: Up to 70% Off Treatments | NewDermaMed Toronto");
  await expect(page.locator("html")).toHaveClass(/\bvip\b/);
  await expect(page.locator("h1")).toHaveText("VIPSale.");
  const hero = page.locator("main > section").first();
  await expect(hero).toContainText("Up to70%off");
  await expect(hero).toContainText("plus a $200 gift with your purchase");
  await expect(hero).toContainText("Selected treatment packages, for our clients first. Use code PLUS30 at checkout for your full sale price.");
  const timer = page.getByRole("timer");
  await expect(timer).toContainText("VIP Sale ends in");
  await expect(timer).toContainText("Thu, Nov 19");
  await expect(page.locator("main")).toContainText("+$200 gift with your purchase · first 20 purchases · given in clinic");
  await expect(page.getByRole("region", { name: "VIP Sale at a glance" })).toContainText("Nov 19Last day");
  await expect(page.locator("#how")).toContainText("with code PLUS30 for your full sale price");
  await expect(page.locator("footer")).toContainText("Selected packages only; single sessions at regular price. Code PLUS30 applies to eligible packages.");
  await expect(page.locator("footer")).toContainText("Individual results may vary.");
  const words = await page.locator("body").innerText();
  expect(words).not.toMatch(/black friday|cyber monday/i);
  expect(words).not.toContain("—");
  await expect(page.getByRole("region", { name: "Clinic announcements" })).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(250, 250, 248)");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("deal cards: only lines in the sale, the price with the code, the website price under it; fixed prices without the code", async ({ page }) => {
  await at(page, "2026-11-15T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/vip-sale`);
  const names = await page.locator("#deals article h3").allInnerTexts();
  expect(names.length).toBeGreaterThan(10);
  for (const n of names) expect(n).not.toMatch(/dysport|latisse|facial|vein|depigment|butt lift|snoring|toenail/i);
  await expect(page.locator("#deals article").first()).toContainText("SALE PRICE");

  /* an eligible package: with the code large, the regular price struck through, the website price underneath */
  const hair = card(page, "Laser Hair Removal");
  await hair.locator("select").selectOption({ label: "Brazilian" });
  await expect(hair.getByRole("group").getByRole("button")).toHaveCount(3); /* packages of 3, 5 and 8: no single session */
  await expect(hair).toContainText("$279.30");
  await expect(hair).toContainText("$570");
  await expect(hair).toContainText("Website price $399 · PLUS30 applied at checkout");

  /* the prescription product: name, units and price, no percentage and no code */
  const botox = card(page, BOTOX_CARD);
  await expect(botox.getByRole("group").getByRole("button")).toHaveText(["60 units$504", "120 units$1008", "180 units$1512"]);
  await expect(botox).not.toContainText("% off");
  await expect(botox).not.toContainText("PLUS30");

  /* the sale prices: a title, a quantity and a price */
  const prices = page.locator("#specials ul:not([aria-hidden]) article");
  await expect(prices.first()).toContainText("Botox®60 units$504");
  await expect(page.locator("#specials")).toContainText("Lip filler2 syringes$900");
});

test("the plan: website total, with the code, the saving; Go to checkout fills the cart and applies the code", async ({ page }) => {
  await at(page, "2026-11-15T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/vip-sale`);
  const hair = card(page, "Laser Hair Removal");
  await hair.locator("select").selectOption({ label: "Brazilian" });
  await hair.getByRole("button", { name: "Add to my plan" }).click();
  const botox = card(page, BOTOX_CARD);
  await botox.getByRole("button", { name: "Add to my plan" }).click();
  const plan = page.locator("#plan");
  await expect(plan).toContainText("Website total$903");
  await expect(plan).toContainText("With code PLUS30: $783.30");
  await expect(plan).toContainText("You save $290.70");
  await expect(plan).toContainText("Prices in CAD, before tax. Code PLUS30 applies to eligible packages. Consultation required before treatment.");
  await page.reload();
  await expect(page.locator("#plan")).toContainText("2 treatments in your plan");

  await page.locator("#plan").getByRole("button", { name: "Go to checkout" }).click();
  await expect(page).toHaveURL(`${NEXT_URL}/checkout`);
  /* after an in-site navigation the framework can keep the earlier page in the document, hidden */
  const main = page.locator("main:visible");
  await expect(main).toContainText("Code PLUS30 applied to the eligible packages in your cart.");
  await expect(main).toContainText("Code PLUS30-$119.70");
  const lines = await page.evaluate(() => JSON.parse(localStorage.getItem("ndm-cart") ?? "[]"));
  expect(lines).toHaveLength(2);

  /* another code is refused on the spot */
  await page.goto(`${NEXT_URL}/cart`);
  await page.getByRole("button", { name: "Remove", exact: true }).first().click();
  await page.getByLabel("Checkout code").fill("other10");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.locator("main:visible")).toContainText("This code is not valid.");
});

test("once the VIP Sale is over the page hands over to Black Friday", async ({ page }) => {
  await at(page, "2026-11-21T10:00:00-05:00");
  await page.goto(`${NEXT_URL}/vip-sale`);
  await expect(page).toHaveURL(`${NEXT_URL}/black-friday`);
});

test("Black Friday: the old addresses redirect; its phases change the labels; after the campaign it says so", async ({ page }) => {
  await at(page, "2026-11-25T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/black-friday-sale.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/black-friday`);
  await expect(page).toHaveTitle("Black Friday 2026: Up to 70% Off Treatments | NewDermaMed Toronto");
  await expect(page.locator("html")).toHaveClass(/\bbfs\b/);
  await expect(page.locator("h1")).toHaveText("BlackFriday.");
  const timer = page.getByRole("timer");
  await expect(timer).toContainText("Offers end in");
  await expect(timer).toContainText("Sun, Nov 29");
  await expect(page.locator("main")).toContainText("Up to 70% off selected treatment packages, plus a $200 gift with your purchase. Add code PLUS30 at checkout for your full sale price.");
  await expect(page.getByRole("region", { name: "Black Friday at a glance" })).toContainText("Nov 29Last day");
  await expect(page.locator("#deals article").first()).toContainText("BLACK FRIDAY PRICE");
  await expect(page.locator(".bfd-tab")).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(250, 248, 247)");

  await at(page, "2026-12-01T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/black-friday`);
  await expect(page.locator("main > section").first()).toContainText("Cyber Monday");
  await expect(page.getByRole("timer")).toContainText("Tue, Dec 1");
  await expect(page.locator("#deals article").first()).toContainText("CYBER MONDAY PRICE");
  await expect(page.locator(".bfs-tape").first()).toContainText("Cyber Monday"); /* the ticker opens with the phase running now */

  await at(page, "2026-12-05T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/black-friday`);
  await expect(page.getByRole("timer")).toContainText("Mon, Dec 7");
  await expect(page.locator("#deals article").first()).toContainText("EXTENDED PRICE");

  await at(page, "2026-11-16T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/black-friday`);
  await expect(page.getByRole("timer")).toContainText("Black Friday starts in");
  await expect(page.getByRole("timer")).toContainText("Fri, Nov 20");

  await at(page, "2026-12-08T00:01:00-05:00");
  await page.goto(`${NEXT_URL}/black-friday`);
  await expect(page.locator("main")).toContainText("Our Black Friday sale has ended. See our current offers on the promotions page.");
  await expect(page.getByRole("timer")).toHaveCount(0);
});

test("a concern shortlists the deals; the prescription product sits under none", async ({ page }) => {
  await at(page, "2026-11-25T12:00:00-05:00");
  await page.goto(`${NEXT_URL}/black-friday`);
  const all = await page.locator("#deals article").count();
  await expect(page.locator("#concerns")).not.toContainText("Veins and redness");
  const chip = page.locator("#concerns").getByRole("button", { name: /Intimate wellness/ });
  await chip.click();
  await expect(page.locator("#deals article")).toHaveCount(1);
  await chip.click();
  await expect(page.locator("#deals article")).toHaveCount(all);
  for (const name of await page.locator("#concerns button").allInnerTexts()) expect(name).not.toMatch(/botox/i);
});

for (const width of [1440, 375]) {
  test(`a long treatment name is cut short and does not widen a deal card (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await at(page, "2026-11-15T12:00:00-05:00");
    await page.goto(`${NEXT_URL}/vip-sale`);
    await expect(page.locator("#deals article").first()).toBeVisible();
    const wide = await page.evaluate(() => {
      const long = "Aptos Excellence Visage Method EV PLA/PCL (up to 24 months) with a few more words to be sure";
      const cards = [...document.querySelectorAll<HTMLElement>("#deals article")];
      const width = cards[0].getBoundingClientRect().width;
      /* the names WooCommerce can hold are longer than the local ones: write a long one into every card */
      for (const card of cards) {
        card.querySelectorAll(".truncate").forEach((el) => (el.textContent = long));
        card.querySelectorAll("[role=group] button span:first-child").forEach((el) => (el.textContent = "Face, mid and lower, a long option"));
      }
      return cards.filter((card) => {
        const box = card.getBoundingClientRect();
        const inside = [...card.querySelectorAll<HTMLElement>("select, [role=group], button, p")].every((el) => el.getBoundingClientRect().right <= box.right + 0.5);
        return Math.abs(box.width - width) > 0.5 || !inside;
      }).length;
    });
    expect(wide).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const width of [1440, 375]) {
  test(`the deal tabs stay under the header while the deals scroll past, and leave with them (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await at(page, "2026-11-15T12:00:00-05:00");
    await page.goto(`${NEXT_URL}/vip-sale`);
    const tabs = page.getByRole("tablist", { name: "Deal categories" });
    const header = page.locator("header").first();
    const top = async () => Math.round((await tabs.boundingBox())!.y);
    const headerBottom = async () => Math.round((await header.boundingBox())!.height);
    /* halfway down the deals: the tabs sit right under the header, and a tab still works there */
    await page.locator("#deals article").nth(8).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
    await expect.poll(top).toBeGreaterThanOrEqual(await headerBottom());
    await expect.poll(top).toBeLessThan((await headerBottom()) + 20);
    await tabs.getByRole("tab", { name: "Skin" }).click();
    await expect(tabs.getByRole("tab", { name: "Skin" })).toHaveAttribute("aria-selected", "true");
    /* past the deals they are gone with the section */
    await page.locator("#plan").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
    await expect.poll(top).toBeLessThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const path of ["/vip-sale", "/black-friday"]) {
    test(`${path}: the plan bar appears once something is in the plan; no sideways scroll`, async ({ page }) => {
      await at(page, path === "/vip-sale" ? "2026-11-15T12:00:00-05:00" : "2026-11-25T12:00:00-05:00");
      await page.goto(`${NEXT_URL}${path}`);
      const bar = page.locator(path === "/vip-sale" ? ".vip-bar" : ".bfs-bar");
      await expect(bar).toHaveCount(0);
      const first = page.locator("#deals article").first();
      await first.scrollIntoViewIfNeeded();
      await first.getByRole("button", { name: "Add to my plan" }).click();
      await expect(bar).toBeVisible();
      await expect(bar).toContainText("My plan · 1");
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    });
  }
});
