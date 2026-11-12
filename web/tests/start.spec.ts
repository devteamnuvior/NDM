import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated "Where would you like to start?" section on the Next.js build. */

const panel = (page: Page, i: number) => page.locator("#start .st-p").nth(i);
const card = (page: Page) => page.locator("#start .st-o");

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(1000);
  await page.locator("#start").evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60));
  await expect(page.locator("#start .st")).toHaveClass(/\bin\b/);
  await page.waitForTimeout(600);
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("four panels; the first is open, the others are closed and out of reach", async ({ page }) => {
    await goToSection(page);
    await expect(page.locator("#start .st-p")).toHaveCount(4);
    await expect(panel(page, 0)).toHaveClass(/is-open/);
    await expect(panel(page, 0).locator("button.st-h")).toHaveAttribute("aria-expanded", "true");
    await expect(panel(page, 1).locator("button.st-h")).toHaveAttribute("aria-expanded", "false");
    expect(await panel(page, 1).locator(".st-c").evaluate((el: HTMLElement) => el.inert)).toBe(true);
    expect(await panel(page, 0).locator(".st-c").evaluate((el: HTMLElement) => el.inert)).toBe(false);
    await expect(panel(page, 0).locator(".st-chips a")).toHaveCount(6);
  });

  test("hovering opens a panel; the keyboard opens one too", async ({ page }) => {
    await goToSection(page);
    await panel(page, 2).hover();
    await expect(panel(page, 2)).toHaveClass(/is-open/);
    await expect(panel(page, 0)).not.toHaveClass(/is-open/);
    await expect(panel(page, 2).getByRole("heading", { name: "Body & hair" })).toBeVisible();
    await panel(page, 3).locator("button.st-h").focus();
    await page.keyboard.press("Enter");
    await expect(panel(page, 3)).toHaveClass(/is-open/);
    await expect(panel(page, 3).getByRole("link", { name: "Book Free Consultation" })).toBeVisible();
    await expect(panel(page, 3).getByRole("link", { name: "About the skin analysis" })).toHaveAttribute("href", "#/visia-skin-analysis");
  });

  test("a concern opens its options card; prices come from the price list", async ({ page }) => {
    await goToSection(page);
    await panel(page, 1).hover();
    await panel(page, 1).getByRole("link", { name: "Acne", exact: true }).click();
    await expect(card(page)).toBeVisible();
    await expect(card(page).getByRole("heading", { name: "Acne" })).toBeFocused();
    await expect(panel(page, 1)).toHaveClass(/is-sheet/);
    const rows = card(page).locator(".st-o-list li");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText("Laser Acne Treatment");
    await expect(rows.nth(0)).toContainText("From$262.50"); /* the lowest price after the offer, not the stored "From $375" */
    await expect(card(page).getByRole("link", { name: "Compare these options" })).toHaveAttribute("href", "#/acne");
    /* while a card is open, hovering another panel does not steal it */
    await panel(page, 2).hover();
    await expect(panel(page, 1)).toHaveClass(/is-open/);
  });

  test("Escape and the back button close the card and return focus to the concern", async ({ page }) => {
    await goToSection(page);
    const chip = panel(page, 0).getByRole("link", { name: "Volume loss" });
    await chip.click();
    await expect(card(page).getByRole("heading", { name: "Volume loss" })).toBeFocused();
    await expect(card(page).getByRole("link", { name: /Aptos Thread Lift/ })).toHaveAttribute("href", "/aptos-thread-lift");
    await page.keyboard.press("Escape");
    await expect(card(page)).toHaveCount(0);
    await expect(chip).toBeFocused();
    await chip.click();
    await card(page).getByRole("button", { name: "Back to face concerns" }).click();
    await expect(card(page)).toHaveCount(0);
    await expect(chip).toBeFocused();
  });

  test("the search field opens the site search", async ({ page }) => {
    await goToSection(page);
    await page.locator("#start").getByRole("button", { name: "Search treatments" }).click();
    await expect(page.getByRole("dialog", { name: "Search treatments" })).toBeVisible();
    await expect(page.locator("#site-search")).toBeFocused();
  });

  test("the hero's Find your treatment button lands on this section", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.locator("#top").getByRole("link", { name: "Find your treatment" }).click();
    await expect.poll(async () => Math.abs((await page.locator("#start").boundingBox())!.y)).toBeLessThan(4);
  });
});

test.describe("small laptop", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("a card taller than the row makes the row taller, and it returns when the card closes", async ({ page }) => {
    await goToSection(page);
    const row = page.locator("#start .st");
    const height = () => row.evaluate((el: HTMLElement) => Math.round(el.getBoundingClientRect().height));
    expect(await height()).toBe(520);
    await panel(page, 1).locator("button.st-h").click();
    await page.waitForTimeout(1100); /* let the panel finish widening: the card is measured at the panel's width */
    await panel(page, 1).getByRole("link", { name: "Acne", exact: true }).click();
    await expect.poll(height).toBe(574);
    /* the card keeps clear of the top of the photo */
    await expect.poll(async () => Math.round((await card(page).boundingBox())!.y - (await panel(page, 1).boundingBox())!.y)).toBe(56);
    await page.keyboard.press("Escape");
    await expect.poll(height).toBe(520);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("panels stack; tapping opens one; a card makes its panel taller; no sideways scroll, no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await goToSection(page);
    expect(await page.locator("#start .st").evaluate((el) => getComputedStyle(el).flexDirection)).toBe("column");
    await panel(page, 1).locator("button.st-h").tap();
    await expect(panel(page, 1)).toHaveClass(/is-open/);
    const before = (await panel(page, 1).boundingBox())!.height;
    await panel(page, 1).getByRole("link", { name: "Acne", exact: true }).tap();
    await expect(card(page)).toBeVisible();
    await expect.poll(async () => (await panel(page, 1).boundingBox())!.height).toBeGreaterThan(before);
    /* once the panel has grown, the whole card sits inside it */
    await expect
      .poll(async () => {
        const p = (await panel(page, 1).boundingBox())!;
        const c = (await card(page).boundingBox())!;
        return c.y + c.height <= p.y + p.height;
      })
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    expect(errors).toEqual([]);
  });
});
