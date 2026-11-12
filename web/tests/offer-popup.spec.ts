import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated first-visit offer pop-up on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("?offer previews the pop-up; it takes focus, and Escape closes it and gives focus back", async ({ page }) => {
  await page.goto(`${NEXT_URL}/?offer`);
  const dialog = page.getByRole("dialog", { name: /10% off/ });
  await expect(dialog).toBeVisible({ timeout: 8000 });
  await expect(dialog.getByRole("link", { name: "Claim my 10% off" })).toBeFocused();
  await expect(dialog.getByRole("link", { name: "Claim my 10% off" })).toHaveAttribute("href", "/promotion");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => Number(localStorage.getItem("ndm-offer-closed")))).toBeGreaterThan(0);
  expect(await page.evaluate(() => sessionStorage.getItem("ndm-offer-index.html"))).toBe("1");
});

test("an automated browser is never shown the offer on its own", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.7));
  await page.waitForTimeout(2500);
  await expect(page.locator(".offer-pop-root")).toHaveCount(0);
});

test("for a visitor: it appears after scrolling past 45% of the page, once per page per visit", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const page = await ctx.newPage();
  await page.goto(NEXT_URL);
  await page.waitForTimeout(1000);
  await expect(page.locator(".offer-pop-root")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
  const dialog = page.getByRole("dialog", { name: /10% off/ });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await dialog.getByRole("button", { name: "No thanks, maybe later" }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
  await page.waitForTimeout(2000);
  await expect(page.locator(".offer-pop-root")).toHaveCount(0);
  await ctx.close();
});
