import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated treatments carousel on the Next.js build. */

const section = (page: Page) => page.locator("#treatments");
const cards = (page: Page) => page.locator("#tm-panel article");

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await section(page).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60));
  await expect(section(page).locator("#menu-title")).toHaveClass(/\bin\b/);
  await page.waitForTimeout(500);
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("All tab lists every treatment; prices come from the price list", async ({ page }) => {
    await goToSection(page);
    await expect(section(page).getByRole("tab")).toHaveText(["All", "Injectables", "Laser & Energy", "Skin", "Body", "Veins", "Hair"]);
    await expect(section(page).getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
    await expect(cards(page)).toHaveCount(25);
    await expect(cards(page).first()).toContainText("Dermal Fillers");
    await expect(cards(page).first()).toContainText("From $497.50"); /* lowest price per syringe after the offer */
    await expect(section(page).getByRole("link", { name: "All treatments" })).toHaveAttribute("href", "#/treatments");
  });

  test("tabs switch the cards, by click and by arrow keys", async ({ page }) => {
    await goToSection(page);
    await section(page).getByRole("tab", { name: "Veins" }).click();
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator("#tm-panel")).toHaveAttribute("aria-labelledby", "tm-t-veins");
    await expect(section(page).getByRole("link", { name: "All veins" })).toHaveAttribute("href", "#/veins");
    await page.keyboard.press("ArrowRight");
    await expect(section(page).getByRole("tab", { name: "Hair" })).toBeFocused();
    await expect(cards(page)).toHaveCount(2);
    await page.keyboard.press("ArrowRight"); /* wraps round to the first tab */
    await expect(section(page).getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
  });

  test("arrows move the rail by one card and hide at each end", async ({ page }) => {
    await goToSection(page);
    const rail = page.locator("#tm-panel");
    const prev = section(page).getByRole("button", { name: "Previous treatments" });
    const next = section(page).getByRole("button", { name: "Next treatments" });
    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();
    const cardWidth = await cards(page).first().evaluate((el: HTMLElement) => el.offsetWidth);
    await next.click();
    await expect.poll(() => rail.evaluate((r) => Math.round(r.scrollLeft))).toBe(cardWidth + 16);
    await expect(prev).toBeEnabled();
    await rail.evaluate((r) => r.scrollTo({ left: r.scrollWidth, behavior: "auto" }));
    await expect(next).toBeDisabled();
    await prev.click();
    await expect(next).toBeEnabled();
  });

  test("a short category needs no arrows", async ({ page }) => {
    await goToSection(page);
    await section(page).getByRole("tab", { name: "Hair" }).click();
    await expect(section(page).getByRole("button", { name: "Previous treatments" })).toBeDisabled();
    await expect(section(page).getByRole("button", { name: "Next treatments" })).toBeDisabled();
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("cards scroll sideways inside the rail, the page does not; arrows are hidden; no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await goToSection(page);
    await expect(section(page).getByRole("button", { name: "Next treatments" })).toBeHidden();
    const rail = page.locator("#tm-panel");
    expect(await rail.evaluate((r) => r.scrollWidth > r.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    expect(errors).toEqual([]);
  });
});
