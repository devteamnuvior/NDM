import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/**
 * My account without a sign-in, on the Next.js build: the page shows the sign-in and nothing of an
 * account. The signed-in account (a real WooCommerce customer) is tested end to end in
 * tests/admin/account.spec.ts (npm run test:admin).
 */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; title, one h1, breadcrumb, the sign-in; no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/account.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/account`);
  await expect(page).toHaveTitle("My account, NewDermaMed Toronto");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("My account");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/My account");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { level: 2, name: "Sign in" })).toBeVisible();
  /* nothing of an account without a sign-in: no section bar, no orders, no sample member */
  await expect(page.getByRole("navigation", { name: "Account" })).toHaveCount(0);
  await expect(page.locator("main table")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("Signed in as");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("sign in, create account and forgot password are three forms in one card", async ({ page }) => {
  await page.goto(`${NEXT_URL}/account`);
  await page.waitForLoadState("networkidle");
  const main = page.locator("main");
  await expect(main.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
  await expect(main.getByLabel("Password")).toHaveAttribute("autocomplete", "current-password");

  await main.getByRole("tab", { name: "Create account" }).click();
  await expect(main.getByRole("heading", { level: 2, name: "Create your account" })).toBeVisible();
  await expect(main.getByLabel("First name")).toBeVisible();
  await expect(main.getByLabel(/^Password/)).toHaveAttribute("autocomplete", "new-password");
  await expect(main.getByRole("link", { name: "Terms" })).toHaveAttribute("href", /\/terms$/);
  await expect(main.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", /\/privacy$/);

  await main.getByRole("tab", { name: "Sign in" }).click();
  await main.getByRole("button", { name: "Forgot your password?" }).click();
  await expect(main.getByRole("heading", { level: 2, name: "Choose a new password" })).toBeVisible();
  await expect(main.getByLabel("Password")).toHaveCount(0);
  await main.getByRole("button", { name: "Back to sign in" }).click();
  await expect(main.getByRole("heading", { level: 2, name: "Sign in" })).toBeVisible();
});

test("a reset link without its key asks for a new one", async ({ page }) => {
  await page.goto(`${NEXT_URL}/account/reset`);
  await expect(page.locator("h1")).toHaveText("Choose a new password");
  await expect(page.locator("main")).toContainText("This link is not complete");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("phone: the sign-in fits a 375px window with no sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${NEXT_URL}/account`);
  await page.getByRole("tab", { name: "Create account" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
