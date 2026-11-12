import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * Aptos section parity at every window size: every visible element is measured on the prototype and on
 * the Next.js build, and two screenshots are compared pixel by pixel (the top of the section with the
 * figure and dials, then the treatment-area photos).
 */
const SECTION = 'section[aria-labelledby="aptos"]';

for (const vp of VIEWPORTS) {
  test.describe(`aptos section parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;
    let height = 0;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
      const [a, b] = [await showSection(legacy, SECTION), await showSection(next, SECTION)];
      expect(b, "section height").toBe(a);
      height = a;
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    test("every element matches", async () => {
      const a = await fingerprint(legacy, SECTION);
      const b = await fingerprint(next, SECTION);
      expect(a.length).toBeGreaterThan(60);
      const d = diff(a, b);
      report(`${vp.name}-aptos-care`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    });

    test("the top of the section matches pixel by pixel", async ({}, testInfo) => {
      await expectSamePixels(testInfo, `${vp.name}-aptos-care-top`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) });
    });

    test("the treatment areas match pixel by pixel", async ({}, testInfo) => {
      for (const p of [legacy, next]) {
        await p.evaluate((sel) => {
          const el = document.querySelector(sel) as HTMLElement;
          window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight);
        }, SECTION);
        await p.waitForFunction((sel) => Array.from(document.querySelectorAll<HTMLImageElement>(`${sel} figure img`)).every((i) => { const r = i.getBoundingClientRect(); return r.right < 0 || r.left > innerWidth || (i.complete && i.naturalWidth > 0); }), SECTION, { timeout: 30_000 });
        await p.waitForTimeout(900);
      }
      /* the last screenful of the section, clear of the fixed header */
      await expectSamePixels(testInfo, `${vp.name}-aptos-care-areas`, legacy, next, { x: 0, y: 130, width: vp.width, height: vp.height - 130 });
    });
  });
}
