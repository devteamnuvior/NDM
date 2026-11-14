import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { diff, fingerprint } from "./fingerprint";
import { open, report, shot, VIEWPORTS } from "./helpers";

/**
 * About NewDermaMed parity. At every window size the section is scrolled to the top of the window on
 * the prototype and on the Next.js build, then:
 *   1. every visible element is measured on both (position, size, font, colours, spacing);
 *   2. a screenshot of the section is compared pixel by pixel.
 */
const SECTION = 'section[aria-labelledby="approach"]';

async function showSection(page: Page): Promise<number> {
  const height = await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement;
    window.scrollTo(0, el.offsetTop);
    return el.offsetHeight;
  }, SECTION);
  /* the photos load lazily: wait until every one in the section has arrived */
  await page.waitForFunction((sel) => Array.from(document.querySelectorAll<HTMLImageElement>(`${sel} img`)).every((i) => i.offsetParent === null || (i.complete && i.naturalWidth > 0)), SECTION, { timeout: 20_000 });
  await page.waitForTimeout(900);
  return height;
}

for (const vp of VIEWPORTS) {
  test.describe(`about parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;
    let height = 0;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
      const [a, b] = [await showSection(legacy), await showSection(next)];
      expect(b).toBe(a);
      height = a;
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    test("every element matches", async () => {
      const a = await fingerprint(legacy, SECTION);
      const b = await fingerprint(next, SECTION);
      expect(a.length).toBeGreaterThan(50);
      const d = diff(a, b);
      report(`${vp.name}-about`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    });

    test("the section matches pixel by pixel", async ({}, testInfo) => {
      const name = `${vp.name}-about.png`;
      const clip = { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) };
      const original = await shot(legacy, `${vp.name}-about-legacy`, clip);
      const migrated = await shot(next, `${vp.name}-about-next`, clip);
      const reference = testInfo.snapshotPath(name);
      mkdirSync(dirname(reference), { recursive: true });
      writeFileSync(reference, original);
      /* the photos are served resized by the image optimizer, so their pixels are close, not identical */
      expect(migrated).toMatchSnapshot(name, { maxDiffPixelRatio: vp.width >= 1280 ? 0.01 : 0.001 });
    });
  });
}
