import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * Before & after parity at every window size: as it loads (every element measured, pixel comparison),
 * then with one compare slider moved by the keyboard on both pages.
 */
const SECTION = 'section[aria-labelledby="results"]';

for (const vp of VIEWPORTS) {
  test.describe(`before & after parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;
    let height = 0;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
      const [a, b] = [await showSection(legacy, SECTION), await showSection(next, SECTION)];
      expect(b, "section height").toBe(a);
      height = a;
      /* settle the arrows (the prototype measures them before its styles exist) */
      for (const p of [legacy, next]) {
        await p.locator(`${SECTION} ul`).first().evaluate((r) => r.dispatchEvent(new Event("scroll")));
        await p.waitForTimeout(400);
      }
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    const check = async (state: string, testInfo: Parameters<typeof expectSamePixels>[0]) => {
      const d = diff(await fingerprint(legacy, SECTION), await fingerprint(next, SECTION));
      report(`${vp.name}-before-after-${state}`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      await expectSamePixels(testInfo, `${vp.name}-before-after-${state}`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) });
    };

    test("as it loads", async ({}, testInfo) => {
      await check("default", testInfo);
    });

    test("a slider moved", async ({}, testInfo) => {
      for (const p of [legacy, next]) {
        const slider = p.locator(`${SECTION} input[type=range]`).first();
        await slider.focus();
        for (let k = 0; k < 9; k++) await p.keyboard.press("ArrowLeft");
        await p.keyboard.press("Shift+ArrowLeft");
        await p.waitForTimeout(700);
      }
      await check("moved", testInfo);
    });
  });
}
