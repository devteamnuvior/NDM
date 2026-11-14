import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated monthly specials wheel on the Next.js build. */

const SECTION = 'section[aria-labelledby="specials"]';
const stage = (page: Page) => page.locator(`${SECTION} [aria-roledescription="carousel"]`);
const current = (page: Page) => page.locator(`${SECTION} article.is-on`);

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
  await expect(page.locator("#specials")).toHaveClass(/\bin\b/);
  await page.waitForTimeout(2600); /* the cards sweep onto the arc */
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("ten offers; price, unit and offer come from the price list", async ({ page }) => {
    await goToSection(page);
    await expect(page.locator(`${SECTION} article`)).toHaveCount(10);
    await expect(stage(page)).toHaveAttribute("aria-label", "Monthly specials, offer 1 of 10");
    await expect(current(page).locator("h3")).toHaveText("Lip Filler");
    await expect(current(page).locator(".sw-price")).toHaveText("$562.50");
    await expect(current(page).locator(".deal-badge")).toHaveText("%Buy 1 get 1 50% off");
    await expect(current(page)).toContainText("per syringe");
    await expect(current(page).getByRole("link", { name: "Buy now" })).toHaveAttribute("href", "/pricing#pg-dermal-fillers-h");
    await expect(page.locator(SECTION).getByRole("link", { name: "View all offers" })).toHaveAttribute("href", "/promotion#offers");
  });

  test("arrows, arrow keys and a click on a side card turn the wheel; it wraps round", async ({ page }) => {
    await goToSection(page);
    await page.locator(SECTION).getByRole("button", { name: "Next offer" }).click();
    await expect(current(page).locator("h3")).toHaveText("Microneedling");
    await stage(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(current(page).locator("h3")).toHaveText("Chemical Peel");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(current(page).locator("h3")).toHaveText("Above the Knee Tightening");
    await expect(stage(page)).toHaveAttribute("aria-label", "Monthly specials, offer 10 of 10");
    /* the side card to the right: click its outer edge, clear of the centre card */
    await page.locator(`${SECTION} article`).filter({ hasText: "Lip Filler" }).click({ position: { x: 270, y: 40 } });
    await expect(current(page).locator("h3")).toHaveText("Lip Filler");
    /* only the centre card's button can be reached or followed */
    await expect(page.locator(`${SECTION} article:not(.is-on) a.btn`).first()).toHaveAttribute("tabindex", "-1");
  });

  test("a sideways drag turns the wheel", async ({ page }) => {
    await goToSection(page);
    const b = (await stage(page).boundingBox())!;
    await page.mouse.move(b.x + b.width / 2 + 100, b.y + 120);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 - 60, b.y + 120, { steps: 5 });
    await page.mouse.up();
    await expect(current(page).locator("h3")).toHaveText("Microneedling");
  });

  test("the payment plans card links to the provider", async ({ page }) => {
    await goToSection(page);
    const start = page.locator(SECTION).getByRole("link", { name: /Start my plan/ }).first();
    await expect(start).toHaveAttribute("href", /^https:\/\/www\.affirm\.ca\/apps\/prequal\//);
    await expect(start).toHaveAttribute("target", "_blank");
    await expect(page.locator(SECTION).getByRole("list", { name: "Payment plan providers" }).getByRole("listitem")).toHaveCount(3);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the wheel fits the screen with no sideways scroll and no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await goToSection(page);
    await expect(current(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    expect(errors).toEqual([]);
  });
});
