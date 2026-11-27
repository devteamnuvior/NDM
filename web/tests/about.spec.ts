import { expect, test, type Page } from "@playwright/test";
import { NEXT_URL } from "../playwright.config";

/** Behaviour of the migrated About NewDermaMed section on the Next.js build. */

const SECTION = 'section[aria-labelledby="approach"]';
const scrollBy = (page: Page, y: number) => page.evaluate((v) => window.scrollBy(0, v), y);
const firstStat = (page: Page) => page.locator(`${SECTION} [data-about-stats] li`).first().locator("span").first();

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the server sends the final numbers, so they are right without JavaScript", async ({ request }) => {
    const html = await (await request.get(NEXT_URL)).text();
    expect(html).toMatch(/>16<!-- -->\+<\/span>/);
    expect(html).toContain("Years in Toronto");
    expect(html).toContain("Toronto’s cosmetic");
  });

  test("elements appear as they scroll into view", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1200);
    const heading = page.locator("#approach");
    await expect(heading).not.toHaveClass(/\bin\b/);
    expect(await heading.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    await heading.scrollIntoViewIfNeeded();
    await scrollBy(page, 200);
    await expect(heading).toHaveClass(/\bin\b/);
    await expect.poll(() => heading.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test("the statement lights up word by word with the scroll", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1200);
    const words = page.locator(`${SECTION} [data-w]`);
    const lit = () => words.evaluateAll((els) => els.filter((e) => parseFloat((e as HTMLElement).style.opacity) === 1).length);
    expect(await words.count()).toBe(28);
    expect(await lit()).toBe(0);
    await page.locator(`${SECTION} [data-about-copy]`).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.7));
    await expect.poll(lit).toBeGreaterThan(3);
    expect(await lit()).toBeLessThan(28);
    await page.locator(`${SECTION} [data-about-copy]`).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 150));
    await expect.poll(lit).toBe(28);
    await expect(words.filter({ hasText: "NewDermaMed" })).toHaveClass(/text-ndm-deep/);
  });

  test("the numbers count up from zero once the stats are on screen", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1200);
    await expect(firstStat(page)).toHaveText("0+");
    await page.locator(`${SECTION} [data-about-stats]`).scrollIntoViewIfNeeded();
    await scrollBy(page, 250);
    await expect(firstStat(page)).toHaveText("16+", { timeout: 6000 });
    await expect(page.locator(`${SECTION} [data-about-stats] li`)).toHaveText([/^16\+Years in Toronto$/, /^8Top Choice Awards$/, /^2Toronto clinics$/, /^20\+Treatment categories$/]);
  });

  test("the photo pairs show, wipe in, and drift against the scroll", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1200);
    const pairs = page.locator(`${SECTION} [data-drift]`);
    await expect(pairs).toHaveCount(2);
    await page.locator(SECTION).evaluate((el: HTMLElement) => window.scrollTo(0, el.offsetTop - 300));
    await expect(pairs.first()).toBeVisible();
    await expect(pairs.first().locator(".rv-clip").first()).toHaveClass(/\bin\b/);
    const drift = () => pairs.first().evaluate((el: HTMLElement) => parseFloat(el.style.translate.split(" ")[1] ?? "0"));
    const before = await drift();
    await scrollBy(page, 400);
    await expect.poll(drift).toBeLessThan(before);
    const loaded = await page.locator(`${SECTION} img`).evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0));
    expect(loaded).toEqual([true, true, true, true, true]); /* the tag's logo mark and four photos */
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test("no photo pairs, no photo downloads, no sideways scroll, no errors", async ({ page }) => {
    const errors: string[] = [];
    const photos: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("request", (r) => {
      if (r.url().includes("/_next/image")) photos.push(r.url());
    });
    await page.goto(NEXT_URL);
    await page.locator(SECTION).scrollIntoViewIfNeeded();
    await scrollBy(page, 500);
    await page.waitForTimeout(1500);
    await expect(page.locator(`${SECTION} [data-drift]`).first()).toBeHidden();
    expect(photos).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("everything is shown at once: no fading, counting or drifting", async ({ page }) => {
    await page.goto(NEXT_URL);
    await page.waitForTimeout(1500);
    await expect(firstStat(page)).toHaveText("16+");
    await expect(page.locator("#approach")).toHaveClass(/\bin\b/);
    const opacities = await page.locator(`${SECTION} [data-w]`).evaluateAll((els) => new Set(els.map((e) => (e as HTMLElement).style.opacity)).size);
    expect(opacities).toBe(1);
    expect(await page.locator(`${SECTION} [data-drift]`).first().evaluate((el: HTMLElement) => el.style.translate)).toBe("");
  });
});
