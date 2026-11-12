import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/**
 * Behaviour of the migrated cart (drawer, quantity stepper, floating bar) on the Next.js build. The lines
 * are real entries of the WooCommerce price list: the cart checks itself against it when it loads and
 * re-keys each line by its WooCommerce IDs ("wc:<product>:<variation>").
 */

const LINES = [
  { key: "a", cat: "Dermal Fillers", name: "Lip Enhancement", label: "2 Syringes", price: 1125, unit: "", was: 1500, qty: 1 },
  { key: "b", cat: "Microneedling", name: "Microneedling-Face", label: "Single session", price: 245, unit: "", was: 490, qty: 2 },
];
const drawer = (page: Page) => page.getByRole("dialog", { name: /Your cart/ });
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("ndm-cart") ?? "[]") as { key: string; qty: number }[]);

async function seeded(page: Page): Promise<void> {
  await page.goto(NEXT_URL);
  await page.evaluate((v) => localStorage.setItem("ndm-cart", JSON.stringify(v)), LINES);
  await page.reload();
  await expect.poll(async () => (await saved(page)).map((l) => l.key)).toEqual(["wc:42:44", "wc:92:93"]); /* checked against WooCommerce */
}

test.use({ viewport: { width: 1440, height: 900 } });

test("the header bag opens the drawer with the saved lines, totals and savings", async ({ page }) => {
  await seeded(page);
  await page.locator("header").getByRole("button", { name: "Cart, 3 items" }).click();
  await expect(drawer(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Close cart" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await expect(drawer(page).locator("#cart-title")).toHaveText("Your cart 3 items");
  await expect(drawer(page).getByRole("listitem")).toHaveCount(2);
  await expect(drawer(page).getByRole("listitem").first()).toContainText("Regular price $1500");
  await expect(drawer(page)).toContainText("You save$865");
  await expect(drawer(page)).toContainText("Subtotal$1615");
  await expect(drawer(page).getByRole("link", { name: "Checkout" })).toHaveAttribute("href", "/checkout");
  await expect(drawer(page).getByRole("link", { name: "View cart" })).toHaveAttribute("href", "/cart");
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
});

test("the stepper changes quantities, removes a line, and everything is saved for the other pages", async ({ page }) => {
  await seeded(page);
  await page.locator("header").getByRole("button", { name: "Cart, 3 items" }).click();
  await drawer(page).getByRole("button", { name: "One more, Microneedling-Face, Single session" }).click();
  await expect(drawer(page).locator("#cart-title")).toHaveText("Your cart 4 items");
  await expect(drawer(page)).toContainText("Subtotal$1860");
  await expect(page.locator("header").getByRole("button", { name: "Cart, 4 items" })).toBeVisible();
  expect((await saved(page)).find((l) => l.key === "wc:92:93")?.qty).toBe(3);
  /* at one, the minus button becomes a bin and removes the line */
  await drawer(page).getByRole("button", { name: "Remove Lip Enhancement, 2 Syringes from cart" }).click();
  await expect(drawer(page).getByRole("listitem")).toHaveCount(1);
  expect((await saved(page)).map((l) => l.key)).toEqual(["wc:92:93"]);
  await drawer(page).getByRole("button", { name: "Remove", exact: true }).click();
  await expect(drawer(page)).toContainText("Your cart is empty");
  expect(await saved(page)).toEqual([]);
  await expect(drawer(page).getByRole("button", { name: "Browse prices" })).toBeVisible();
});

test("the floating cart bar shows after the first screen, opens the drawer, and hides while it is open", async ({ page }) => {
  await seeded(page);
  const pill = page.locator("button.cart-pill");
  await expect(pill).toHaveClass(/is-off/); /* hidden on the first screen */
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await expect(pill).not.toHaveClass(/is-off/);
  await expect(pill).toHaveAttribute("aria-label", "View cart, 3 items, $1615");
  await pill.click();
  await expect(drawer(page)).toBeVisible();
  await expect(pill).toHaveClass(/is-off/);
});

test("with an empty cart there is no floating bar", async ({ page }) => {
  await page.goto(NEXT_URL);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await page.waitForTimeout(800);
  await expect(page.locator("button.cart-pill")).toHaveClass(/is-off/);
});
