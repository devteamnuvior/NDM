import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated home hero on the Next.js build. */

const video = (page: Page) => page.locator("#top video");
const isPlaying = (page: Page) => video(page).evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0);

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

  test("the film plays muted on its own, loads the large file, and the button pauses and resumes it", async ({ page }) => {
    await page.goto(NEXT_URL);
    await expect.poll(() => isPlaying(page), { timeout: 15_000 }).toBe(true);
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.muted && v.loop && v.playsInline)).toBe(true);
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain("hero-1600.mp4");
    await page.getByRole("button", { name: "Pause background video" }).click();
    await expect(page.getByRole("button", { name: "Play background video" })).toBeVisible();
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.getByRole("button", { name: "Play background video" }).click();
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  });

  test("the film stops when the hero leaves the screen and resumes when it returns", async ({ page }) => {
    await page.goto(NEXT_URL);
    await expect.poll(() => isPlaying(page), { timeout: 15_000 }).toBe(true);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
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

  test("the film stays on its poster, nothing animates, smooth scrolling is off", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(2000);
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
    await expect(page.getByRole("button", { name: "Play background video" })).toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400);
    expect(await page.locator("#top [data-hero-media]").evaluate((el: HTMLElement) => el.style.transform)).toBe("");
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("loads the small film, no errors, no sideways scroll, search button clear of the band", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(NEXT_URL);
    await expect.poll(() => isPlaying(page), { timeout: 15_000 }).toBe(true);
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.currentSrc)).toContain("hero-960.mp4");
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    /* the button glides up to its place above the band */
    await expect
      .poll(async () => {
        const band = (await page.locator("#top .hf-band").boundingBox())!;
        const search = (await page.locator("button.float-search").boundingBox())!;
        return search.y + search.height <= band.y;
      })
      .toBe(true);
  });
});
