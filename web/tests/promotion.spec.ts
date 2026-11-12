import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

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

test("ten offer cards with prices from the price list; Face and Body filter them", async ({ page }) => {
  await page.goto(`${NEXT_URL}/promotion`);
  const grid = page.locator(OFFERS);
  const cards = grid.locator("article.promo-card");
  await expect(cards).toHaveCount(10);
  const first = cards.first();
  await expect(first.locator("h3")).toHaveText("Lip Filler");
  await expect(first).toContainText("$562.50");
  await expect(first).toContainText("per syringe");
  await expect(first.locator(".deal-badge")).toHaveText("%Buy 1 get 1 50% off");
  await expect(first.getByRole("link", { name: "Buy now" })).toHaveAttribute("href", "/pricing#pg-dermal-fillers-h");

  const all = grid.getByRole("button", { name: "All" });
  const body = grid.getByRole("button", { name: "Body" });
  await expect(all).toHaveAttribute("aria-pressed", "true");
  await body.click();
  await expect(body).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  await expect(cards).toHaveCount(3);
  await expect(cards.first().locator("h3")).toHaveText("Hand Rejuvenation with Radiesse®");
  await grid.getByRole("button", { name: "Face" }).click();
  await expect(cards).toHaveCount(7);
  await all.click();
  await expect(cards).toHaveCount(10);
});

test("Buy now opens that category on the pricing page", async ({ page }) => {
  await page.goto(`${NEXT_URL}/promotion`);
  await page.locator(OFFERS).locator("article.promo-card").nth(1).getByRole("link", { name: "Buy now" }).click();
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
