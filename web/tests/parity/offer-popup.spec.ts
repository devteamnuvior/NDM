import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, VIEWPORTS } from "./helpers";
import { FEATURES } from "../../src/config/features";

test.skip(!FEATURES.offerPopup, "the offer pop-up is switched off (config/features.ts)");

/**
 * First-visit offer parity at every window size: both pages are opened with "?offer", which shows the
 * pop-up after a moment; every element of the dialog is measured and the dialog compared pixel by pixel.
 */
const DIALOG = '[role="dialog"][aria-labelledby="offer-title"]';

for (const vp of VIEWPORTS) {
  test(`offer pop-up parity @ ${vp.name}`, async ({ browser }, testInfo) => {
    const [legacy, next] = await Promise.all([open(browser, "legacy", vp, "?offer"), open(browser, "next", vp, "?offer")]);
    const boxes: { x: number; y: number; width: number; height: number }[] = [];
    for (const p of [legacy, next] as Page[]) {
      await p.waitForSelector(DIALOG, { state: "visible", timeout: 15_000 });
      await p.mouse.move(2, 2);
      await p.waitForTimeout(1200);
      boxes.push((await p.locator(DIALOG).boundingBox())!);
    }
    expect(boxes[1]).toEqual(boxes[0]);
    const d = diff(await fingerprint(legacy, DIALOG), await fingerprint(next, DIALOG));
    report(`${vp.name}-offer-popup`, d);
    expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    const b = boxes[0];
    /* only the dialog card (the page behind shows blurred through the backdrop); its photo is served resized */
    await expectSamePixels(testInfo, `${vp.name}-offer-popup`, legacy, next, { x: Math.ceil(b.x) + 1, y: Math.ceil(b.y) + 1, width: Math.floor(b.width) - 2, height: Math.floor(Math.min(b.height, vp.height - b.y)) - 2 }, 0.01);
    await legacy.context().close();
    await next.context().close();
  });
}
