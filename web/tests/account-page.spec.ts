import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated My account page on the Next.js build (sample data only). */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; title, one h1, breadcrumb, eight sections on the bar; no errors", async ({ page }) => {
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
  const bar = page.getByRole("navigation", { name: "Account" });
  await expect(bar.getByRole("link")).toHaveCount(8);
  await expect(bar.locator('[aria-current="true"]')).toHaveText("Dashboard");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("the bar and the dashboard tiles switch sections, and the address keeps the section", async ({ page }) => {
  await page.goto(`${NEXT_URL}/account`);
  const bar = page.getByRole("navigation", { name: "Account" });
  await bar.getByRole("link", { name: /Orders/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Your orders" })).toBeVisible();
  await expect(page).toHaveURL(`${NEXT_URL}/account#orders`);
  await expect(page.locator("main tbody tr")).toHaveCount(3);
  await bar.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("button", { name: /Health forms/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Before your treatment" })).toBeVisible();
  await expect(bar.locator('[aria-current="true"]')).toHaveText("Health & consent forms");
});

test("a section named in the address opens first", async ({ page }) => {
  await page.goto(`${NEXT_URL}/account#membership`);
  await expect(page.getByRole("heading", { level: 2, name: "Your NewDermaMed membership" })).toBeVisible();
});

test("order totals are WooCommerce's prices; a shop order shows no amount", async ({ page }) => {
  await page.goto(`${NEXT_URL}/account#orders`);
  const rows = page.locator("main tbody tr");
  await expect(rows.nth(0).locator("td").nth(4)).toHaveText(/^\$\d+(\.\d\d)?$/);
  await expect(rows.nth(2).locator("td").nth(4)).toHaveText("Shop order");
});

test("wishlist: removing a product lowers the count on the bar; notification switches toggle", async ({ page }) => {
  await page.goto(`${NEXT_URL}/account#wishlist`);
  await expect(page.getByRole("heading", { level: 2, name: "6 saved products" })).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("heading", { level: 2, name: "5 saved products" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: /Wishlist/ })).toContainText("5");
  await page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: "Account details" }).click();
  /* the switches carry no name of their own, as in the prototype: first = appointment updates (locked), second = offers */
  const offers = page.getByRole("switch").nth(1);
  await expect(offers).toHaveAttribute("aria-checked", "false");
  await offers.click();
  await expect(offers).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").first()).toBeDisabled();
});

test("phone: no sideways scroll in any section", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  for (const tab of ["dashboard", "plans", "orders", "payment", "membership", "wishlist", "forms", "details"]) {
    await page.goto(`${NEXT_URL}/account#${tab}`);
    await page.reload();
    await page.waitForSelector("#acc-title");
    expect(await page.evaluate(() => document.documentElement.scrollWidth), tab).toBeLessThanOrEqual(375);
  }
  await ctx.close();
});
