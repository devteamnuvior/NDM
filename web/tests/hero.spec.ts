import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated home hero on the Next.js build. */


function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /hydrat/i.test(m.text()))) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("loads with no errors and one h1", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Refined,not redone.");
    await expect(page.getByRole("list", { name: "Why clients choose NewDermaMed" }).getByRole("listitem")).toHaveCount(4);
  });

  test("the header is three photo slides that change on their own; the button holds and resumes them", async ({ page }) => {
    await page.goto(NEXT_URL);
    const slides = page.locator("#top .hs-slide");
    await expect(slides).toHaveCount(3);
    await expect(slides.nth(0)).toHaveClass(/\bis-on\b/);
    await expect(page.locator("#top video")).toHaveCount(0);
    /* the first photo is the one painted first: fetched at once, the others when they are needed */
    expect(await slides.nth(0).locator("img").getAttribute("loading")).toBe("eager");
    expect(await slides.nth(1).locator("img").getAttribute("loading")).toBe("lazy");
    /* only the photo in view is read out */
    expect(await slides.nth(0).locator("img").getAttribute("alt")).not.toBe("");
    expect(await slides.nth(1).locator("img").getAttribute("alt")).toBe("");
    await page.getByRole("button", { name: "Pause header photos" }).click();
    await expect(page.getByRole("button", { name: "Play header photos" })).toBeVisible();
    await expect(page.locator("#top")).toHaveClass(/\bhs-paused\b/);
    await page.waitForTimeout(7500);
    await expect(slides.nth(0)).toHaveClass(/\bis-on\b/);
    await page.getByRole("button", { name: "Play header photos" }).click();
    await expect(page.locator("#top")).not.toHaveClass(/\bhs-paused\b/);
    await expect(slides.nth(1)).toHaveClass(/\bis-on\b/, { timeout: 10_000 });
  });

  test("a bar under the photos shows the photo in view and picks another", async ({ page }) => {
    await page.goto(NEXT_URL);
    const bars = page.getByRole("group", { name: "Header photos" }).getByRole("button");
    await expect(bars).toHaveCount(3);
    await expect(bars.nth(0)).toHaveAttribute("aria-current", "true");
    await bars.nth(2).click();
    await expect(page.locator("#top .hs-slide").nth(2)).toHaveClass(/\bis-on\b/);
    await expect(bars.nth(2)).toHaveAttribute("aria-current", "true");
  });

  test("the film drifts and the words fade as the page scrolls", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 300));
    const media = page.locator("#top [data-hero-media]");
    const words = page.locator("#top [data-hero-words]");
    await expect.poll(() => media.evaluate((el: HTMLElement) => el.style.transform)).toBe("translate3d(0px, 96px, 0px)");
    await expect.poll(() => words.evaluate((el: HTMLElement) => el.style.opacity)).toBe((1 - 300 / (900 * 0.75)).toFixed(3));
  });

  test("buttons and the brand band", async ({ page }) => {
    await page.goto(NEXT_URL);
    const hero = page.locator("#top");
    await expect(hero.getByRole("link", { name: "Book Free Consultation" })).toHaveAttribute("href", "#/book");
    await hero.getByRole("link", { name: "Find your treatment" }).click();
    await expect(page).toHaveURL(/#start$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);
    /* the band's second copy only exists to make the loop seamless: hidden from assistive tech */
    await expect(hero.locator(".hf-marq ul")).toHaveCount(2);
    await expect(hero.locator(".hf-marq ul").nth(1)).toHaveAttribute("aria-hidden", "true");
    expect(await hero.locator(".hf-marq").evaluate((el) => getComputedStyle(el).animationName)).toBe("hfMarq");
  });

  test("smooth scrolling is on, and stops while an overlay is open", async ({ page }) => {
    await page.goto(NEXT_URL);
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await page.locator("header").getByRole("button", { name: "Search treatments" }).click();
    await expect(page.getByRole("dialog", { name: "Search treatments" })).toBeVisible();
    await expect(page.locator("#site-search")).toBeFocused();
    await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Search treatments" })).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  });

  test("layout does not shift while the page loads", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("the first photo stays, nothing animates, smooth scrolling is off", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(7500);
    await expect(page.locator("#top .hs-slide").nth(0)).toHaveClass(/\bis-on\b/);
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400);
    expect(await page.locator("#top [data-hero-media]").evaluate((el: HTMLElement) => el.style.transform)).toBe("");
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("the third photo has a phone version; no errors, no sideways scroll; no pause button or bars; chat and search wait for the hero", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(NEXT_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#top .hs-slide")).toHaveCount(3);
    expect(await page.locator("#top .hs-slide").nth(2).locator("source").getAttribute("srcset")).toContain("visia-m");
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    /* the hero is kept calm on phones (2026-11-17): the first two proof points, no pause button, no photo bars */
    await expect(page.locator("#top .hf-toggle")).toBeHidden();
    await expect(page.locator("#top .hs-dots")).toBeHidden();
    await expect(page.getByRole("list", { name: "Why clients choose NewDermaMed" }).getByRole("listitem")).toHaveCount(2);
    /* the floating buttons stay away until the hero is more than half scrolled past */
    await expect(page.locator("button.float-search")).toHaveClass(/\bis-off\b/);
    await expect(page.locator("button.chat-launch")).toHaveClass(/\bis-off\b/);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await expect(page.locator("button.float-search")).not.toHaveClass(/\bis-off\b/);
    await expect(page.locator("button.chat-launch")).not.toHaveClass(/\bis-off\b/);
  });
});
