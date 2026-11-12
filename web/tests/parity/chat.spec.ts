import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";

/**
 * Chat assistant parity at every window size: the launcher, then the open panel as it greets, then after
 * a ready-made question has been answered. Every element is measured and the panel compared pixel by pixel.
 */
const PANEL = "#chat-panel";
const LAUNCH = "button.chat-launch";

for (const vp of VIEWPORTS) {
  test(`chat parity @ ${vp.name}`, async ({ browser }, testInfo) => {
    const [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    const both = async (fn: (p: Page) => Promise<unknown>) => {
      await fn(legacy);
      await fn(next);
    };
    const check = async (state: string, root: string, pixels: boolean) => {
      const d = diff(await fingerprint(legacy, root), await fingerprint(next, root));
      report(`${vp.name}-chat-${state}`, d);
      expect(d, `${state}: ${JSON.stringify(d.slice(0, 10), null, 1)}`).toEqual([]);
      if (!pixels) return;
      const b = (await next.locator(root).boundingBox())!;
      const same = (await legacy.locator(root).boundingBox())!;
      expect(b, `${state} box`).toEqual(same);
      await expectSamePixels(testInfo, `${vp.name}-chat-${state}`, legacy, next, { x: Math.ceil(b.x) + 1, y: Math.ceil(b.y) + 1, width: Math.floor(b.width) - 2, height: Math.floor(b.height) - 2 }, 0.002);
    };

    await both((p) => p.waitForSelector(LAUNCH, { state: "visible", timeout: 20_000 }));
    await both((p) => p.waitForTimeout(700));
    await check("launcher", LAUNCH, true);

    await both(async (p) => {
      await p.locator(LAUNCH).click();
      await p.mouse.move(2, 2);
      await p.waitForTimeout(900);
    });
    await check("greeting", PANEL, true);

    await both(async (p) => {
      await p.locator(PANEL).getByRole("button", { name: "Where are your clinics?" }).click();
      await p.mouse.move(2, 2);
      await p.waitForTimeout(900);
    });
    await check("answered", PANEL, true);

    await legacy.context().close();
    await next.context().close();
  });
}
