import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * "Where would you like to start?" parity, in three states at every window size:
 *   1. as it loads (the Face panel open)
 *   2. another panel opened (Skin)
 *   3. a concern's options card open over the photo (Acne)
 * In each state every visible element is measured on the prototype and on the Next.js build, and a
 * screenshot of the section is compared pixel by pixel.
 */
const SECTION = "#start";

for (const vp of VIEWPORTS) {
  test.describe(`start parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    const check = async (state: string, testInfo: Parameters<typeof expectSamePixels>[0]) => {
      const [a, b] = [await showSection(legacy, SECTION), await showSection(next, SECTION)];
      const fa = await fingerprint(legacy, SECTION);
      const fb = await fingerprint(next, SECTION);
      expect(fa.length).toBeGreaterThan(30);
      const d = diff(fa, fb);
      report(`${vp.name}-start-${state}`, d);
      expect(b, "section height").toBe(a);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      await expectSamePixels(testInfo, `${vp.name}-start-${state}`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, a) });
    };
    const both = async (fn: (p: Page) => Promise<unknown>) => {
      await fn(legacy);
      await fn(next);
    };

    test("as it loads", async ({}, testInfo) => {
      await check("default", testInfo);
    });

    test("another panel opened", async ({}, testInfo) => {
      await both(async (p) => {
        await p.locator("#start .st-p").nth(1).locator("button.st-h").click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(600);
      });
      await check("skin", testInfo);
    });

    test("a concern's options card open", async ({}, testInfo) => {
      /* The card is opened, closed and opened again. The prototype makes room for a card by measuring it,
         but its styling library only writes the card's CSS after the card first appears, so its first
         measurement is of an unstyled card and comes out too small. From the second opening on it measures
         the real card, which is what the new build does every time. */
      await both(async (p) => {
        const chip = p.locator("#start .st-p.is-open .st-chips a").first();
        await chip.click();
        await p.waitForTimeout(600);
        await p.locator("#start .st-o > button").click();
        await p.waitForTimeout(600);
        await chip.click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(800);
      });
      await check("acne-card", testInfo);
    });
  });
}
