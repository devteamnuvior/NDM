import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Before & after section and its compare slider on the Next.js build. */

const SECTION = 'section[aria-labelledby="results"]';
const firstCard = (page: Page) => page.locator(`${SECTION} .ba-box`).first();
const clipOf = (page: Page) => firstCard(page).locator(".ba-before").evaluate((el: HTMLElement) => parseFloat(el.style.clipPath.split(" ")[1]));

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
  await expect(page.locator("#results")).toHaveClass(/\bin\b/);
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("seven cases, the disclaimer, and the link to the full gallery", async ({ page }) => {
    await goToSection(page);
    await expect(page.locator(`${SECTION} .ba-box`)).toHaveCount(7);
    await expect(page.locator(SECTION)).toContainText("Individual results may vary.");
    await expect(page.locator(SECTION).getByRole("link", { name: "See all before & after" })).toHaveAttribute("href", "/before-after");
    await expect(page.locator(`${SECTION} figcaption`).first()).toHaveText("Model 01Aptos thread lift");
  });

  test("the first cards play the drag hint once, then rest at the middle", async ({ page }) => {
    await goToSection(page);
    await expect.poll(() => clipOf(page), { timeout: 4000 }).toBeGreaterThan(55); /* the divider swings left: more of the after photo */
    await expect.poll(() => clipOf(page), { timeout: 6000 }).toBe(50);
  });

  test("the mouse drags the divider; a click jumps to the point", async ({ page }) => {
    await goToSection(page);
    await page.waitForTimeout(3200); /* let the hint finish */
    const b = (await firstCard(page).boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await expect(firstCard(page)).toHaveClass(/is-drag/);
    await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 6 });
    await expect.poll(() => clipOf(page)).toBeCloseTo(80, 0);
    await page.mouse.up();
    await expect(firstCard(page)).not.toHaveClass(/is-drag/);
    await page.mouse.click(b.x + b.width * 0.9, b.y + b.height / 2);
    await expect.poll(() => clipOf(page)).toBeCloseTo(10, 0);
    /* near the right edge the Before tag stays, the After tag fades out */
    await expect.poll(() => firstCard(page).locator(".ba-pill").last().evaluate((el: HTMLElement) => el.style.opacity)).toBe("0");
  });

  test("the keyboard moves the divider and screen readers hear the share", async ({ page }) => {
    await goToSection(page);
    await page.waitForTimeout(3200);
    const slider = firstCard(page).getByRole("slider");
    await slider.focus();
    await expect(slider).toHaveAttribute("aria-label", "Compare before and after, model 1, Aptos thread lift");
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuetext", "52% before, 48% after");
    await page.keyboard.press("Shift+ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuetext", "42% before, 58% after");
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuetext", "100% before, 0% after");
  });

  test("arrows move the row by one card", async ({ page }) => {
    await goToSection(page);
    const rail = page.locator(`${SECTION} ul`).first();
    const width = await page.locator(`${SECTION} li.ba-slide`).first().evaluate((el: HTMLElement) => el.offsetWidth);
    await expect(page.getByRole("button", { name: "Previous cases" })).toBeDisabled();
    await page.getByRole("button", { name: "Next cases" }).click();
    await expect.poll(() => rail.evaluate((r) => Math.round(r.scrollLeft))).toBe(width + 16);
    await expect(page.getByRole("button", { name: "Previous cases" })).toBeEnabled();
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("a tap jumps the divider; the page still has no sideways scroll", async ({ page }) => {
    await goToSection(page);
    await page.waitForTimeout(3200);
    const b = (await firstCard(page).boundingBox())!;
    await page.touchscreen.tap(b.x + b.width * 0.25, b.y + b.height / 2);
    await expect.poll(() => clipOf(page)).toBeCloseTo(75, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
