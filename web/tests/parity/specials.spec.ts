import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * Monthly specials parity at every window size, in two states: as the wheel rests on its first offer, and
 * turned on by two offers. Every element is measured on both pages and a screenshot compared.
 */
const SECTION = 'section[aria-labelledby="specials"]';

for (const vp of VIEWPORTS) {
  test.describe(`specials parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;
    let height = 0;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
      const [a, b] = [await showSection(legacy, SECTION), await showSection(next, SECTION)];
      expect(b, "section height").toBe(a);
      height = a;
      /* the payment providers' logos come from their own CDNs: wait until they have arrived on both pages */
      for (const p of [legacy, next]) {
        await p
          .waitForFunction((sel) => Array.from(document.querySelectorAll<HTMLImageElement>(`${sel} [aria-label="Payment plan providers"] img`)).every((i) => i.complete), SECTION, { timeout: 20_000 })
          .catch(() => {});
        await p.waitForTimeout(300);
      }
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    const check = async (state: string, testInfo: Parameters<typeof expectSamePixels>[0]) => {
      const d = diff(await fingerprint(legacy, SECTION), await fingerprint(next, SECTION));
      report(`${vp.name}-specials-${state}`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      /* the round card photos are served resized, so their pixels are close, not identical */
      await expectSamePixels(testInfo, `${vp.name}-specials-${state}`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) }, 0.003);
    };

    test("resting on the first offer", async ({}, testInfo) => {
      await check("first", testInfo);
    });

    test("turned on by two offers", async ({}, testInfo) => {
      for (const p of [legacy, next]) {
        const nextBtn = p.locator(SECTION).getByRole("button", { name: "Next offer" });
        await nextBtn.click();
        await nextBtn.click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(900);
      }
      await check("third", testInfo);
    });
  });
}
