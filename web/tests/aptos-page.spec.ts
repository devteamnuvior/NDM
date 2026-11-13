import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the Aptos Thread Lift page on the Next.js build. Its content is a WordPress page (template "Aptos Thread Lift page"): WordPress must be running. */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; the header marks Procedures and starts dark; one h1", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/aptos-thread-lift.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/aptos-thread-lift`);
  await expect(page).toHaveTitle("Aptos Thread Lift in Toronto, a Lift Without Surgery, NewDermaMed");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Aptos Thread Lift in Toronto");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Procedures/Aptos Thread Lift");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector("header > .hdr-bar")!).color)).toBe("rgb(255, 255, 255)");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("the quick facts sit half over the header photo, with both clinics' numbers", async ({ page }) => {
  await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  await page.waitForTimeout(1200);
  const glance = page.getByRole("region", { name: "Treatment at a glance" });
  await expect(glance.locator("dt")).toHaveText(["Treatment type", "Duration", "Recovery time", "May last"]);
  await expect(glance.locator("dd")).toHaveText(["Minimally invasive", "60 minutes", "Up to 2 weeks", "Up to 24 months"]);
  await expect(glance.getByRole("link", { name: "Call the Downtown clinic at 416-671-9766" })).toHaveAttribute("href", "tel:+14166719766");
  await expect(glance.getByRole("link", { name: "Call the Uptown clinic at 416-224-8800" })).toHaveAttribute("href", "tel:+14162248800");
  const hero = (await page.locator('section[aria-labelledby="proc-title"]').boundingBox())!;
  const card = (await glance.locator("dl").locator("..").boundingBox())!;
  expect(Math.abs(card.y + card.height / 2 - (hero.y + hero.height))).toBeLessThanOrEqual(1);
});

test("the section bar scrolls to a section and marks the one in view", async ({ page }) => {
  await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  const bar = page.getByRole("navigation", { name: "On this page" });
  await expect(bar.getByRole("link")).toHaveCount(10);
  await bar.getByRole("link", { name: "Good candidates" }).click();
  await expect(page.locator("#candidate")).toBeInViewport();
  await expect(bar.getByRole("link", { name: "Good candidates" })).toHaveAttribute("aria-current", "true");
  await expect(bar.locator('[aria-current="true"]')).toHaveCount(1);
  await bar.getByRole("link", { name: "Back to top" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("the price comes from the price list; the group folds; Add to cart puts the treatment in the cart", async ({ page }) => {
  await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  const prices = page.locator("#prices");
  await prices.scrollIntoViewIfNeeded();
  const head = prices.locator("#tx-pr-h");
  await expect(head).toHaveAttribute("aria-expanded", "true");
  await expect(head).toContainText("1 option");
  await expect(head).toContainText("From $2500");
  const row = prices.locator(".pr-opt");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Mid face");
  await expect(row).toContainText("$2500");
  await row.getByRole("button", { name: "Add Aptos Excellence Visage Method EV PLA/PCL (up to 24 months), Mid face to cart" }).click();
  await expect(row.getByRole("group", { name: "Quantity, Aptos Excellence Visage Method EV PLA/PCL (up to 24 months), Mid face" })).toBeVisible();
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem("ndm-cart") ?? "[]"));
  expect(cart).toHaveLength(1);
  expect(cart[0]).toMatchObject({ name: "Aptos Excellence Visage Method EV PLA/PCL (up to 24 months)", label: "Mid face", price: 2500, qty: 1 });
  await head.click();
  await expect(head).toHaveAttribute("aria-expanded", "false");
  await expect(prices.locator("#tx-pr")).toHaveAttribute("inert", "");
  await expect(prices.getByRole("link", { name: "All treatment prices" })).toHaveAttribute("href", "/pricing#prices");
});

test("before and after: left out, with its link in the section bar, while no case of the gallery is picked in WordPress", async ({ page }) => {
  await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  await expect(page.locator("#results")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Results", exact: true })).toHaveCount(0);
});

test("what to expect lights up each step as it passes", async ({ page }) => {
  await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  const expectSec = page.locator("#expect");
  const steps = expectSec.locator("[data-step]");
  await expect(steps).toHaveCount(4);
  await steps.nth(3).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4));
  await expect(expectSec.locator("text=04").first()).toBeVisible();
  await expect(steps.nth(3).locator("> span")).toHaveClass(/bg-ndm-deep/);
});

test("the header form is the compact booking form; Start your journey opens", async ({ page }) => {
  await page.goto(`${NEXT_URL}/aptos-thread-lift`);
  const form = page.getByRole("region", { name: "Book your free consultation" }).first();
  await expect(form).toBeVisible();
  await expect(form.getByRole("tablist", { name: "Type of concern" })).toBeVisible();
  const card = page.locator(".jr-card");
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/is-on/);
  await expect(card.getByRole("link", { name: "Find a clinic" })).toHaveAttribute("href", "/about#contact");
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("the booking form has its own block under the facts; no sideways scroll", async ({ page }) => {
    await page.goto(`${NEXT_URL}/aptos-thread-lift`);
    await expect(page.locator("#hero-form-title")).toBeHidden();
    await expect(page.locator("#mobile-form-title")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
