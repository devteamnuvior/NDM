import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Wrinkles & fine lines page on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; the header marks Concerns and starts dark; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/wrinkles-fine-lines.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/concerns/wrinkles-fine-lines`);
  await expect(page).toHaveTitle("Wrinkles & Fine Lines Treatment Toronto | NewDermaMed");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Wrinkles & fine lines");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Concerns/Wrinkles & Fine Lines");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color)).toBe("rgb(255, 255, 255)");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("eight options and three bio-stimulators, priced from the price list, linked to their pages", async ({ page }) => {
  await page.goto(`${NEXT_URL}/concerns/wrinkles-fine-lines`);
  const options = page.locator("#options");
  await expect(options.locator("article")).toHaveCount(11);
  await expect(options.locator(".cn-bio article")).toHaveCount(3);
  const peel = options.locator("article", { hasText: "Chemical Peels" });
  await expect(peel).toContainText("From $104.30");
  await expect(peel.getByRole("link", { name: "See prices" })).toHaveAttribute("href", "/pricing#pg-chemical-peel-h");
  const aptos = options.locator(".cn-bio article", { hasText: "Aptos Thread Lift" });
  await expect(aptos.getByRole("link", { name: "About this treatment" })).toHaveAttribute("href", "/aptos-thread-lift");
  await expect(options.getByRole("link", { name: "Botox®" })).toHaveAttribute("href", "/injectables/botox");
});

test("side by side: a table of eleven rows on desktop", async ({ page }) => {
  await page.goto(`${NEXT_URL}/concerns/wrinkles-fine-lines`);
  const compare = page.locator("#compare");
  await expect(compare.locator("tbody tr")).toHaveCount(11);
  await expect(compare.locator("thead th")).toHaveText(["Treatment", "Typical visit", "Typical course", "Downtime", "Changes may appear", "From"]);
  await expect(compare.locator("details").first()).toBeHidden();
  /* prices are WooCommerce's, with the unit spelled out */
  await expect(compare.locator("tbody tr", { hasText: "Chemical Peels" })).toContainText("$104.30 per session");
  await expect(compare).toContainText("Individual results may vary.");
});

test("overview card, results line, home care and related treatments", async ({ page }) => {
  await page.goto(`${NEXT_URL}/concerns/wrinkles-fine-lines`);
  await expect(page.locator("#about aside")).toContainText("11 treatment options, from $104.30 per session");
  await expect(page.locator("#about aside").getByRole("link", { name: "Before & after gallery" })).toHaveAttribute("href", "/before-after");
  await expect(page.locator("#results")).toContainText("Individual results may vary.");
  await expect(page.locator("#home-care article")).toHaveCount(3);
  await expect(page.locator("#related").getByRole("link", { name: /Aptos Thread Lift/ })).toHaveAttribute("href", "/aptos-thread-lift");
  await expect(page.locator("#read li")).toHaveCount(3);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("side by side is a list that opens; the price pill does not toggle it; no sideways scroll", async ({ page }) => {
    await page.goto(`${NEXT_URL}/concerns/wrinkles-fine-lines`);
    const compare = page.locator("#compare");
    await expect(compare.locator("table")).toBeHidden();
    const first = compare.locator("details").first();
    await first.scrollIntoViewIfNeeded();
    await first.locator("summary").click({ position: { x: 300, y: 20 } });
    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator("dt")).toHaveCount(4);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});

test("an address with no concern behind it shows the not-found page", async ({ page }) => {
  await page.goto(`${NEXT_URL}/no-such-concern`);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
  await expect(page.locator("main[data-page='concern']")).toHaveCount(0);
});
