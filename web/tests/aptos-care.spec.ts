import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Aptos section on the Next.js build. */

const SECTION = 'section[aria-labelledby="aptos"]';

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
  await expect(page.locator("#aptos")).toHaveClass(/\bin\b/);
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the dials fill to their share and the chip counts up to 24", async ({ page }) => {
    await goToSection(page);
    const arcs = page.locator(`${SECTION} .sig-arc`);
    await expect(arcs).toHaveCount(3);
    await expect.poll(() => arcs.evaluateAll((els) => els.map((e) => getComputedStyle(e).strokeDasharray)), { timeout: 8000 }).toEqual(["calc(34px), 100px", "calc(50px), 100px", "calc(82px), 100px"]);
    await expect(page.locator(`${SECTION} .apx-chip b`)).toHaveText("Up to 24", { timeout: 6000 });
    await expect(page.locator(`${SECTION} .sig-dial`).first()).toContainText("About 60 minutes. Treatment time");
  });

  test("the thread lines redraw every few seconds while the figure is on screen", async ({ page }) => {
    await goToSection(page);
    const svg = page.locator(`${SECTION} figure svg`).first();
    await svg.evaluate((el) => el.setAttribute("data-seen", "1"));
    /* a redraw replaces the SVG element, so the mark disappears */
    await expect.poll(() => page.locator(`${SECTION} figure svg`).first().getAttribute("data-seen"), { timeout: 9000 }).toBeNull();
    await expect(page.locator(`${SECTION} figure .ind-run`)).toHaveCount(5);
  });

  test("a dial lifts with a soft shadow on hover, as in the original", async ({ page }) => {
    await goToSection(page);
    const dial = page.locator(`${SECTION} .sig-dial`).first();
    await dial.hover();
    await expect.poll(() => dial.evaluate((el) => getComputedStyle(el).boxShadow)).toContain("rgba(15, 60, 95, 0.5) 0px 26px 50px -34px");
  });

  test("buttons and photos", async ({ page }) => {
    await goToSection(page);
    const s = page.locator(SECTION);
    await expect(s.getByRole("link", { name: "Explore Aptos Thread Lift" })).toHaveAttribute("href", "/aptos-thread-lift");
    await expect(s.getByRole("link", { name: "Book Free Consultation" })).toHaveAttribute("href", "#/book");
    await expect(s.locator("figure figcaption")).toHaveText(["Marking · Front", "Marking · Midface", "Marking · Vectors", "Marking · Valium"]);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the marking photos scroll sideways in their own row; the page does not", async ({ page }) => {
    await goToSection(page);
    const row = page.locator(`${SECTION} ul`).last();
    expect(await row.evaluate((r) => r.scrollWidth > r.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
