import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Black Friday tab on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("before the sale: the tab opens a panel counting down to the start; Escape closes and returns focus", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-13T09:30:00-05:00"));
  await page.goto(NEXT_URL);
  const tab = page.getByRole("button", { name: /Black Friday Sale/ });
  await expect(tab).toBeVisible();
  await tab.click();
  const panel = page.getByRole("dialog", { name: "Black Friday sale" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("timer")).toHaveAttribute("aria-label", "Black Friday starts in 6 days, 14 hours and 30 minutes");
  await expect(panel.getByText("Doors open Friday, November 20.")).toBeVisible();
  await expect(panel.getByRole("link", { name: "See the Black Friday deals" })).toHaveAttribute("href", "/black-friday");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveClass(/^(?!.*is-open)/);
  await page.getByRole("button", { name: /Black Friday Sale/ }).click();
  await panel.getByRole("button", { name: "Close the Black Friday panel" }).click();
  await expect(tab).toBeFocused();
});

test("during the VIP Sale the tab shows the VIP Sale, the time left in it and the link to its page", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-16T09:30:00-05:00"));
  await page.goto(NEXT_URL);
  await page.getByRole("button", { name: /^VIP Sale/ }).click();
  const panel = page.getByRole("dialog", { name: "VIP Sale" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "VIP Sale." })).toBeVisible();
  await expect(panel.getByText("VIP Sale · Nov 14 to Nov 19")).toBeVisible();
  await expect(panel.getByRole("timer")).toHaveAttribute("aria-label", "VIP Sale ends in 3 days, 14 hours and 29 minutes");
  await expect(panel.getByRole("link", { name: "See the VIP Sale deals" })).toHaveAttribute("href", "/vip-sale");
  await expect(page.getByRole("button", { name: /Black Friday Sale/ })).toHaveCount(0);
});

test("during the sale it counts down to the end and shows how much has passed", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-28T23:59:30-05:00"));
  await page.goto(NEXT_URL);
  await page.getByRole("button", { name: /Black Friday Sale/ }).click();
  const panel = page.getByRole("dialog", { name: "Black Friday sale" });
  await expect(panel.getByRole("timer")).toHaveAttribute("aria-label", "Offers end in 8 days, 23 hours and 59 minutes");
  await expect(panel.getByText("50% of Black Friday has passed")).toBeVisible();
});

test("after the sale the tab is gone", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-12-08T08:00:00-05:00"));
  await page.goto(NEXT_URL);
  await page.waitForTimeout(2500);
  await expect(page.locator("button.bfd-tab")).toHaveCount(0);
});
