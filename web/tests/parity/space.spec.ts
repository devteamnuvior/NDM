import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/** Inside our clinics parity at every window size: every element measured, and a pixel comparison. */
const SECTION = 'section[aria-labelledby="space"]';

for (const vp of VIEWPORTS) {
  test.describe(`clinic film parity @ ${vp.name}`, () => {
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
      expect(a.length).toBeGreaterThan(10);
      const d = diff(a, b);
      report(`${vp.name}-space`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    });

    test("the section matches pixel by pixel", async ({}, testInfo) => {
      await expectSamePixels(testInfo, `${vp.name}-space`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) });
    });
  });
}
