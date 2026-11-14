import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated testimonials row on the Next.js build. */

const SECTION = 'section[aria-labelledby="testimonials"]';
const offset = (page: Page) => page.locator(`${SECTION} .promo-rev-row > ul`).evaluate((el: HTMLElement) => -new DOMMatrix(getComputedStyle(el).transform).m41);

test.use({ viewport: { width: 1440, height: 900 } });

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
  await expect(page.locator("#testimonials")).toHaveClass(/\bin\b/);
}

test("seven reviews and three award cards, three times over; the rating shows four and a half stars", async ({ page }) => {
  await goToSection(page);
  await expect(page.locator(`${SECTION} .promo-rev-row li.shrink-0`)).toHaveCount(30);
  await expect(page.locator(`${SECTION} blockquote`)).toHaveCount(21);
  await expect(page.getByRole("img", { name: "Rated 4.5 out of 5 on Google" })).toBeVisible();
  await expect(page.locator(SECTION)).toContainText("individual results may vary");
  await expect(page.locator(SECTION).getByRole("list", { name: "Top Choice Award, 2019 to 2026" }).first().locator("img")).toHaveCount(8);
});

test("the row drifts on its own, follows a drag, and carries on", async ({ page }) => {
  await goToSection(page);
  const a = await offset(page);
  await page.waitForTimeout(1200);
  const b = await offset(page);
  expect(b).toBeGreaterThan(a);
  const box = (await page.locator(`${SECTION} .promo-rev-row`).boundingBox())!;
  await page.mouse.move(box.x + 700, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, box.y + 100, { steps: 8 });
  await expect(page.locator(`${SECTION} .promo-rev-row`)).toHaveClass(/is-dragging/);
  const dragged = await offset(page);
  expect(dragged - b).toBeGreaterThan(250);
  await page.mouse.up();
  await expect(page.locator(`${SECTION} .promo-rev-row`)).not.toHaveClass(/is-dragging/);
  await page.waitForTimeout(1500);
  expect(await offset(page)).toBeGreaterThan(dragged);
});
