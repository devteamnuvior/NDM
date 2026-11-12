import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated booking pop-up and the booking form on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("every booking button opens the pop-up; Escape, the backdrop and the button close it; focus returns", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  const opener = page.locator("header").getByRole("link", { name: "Book Free Consultation" });
  await opener.click();
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect(page).not.toHaveURL(/#\/book/); /* the link is intercepted, the address does not change */
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  await page.locator("#top").getByRole("link", { name: "Book Free Consultation" }).click();
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Close booking form" }).click();
  await expect(dialog).toBeHidden();
  await opener.click();
  await page.mouse.click(30, 450); /* the dimmed page */
  await expect(dialog).toBeHidden();
});

test("the form: validation at each step, the call-back path, and a fresh form each time", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  const alert = dialog.getByRole("alert");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please choose at least one option.");
  await dialog.getByRole("checkbox", { name: "Something else" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please tell us in a few words what you’d like to address.");
  await dialog.locator('input[name="other"]').fill("neck lines");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("Step 2 of 4 · Your details")).toBeVisible();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please add your name, mobile number and a valid email.");
  await dialog.locator('input[name="first"]').fill("Sam");
  await dialog.locator('input[name="last"]').fill("Tester");
  await dialog.locator('input[name="phone"]').fill("416 555 0100");
  await dialog.locator('input[name="email"]').fill("not-an-email");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(alert).toHaveText("Please add your name, mobile number and a valid email.");
  await dialog.locator('input[name="email"]').fill("sam@example.com");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await expect(dialog.getByText("Step 3 of 4 · Book or call")).toBeVisible();
  await dialog.getByRole("button", { name: /Have us call you/ }).click();
  await expect(dialog.getByText("Step 4 of 4 · Best time to call")).toBeVisible();
  await dialog.getByRole("button", { name: "Request a call" }).click();
  await expect(alert).toHaveText("Please choose a time of day.");
  await dialog.getByRole("radio", { name: "Afternoon" }).check();
  await dialog.getByRole("button", { name: "Request a call" }).click();
  await expect(dialog.getByRole("status")).toContainText("Request sent, Sam.");
  await expect(dialog.getByRole("status")).toContainText("We’ll call you in the afternoon within one business day");
  /* closing and opening again starts from an empty form */
  await page.keyboard.press("Escape");
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  await expect(dialog.getByText("Step 1 of 4 · Your concern")).toBeVisible();
  await expect(dialog.getByRole("checkbox", { name: "Something else" })).not.toBeChecked();
});

test("the calendar closes Sundays and past days, and a booked time is confirmed", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.waitForTimeout(800);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog", { name: /Book a free consultation/ });
  await dialog.getByRole("checkbox", { name: "Volume loss" }).check();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.locator('input[name="first"]').fill("Sam");
  await dialog.locator('input[name="last"]').fill("Tester");
  await dialog.locator('input[name="phone"]').fill("416 555 0100");
  await dialog.locator('input[name="email"]').fill("sam@example.com");
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /Book a time now/ }).click();
  await expect(dialog.getByRole("button", { name: "Previous month" })).toBeDisabled();
  await dialog.getByRole("button", { name: "Next month" }).click();
  const days = dialog.getByRole("group", { name: "Choose a day" });
  expect(await days.locator('button[aria-label*="Sun"]:not([disabled])').count()).toBe(0);
  expect(await days.locator('button[aria-label*="Sun"][disabled]').count()).toBeGreaterThan(3);
  await dialog.getByRole("button", { name: "Book this time" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Please pick a day and a time.");
  await days.locator("button:not([disabled])").nth(3).click();
  const times = dialog.getByRole("group", { name: "Choose a time" }).locator("button");
  expect(await times.count()).toBeGreaterThanOrEqual(7);
  await times.first().click();
  await dialog.getByRole("button", { name: "Book this time" }).click();
  await expect(dialog.getByRole("status")).toContainText("You’re booked, Sam.");
  await expect(dialog.getByRole("status")).toContainText("with your VISIA® skin analysis");
});
