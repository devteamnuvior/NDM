import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";

/**
 * Booking pop-up parity at every window size: opened from the header's booking button on the prototype
 * and on the Next.js build, every element of the dialog measured, and the dialog compared pixel by pixel.
 */
const DIALOG = '[role="dialog"][aria-labelledby="book-pop-title"]';

for (const vp of VIEWPORTS) {
  test(`booking pop-up parity @ ${vp.name}`, async ({ browser }, testInfo) => {
    const [legacy, next] = await Promise.all([open(browser, "legacy", vp), open(browser, "next", vp)]);
    const boxes: { x: number; y: number; width: number; height: number }[] = [];
    for (const p of [legacy, next] as Page[]) {
      await p.locator("header").getByRole("link", { name: /^Book/ }).first().click();
      await p.waitForSelector(`${DIALOG} form`, { state: "visible" });
      await p.mouse.move(2, 2);
      await p.waitForTimeout(900);
      boxes.push((await p.locator(DIALOG).boundingBox())!);
    }
    expect(boxes[1]).toEqual(boxes[0]);
    const d = diff(await fingerprint(legacy, DIALOG), await fingerprint(next, DIALOG));
    report(`${vp.name}-book-popup`, d);
    expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    const b = boxes[0];
    /* only the dialog card: the page behind it shows blurred through the dimmed backdrop */
    await expectSamePixels(testInfo, `${vp.name}-book-popup`, legacy, next, { x: Math.ceil(b.x) + 1, y: Math.ceil(b.y) + 1, width: Math.floor(b.width) - 2, height: Math.floor(Math.min(b.height, vp.height - b.y)) - 2 }, 0.002);
    await legacy.context().close();
    await next.context().close();
  });
}
