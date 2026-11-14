import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";
import { money, optionsOf } from "./price-list";

/** The lip filler card as the price list has it now: its lowest price per syringe, and that option's offer. */
async function lipCard(): Promise<{ price: string; badge: string }> {
  const perSyringe = (await optionsOf("Lip Enhancement")).map((o) => ({ each: o.price / (Number.parseInt(o.label, 10) || 1), tag: o.tag }));
  const low = perSyringe.reduce((a, b) => (b.each < a.each ? b : a));
  return { price: money(low.each), badge: low.tag ? `%${low.tag.charAt(0)}${low.tag.slice(1).toLowerCase()}` : "" };
}


/** Behaviour of the migrated Promotion page on the Next.js build. */

const OFFERS = 'section[aria-labelledby="offers"]';

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; the header marks Promotion; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/promotion.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/promotion`);
  await expect(page).toHaveTitle("Promotions, NewDermaMed Toronto");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Exclusive monthly specials");
  await expect(page.locator("header nav").getByRole("link", { name: "Promotion" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Promotions");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("View all offers scrolls to the list on this page", async ({ page }) => {
  await page.goto(`${NEXT_URL}/promotion`);
  const link = page.locator('section[aria-labelledby="specials"]').getByRole("link", { name: "View all offers" });
  await expect(link).toHaveAttribute("href", "#offers");
  await link.click();
  await expect(page.locator("#offers")).toBeInViewport();
  await expect(page).toHaveURL(/\/promotion(#offers)?$/);
});

test("twelve offer cards with prices from the price list; Face and Body filter them", async ({ page }) => {
  await page.goto(`${NEXT_URL}/promotion`);
  const grid = page.locator(OFFERS);
  const cards = grid.locator("article.promo-card");
  await expect(cards).toHaveCount(12);
  await expect(cards.first().locator("h3")).toHaveText("Botox");
  const first = cards.filter({ has: page.locator("h3", { hasText: /^Lip Filler$/ }) });
  await expect(first).toHaveCount(1);
  const lip = await lipCard();
  await expect(first).toContainText(lip.price);
  await expect(first).toContainText("per syringe");
  if (lip.badge) await expect(first.locator(".deal-badge")).toHaveText(lip.badge);
  else await expect(first.locator(".deal-badge")).toHaveCount(0);
  await expect(first.getByRole("link", { name: "Buy now" })).toHaveAttribute("href", "/pricing#pg-dermal-fillers-h");

  const all = grid.getByRole("button", { name: "All" });
  const body = grid.getByRole("button", { name: "Body" });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await body.click();
  await expect(body).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(cards).toHaveCount(2);
  await expect(cards.first().locator("h3")).toHaveText("Laser Hair Removal");
  await grid.getByRole("button", { name: "Face" }).click();
  await expect(cards).toHaveCount(9);
  /* PRP Hair Restoration is neither Face nor Body: it shows under All only, as in the prototype */
  await all.click();
  await expect(cards).toHaveCount(12);
});

test("Buy now opens that category on the pricing page", async ({ page }) => {
  await page.goto(`${NEXT_URL}/promotion`);
  await page.locator(OFFERS).locator("article.promo-card").nth(4).getByRole("link", { name: "Buy now" }).click();
  await expect(page).toHaveURL(`${NEXT_URL}/pricing#pg-microneedling-h`);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("one column of cards, no sideways scroll", async ({ page }) => {
    await page.goto(`${NEXT_URL}/promotion`);
    const cards = page.locator(`${OFFERS} article.promo-card`);
    const [a, b] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
    expect(a!.x).toBe(b!.x);
    expect(b!.y).toBeGreaterThan(a!.y + a!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
