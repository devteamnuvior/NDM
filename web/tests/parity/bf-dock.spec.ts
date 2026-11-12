import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";

/**
 * Black Friday tab parity at every window size (both pages read the same fixed date): the tab at the
 * bottom of the window, then the open panel with its countdown. Every element is measured and both are
 * compared pixel by pixel.
 */
for (const vp of VIEWPORTS) {
  test(`Black Friday tab parity @ ${vp.name}`, async ({ browser }, testInfo) => {
    const [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    const both = async (fn: (p: Page) => Promise<unknown>) => {
      await fn(legacy);
      await fn(next);
    };
    const check = async (state: string, root: string) => {
      const a = await fingerprint(legacy, root);
      const d = diff(a, await fingerprint(next, root));
      report(`${vp.name}-bf-${state}`, d);
      expect(a.length, state).toBeGreaterThan(3);
      expect(d, `${state}: ${JSON.stringify(d.slice(0, 10), null, 1)}`).toEqual([]);
      const b = (await next.locator(root).boundingBox())!;
      expect(b, `${state} box`).toEqual((await legacy.locator(root).boundingBox())!);
      await expectSamePixels(testInfo, `${vp.name}-bf-${state}`, legacy, next, { x: Math.max(0, Math.ceil(b.x)), y: Math.ceil(b.y), width: Math.min(vp.width, Math.floor(b.width)), height: Math.floor(Math.min(b.height, vp.height - b.y)) }, 0.002);
    };

    await both((p) => p.waitForSelector("button.bfd-tab.is-on", { timeout: 20_000 }));
    await both((p) => p.waitForTimeout(900));
    await check("tab", "button.bfd-tab");

    await both(async (p) => {
      await p.locator("button.bfd-tab").click();
      await p.mouse.move(2, 2);
      await p.waitForTimeout(1200);
    });
    await check("panel", "#bfd-panel");

    await legacy.context().close();
    await next.context().close();
  });
}
