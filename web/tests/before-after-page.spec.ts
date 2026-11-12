import { expect, test } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated Before & After page on the Next.js build. */

const GALLERY = 'section[aria-labelledby="gallery-title"]';

test.use({ viewport: { width: 1440, height: 900 } });

test("the old address redirects; no errors; one h1; the results line is on the page", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${NEXT_URL}/before-after.html`);
  await expect(page).toHaveURL(`${NEXT_URL}/before-after`);
  await expect(page).toHaveTitle("Before & After Gallery, NewDermaMed Toronto");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Real Patient Transformations Before & After Gallery");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveText("Home/Before & after");
  await expect(page.locator(GALLERY)).toContainText("Individual results may vary.");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("fifty cases; a treatment filter narrows them and All brings them back", async ({ page }) => {
  await page.goto(`${NEXT_URL}/before-after`);
  const g = page.locator(GALLERY);
  const cards = g.locator("ul button");
  await expect(cards).toHaveCount(50);
  await expect(g.getByRole("group", { name: "Filter by treatment" }).getByRole("button")).toHaveCount(17);
  const pick = g.getByRole("button", { name: "Tear Troughs", exact: true });
  await pick.click();
  await expect(pick).toHaveAttribute("aria-pressed", "true");
  await expect(cards).toHaveCount(4);
  for (const t of await cards.allInnerTexts()) expect(t).toContain("Tear Troughs");
  await g.getByRole("button", { name: "All", exact: true }).click();
  await expect(cards).toHaveCount(50);
});

/* The full-size view covers the whole page, header included (a fix of the prototype, where the header covered Close). */
test("a case opens at full size with the results line; Escape, the close button and the backdrop close it", async ({ page }) => {
  await page.goto(`${NEXT_URL}/before-after`);
  const g = page.locator(GALLERY);
  const first = g.locator("ul button").first();
  await first.click();
  const dialog = page.getByRole("dialog", { name: "Belkyra" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("alt", "Belkyra, before and after");
  await expect(dialog).toContainText("Individual results may vary");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await first.click();
  const close = dialog.getByRole("button", { name: "Close" });
  const box = (await close.boundingBox())!;
  /* nothing sits on top of the button */
  expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('[role="dialog"]'), [box.x + box.width / 2, box.y + box.height / 2])).toBe(true);
  await close.click();
  await expect(dialog).toHaveCount(0);
  await first.click();
  await dialog.click({ position: { x: 10, y: 400 } });
  await expect(dialog).toHaveCount(0);
});

test("the home page's See all button opens the gallery", async ({ page }) => {
  await page.goto(NEXT_URL);
  const link = page.locator('section[aria-labelledby="results"]').getByRole("link", { name: /See all/ });
  await expect(link).toHaveAttribute("href", "/before-after");
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test("two columns, no sideways scroll", async ({ page }) => {
    await page.goto(`${NEXT_URL}/before-after`);
    const cards = page.locator(`${GALLERY} ul button`);
    const [a, b, c] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox(), await cards.nth(2).boundingBox()];
    expect(b!.y).toBe(a!.y);
    expect(c!.x).toBe(a!.x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});
