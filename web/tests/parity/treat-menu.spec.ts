import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * "Treatments, by what they do" parity, in three states at every window size: as it loads (All tab),
 * another category picked (Skin), and the rail moved on by one card. In each state every visible element
 * is measured on the prototype and on the Next.js build, and a screenshot is compared pixel by pixel.
 */
const SECTION = "#treatments";

for (const vp of VIEWPORTS) {
  test.describe(`treatments parity @ ${vp.name}`, () => {
    let legacy: Page;
    let next: Page;

    test.beforeAll(async ({ browser }) => {
      [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    });
    test.afterAll(async () => {
      await legacy?.context().close();
      await next?.context().close();
    });

    const both = async (fn: (p: Page) => Promise<unknown>) => {
      await fn(legacy);
      await fn(next);
    };
    const check = async (state: string, testInfo: Parameters<typeof expectSamePixels>[0]) => {
      const [a, b] = [await showSection(legacy, SECTION), await showSection(next, SECTION)];
      const fa = await fingerprint(legacy, SECTION);
      const fb = await fingerprint(next, SECTION);
      expect(fa.length).toBeGreaterThan(30);
      const d = diff(fa, fb);
      report(`${vp.name}-treatments-${state}`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      expect(b, "section height").toBe(a);
      await expectSamePixels(testInfo, `${vp.name}-treatments-${state}`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, a) });
    };

    test("as it loads", async ({}, testInfo) => {
      /* The prototype decides which arrows to show before its styles exist, so its "next" arrow stays
         hidden until the rail is first scrolled; the new build has it right from the start. A scroll
         event with no movement puts both in the settled state. */
      await both(async (p) => {
        await p.locator("#tm-panel").evaluate((r) => r.dispatchEvent(new Event("scroll")));
        await p.waitForTimeout(400);
      });
      await check("all", testInfo);
    });

    test("another category picked", async ({}, testInfo) => {
      await both(async (p) => {
        await p.locator("#treatments").getByRole("tab", { name: "Skin", exact: true }).click();
        await p.mouse.move(2, 2);
        await p.waitForTimeout(700);
      });
      await check("skin", testInfo);
    });

    test("the rail moved on by one card", async ({}, testInfo) => {
      await both(async (p) => {
        await p.locator("#tm-panel").evaluate((r: HTMLElement) => {
          const card = r.querySelector("article") as HTMLElement;
          r.scrollBy({ left: card.offsetWidth + 16, behavior: "auto" });
        });
        await p.waitForTimeout(700);
      });
      await check("moved", testInfo);
    });
  });
}
