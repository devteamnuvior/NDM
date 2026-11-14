import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated team section and profile dialog on the Next.js build. */

const SECTION = 'section[aria-labelledby="team"]';
const dialog = (page: Page) => page.getByRole("dialog", { name: /Dr\.|Alin/ });

async function goToSection(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
  await expect(page.locator(`${SECTION} .team-ports`)).toHaveClass(/\bin\b/);
  await page.waitForTimeout(1200);
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("four portraits in order; the fourth has no profile yet", async ({ page }) => {
    await goToSection(page);
    const buttons = page.locator(`${SECTION} .team-port button`);
    await expect(buttons).toHaveCount(4);
    await expect(page.locator(`${SECTION} .team-port`)).toContainText(["Alin Gharibian", "Dr. Negin Mastouri", "Dr. Luis Figueroa", "Heather Bouchard, NP"]);
    await expect(buttons.nth(3)).toBeDisabled();
    await expect(buttons.nth(3)).toHaveAttribute("aria-label", "Heather Bouchard, NP, Nurse Practitioner, profile coming soon");
    await expect(page.locator(`${SECTION} .team-lines`)).toHaveClass(/\bin\b/);
  });

  test("a portrait opens the profile; focus is kept inside; Escape closes and returns focus", async ({ page }) => {
    await goToSection(page);
    const opener = page.getByRole("button", { name: "View profile of Dr. Negin Mastouri, Medical Director / Aesthetic Doctor" });
    await opener.click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByRole("heading", { name: "Dr. Negin Mastouri" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close profile" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
    await expect(dialog(page).locator("dl").first().locator("dt")).toHaveText(["Education", "Board certification", "Teaching"]);
    await expect(dialog(page).getByRole("list", { name: "Areas of focus" }).getByRole("listitem")).toHaveCount(6);
    /* Tab cycles between the two controls of the dialog and never leaves it */
    await page.keyboard.press("Tab");
    await expect(dialog(page).getByRole("link", { name: "Book Free Consultation" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Close profile" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("the dimmed page and the close button close the profile", async ({ page }) => {
    await goToSection(page);
    await page.getByRole("button", { name: /View profile of Alin Gharibian/ }).click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.click(20, 20);
    await expect(dialog(page)).toHaveCount(0);
    await page.getByRole("button", { name: /View profile of Dr. Luis Figueroa/ }).click();
    await page.getByRole("button", { name: "Close profile" }).click();
    await expect(dialog(page)).toHaveCount(0);
  });

  test("portraits drift at different speeds with the scroll", async ({ page }) => {
    await goToSection(page);
    const shifts = () => page.locator(`${SECTION} .team-ports > li`).evaluateAll((els) => els.map((e) => (e as HTMLElement).style.transform));
    const before = await shifts();
    await page.evaluate(() => window.scrollBy(0, 300));
    await expect.poll(shifts).not.toEqual(before);
    expect(new Set(await shifts()).size).toBe(4);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the profile opens as a bottom sheet; no sideways scroll; no errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    await goToSection(page);
    await page.getByRole("button", { name: /View profile of Alin Gharibian/ }).tap();
    const card = page.locator(".team-pop-card");
    await expect(card).toBeVisible();
    await expect.poll(async () => Math.round((await card.boundingBox())!.y + (await card.boundingBox())!.height)).toBe(812);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    expect(errors).toEqual([]);
  });
});
