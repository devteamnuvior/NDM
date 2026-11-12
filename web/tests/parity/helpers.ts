import { expect, type Browser, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { LEGACY_URL, NEXT_URL } from "../../playwright.config";
import type { Difference } from "./fingerprint";

export const SHOTS = "test-results/parity";

export const VIEWPORTS = [
  { name: "phone-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
] as const;

export type Site = "legacy" | "next";

/** Opens the home page of the prototype or of the Next.js build, settled and ready to measure. */
/** A page's address on each site; the home page when left out. */
export interface PagePaths {
  legacy: string;
  next: string;
  /** Changes the prototype page's HTML before it loads, for content that was deliberately changed since (said where it is used). */
  legacyHtml?: (html: string) => string;
}
const HOME: PagePaths = { legacy: "/index.html", next: "/" };

export async function open(browser: Browser, site: Site, vp: { width: number; height: number }, query = "", paths: PagePaths = HOME): Promise<Page> {
  /* reduced motion stops the announcement ticker, the film and entrance animations, so both pages hold still */
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: "reduce", deviceScaleFactor: 1 });
  /* the chat's "Hi, how can I help?" note pops up 4.5 s after load, once per visit: marked as already seen,
     so it cannot appear on one page and not yet on the other while they are compared */
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("ndm-chat-note", "closed");
    } catch {
      /* storage blocked */
    }
  });
  const page = await ctx.newPage();
  /* one fixed date and time for both pages, so the Black Friday countdown and the booking calendar's
     "today" are the same on both (timers still run; only the clock's reading is fixed) */
  await page.clock.setFixedTime(new Date("2026-11-16T15:00:00-05:00"));
  const rewrite = site === "legacy" ? paths.legacyHtml : undefined;
  if (rewrite) {
    await page.route(`${LEGACY_URL}${paths.legacy}*`, async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: rewrite(await response.text()) });
    });
  }
  await page.goto(site === "legacy" ? `${LEGACY_URL}${paths.legacy}${query}` : `${NEXT_URL}${paths.next}${query}`);
  await page.waitForSelector("header nav, header button", { state: "attached", timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  if (site === "legacy" && !query.includes("offer")) {
    /* the new site never shows the first-visit offer to an automated browser (a test asks for it with "?offer") */
    await page.addStyleTag({ content: ".offer-pop-root{display:none!important}" });
  }
  await page.waitForTimeout(1800); /* the header's own tone probes run at 50, 500 and 1500 ms */
  return page;
}

export function report(name: string, d: Difference[]): void {
  mkdirSync(SHOTS, { recursive: true });
  writeFileSync(`${SHOTS}/${name}.diff.json`, JSON.stringify(d, null, 2));
}

export async function shot(page: Page, name: string, clip?: { x: number; y: number; width: number; height: number }): Promise<Buffer> {
  mkdirSync(SHOTS, { recursive: true });
  return page.screenshot({ path: `${SHOTS}/${name}.png`, clip, animations: "disabled" });
}

/** Scrolls a section to the top of the window, waits for its images, and returns the section's height. */
export async function showSection(page: Page, selector: string): Promise<number> {
  const height = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    return el.offsetHeight;
  }, selector);
  await page.waitForFunction(
    /* only the images on screen: lazy ones further along a carousel or below the fold never load */
    (sel) =>
      Array.from(document.querySelectorAll<HTMLImageElement>(`${sel} img`)).every((i) => {
        const r = i.getBoundingClientRect();
        const onScreen = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
        return !onScreen || (i.complete && i.naturalWidth > 0);
      }),
    selector,
    { timeout: 20_000 },
  );
  await page.waitForTimeout(900);
  return height;
}

/**
 * Pixel comparison: the prototype's screenshot becomes the reference the Next.js screenshot is held to.
 * @param maxDiffPixelRatio share of pixels allowed to differ (0.001 = one in a thousand)
 */
export async function expectSamePixels(testInfo: TestInfo, name: string, legacy: Page, next: Page, clip: { x: number; y: number; width: number; height: number }, maxDiffPixelRatio = 0.001): Promise<void> {
  const original = await shot(legacy, `${name}-legacy`, clip);
  const migrated = await shot(next, `${name}-next`, clip);
  const reference = testInfo.snapshotPath(`${name}.png`);
  mkdirSync(dirname(reference), { recursive: true });
  writeFileSync(reference, original);
  expect(migrated).toMatchSnapshot(`${name}.png`, { maxDiffPixelRatio });
}
