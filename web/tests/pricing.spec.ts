import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Pricing page on the Next.js build. */

const list = (page: Page) => page.locator("#prices");

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; the header marks Pricing; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/pricing.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/pricing`);
  await expect(page).toHaveTitle("Treatments & Pricing, NewDermaMed Toronto");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Treatments & pricing");
  await expect(page.locator("header nav").getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Pricing");
  /* the header starts dark over the film, with no light flash */
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color)).toBe("rgb(255, 255, 255)");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("categories and treatments fold; Expand all opens every treatment of a category", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing`);
  await expect(list(page).locator(".pr-group")).toHaveCount(23);
  const cat = list(page).locator("#pg-botox-dysport-h");
  await expect(cat).toHaveAttribute("aria-expanded", "false");
  await expect(cat).toContainText("From $7.70 / unit");
  await expect(cat).toContainText("Up to 30% off");
  await cat.click();
  await expect(cat).toHaveAttribute("aria-expanded", "true");
  const row = list(page).locator("#pr-botox-dysport-0-h");
  await row.click();
  await expect(row).toHaveAttribute("aria-expanded", "true");
  const options = list(page).locator("#pr-botox-dysport-0 .pr-opt");
  await expect(options).toHaveCount(5);
  await expect(options.nth(1)).toContainText("60 units");
  await expect(options.nth(1)).toContainText("Regular price $720");
  await expect(options.nth(1)).toContainText("now $648");
  await list(page).locator("#pg-botox-dysport").getByRole("button", { name: "Expand all" }).click();
  await expect(list(page).locator("#pg-botox-dysport .pr-item.is-open")).toHaveCount(3);
  await list(page).locator("#pg-botox-dysport").getByRole("button", { name: "Collapse all" }).click();
  await expect(list(page).locator("#pg-botox-dysport .pr-item.is-open")).toHaveCount(0);
});

test("search narrows the list, counts the matches, and can be cleared", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing`);
  const box = list(page).getByRole("searchbox");
  await expect(box).toHaveAttribute("placeholder", "Search 128 treatments");
  await box.fill("lip");
  await expect(list(page).getByText(/treatments? match(es)? “lip”/)).toBeVisible();
  await expect(list(page).locator(".pr-group").first()).toHaveClass(/is-open/); /* matches show opened */
  await box.fill("zzzz");
  await expect(list(page).getByText("No treatments match “zzzz”")).toBeVisible();
  await list(page).getByRole("button", { name: "Clear search" }).click();
  await expect(box).toHaveValue("");
  await expect(list(page).locator(".pr-group")).toHaveCount(23);
});

test("Add to cart becomes a stepper and fills the cart shared with the header and the drawer", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing`);
  await list(page).locator("#pg-microneedling-h").click();
  await list(page).locator("#pr-microneedling-0-h").click();
  const option = list(page).locator("#pr-microneedling-0 .pr-opt").first();
  await option.getByRole("button", { name: /^Add .* to cart$/ }).click();
  await expect(option.getByRole("group", { name: /^Quantity/ })).toBeVisible();
  await option.getByRole("button", { name: /^One more/ }).click();
  await expect(option.locator("output")).toHaveText("2");
  await expect(page.locator("header").getByRole("button", { name: "Cart, 2 items" })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("ndm-cart") ?? "[]") as { cat: string; qty: number }[]);
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ cat: "Microneedling", qty: 2 });
  await page.locator("header").getByRole("button", { name: "Cart, 2 items" }).click();
  await expect(page.getByRole("dialog", { name: /Your cart/ }).getByRole("listitem")).toHaveCount(1);
});

test("a special's Buy opens its category in the list and scrolls to it", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing`);
  await page.waitForTimeout(800);
  const card = page.locator("#specials li").filter({ hasText: "Microneedling" });
  await expect(card).toContainText("Up to 50% off");
  await card.getByRole("link", { name: "Buy" }).click();
  const cat = list(page).locator("#pg-microneedling-h");
  await expect(cat).toHaveAttribute("aria-expanded", "true");
  await expect.poll(async () => Math.round((await cat.boundingBox())!.y), { timeout: 8000 }).toBeLessThan(260);
});

test("on inner pages the Buy button's hover is ink, as in the original", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing`);
  const buy = page.locator("#specials a.btn-buy").first();
  await buy.evaluate((el) => el.scrollIntoView({ block: "center" })); /* clear of the fixed header */
  await page.waitForTimeout(600);
  await buy.hover();
  await expect.poll(() => buy.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(27, 36, 43)");
});

test("arriving with #prices lands on the price list", async ({ page }) => {
  await page.goto(`${NEXT_URL}/pricing#prices`);
  await expect.poll(async () => Math.round((await list(page).boundingBox())!.y), { timeout: 8000 }).toBeLessThan(60);
});
