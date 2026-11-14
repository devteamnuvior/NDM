import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Black Friday sale page on the Next.js build. */

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; its own header and footer, no site header; the Black Friday look; no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/black-friday-sale.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/black-friday-sale`);
  await expect(page).toHaveTitle("Black Friday 2026: Up to 60% Off Treatments | NewDermaMed Toronto");
  await expect(page.locator("html")).toHaveClass(/\bbfs\b/);
  await expect(page.locator("h1")).toHaveText("BlackFriday.");
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Black Friday page" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Clinic announcements" })).toHaveCount(0);
  await expect(page.locator(".bfd-tab")).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(250, 248, 247)");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("no prescription drugs among the deals; every deal comes from the price list", async ({ page }) => {
  await page.goto(`${NEXT_URL}/black-friday-sale`);
  const names = await page.locator("#deals article h3").allInnerTexts();
  expect(names.length).toBeGreaterThan(10);
  for (const n of names) expect(n).not.toMatch(/botox|dysport|latisse/i);
  await expect(page.locator("#deals")).toContainText("Individual results may vary");
});

test("a concern shortlists the deals; tapping it again shows everything", async ({ page }) => {
  await page.goto(`${NEXT_URL}/black-friday-sale`);
  const all = await page.locator("#deals article").count();
  const chip = page.locator("#concerns").getByRole("button", { name: /Stubborn fat/ });
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#deals article")).toHaveCount(1);
  await expect(page.locator("#deals")).toContainText("for stubborn fat");
  await chip.click();
  await expect(page.locator("#deals article")).toHaveCount(all);
});

test("a package goes into the plan: total, saving, the header count; it is kept after a reload; Clear empties it", async ({ page }) => {
  await page.goto(`${NEXT_URL}/black-friday-sale`);
  const card = page.locator("#deals article").first();
  await card.scrollIntoViewIfNeeded();
  const add = card.getByRole("button", { name: "Add to my plan" });
  await add.click();
  await expect(card.getByRole("button", { name: "In my plan, tap to remove" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("navigation", { name: "Black Friday page" }).getByRole("link", { name: /My plan/ })).toContainText("1");
  const plan = page.locator("#plan");
  await expect(plan.locator("ul li").first()).toBeVisible();
  await expect(plan).toContainText("1 treatment in your plan");
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("ndm-bf-plan") ?? "[]"));
  expect(saved).toHaveLength(1);
  expect(saved[0].price).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator("#plan")).toContainText("1 treatment in your plan");
  await page.locator("#plan").getByRole("button", { name: "Clear my plan" }).click();
  await expect(page.locator("#plan")).toContainText("Nothing in your plan yet");
  await expect(page.locator("#plan")).toContainText("0 treatments in your plan");
});

test("the countdown counts to the sale; Book opens the booking pop-up in the Black Friday style", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-16T15:00:00-05:00"));
  await page.goto(`${NEXT_URL}/black-friday-sale`);
  const timer = page.getByRole("timer");
  await expect(timer).toContainText("Starts in");
  await expect(timer).toHaveAttribute("aria-label", /Black Friday starts in 10 days/);
  await page.locator("header").getByRole("link", { name: "Book Free Consultation" }).click();
  const dialog = page.getByRole("dialog").filter({ hasText: "free consultation" }).first();
  await expect(dialog).toBeVisible();
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("the plan bar appears once something is in the plan; no sideways scroll", async ({ page }) => {
    await page.goto(`${NEXT_URL}/black-friday-sale`);
    await expect(page.locator(".bfs-bar")).toHaveCount(0);
    const card = page.locator("#deals article").first();
    await card.scrollIntoViewIfNeeded();
    await card.getByRole("button", { name: "Add to my plan" }).click();
    await expect(page.locator(".bfs-bar")).toBeVisible();
    await expect(page.locator(".bfs-bar")).toContainText("My plan · 1");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
