import { expect, test, type Page } from "@playwright/test";
import { diff, fingerprint } from "./fingerprint";
import { expectSamePixels, open, report, showSection, VIEWPORTS } from "./helpers";

/**
 * Team parity at every window size: the section (every element measured, and a pixel comparison), then
 * a team member's profile dialog opened on both and compared the same way.
 */
const SECTION = 'section[aria-labelledby="team"]';
const DIALOG = '[role="dialog"][aria-labelledby="team-profile-title"]';

for (const vp of VIEWPORTS) {
  test.describe(`team parity @ ${vp.name}`, () => {
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
      expect(a.length).toBeGreaterThan(30);
      const d = diff(a, b);
      report(`${vp.name}-team`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
    });

    test("the section matches pixel by pixel", async ({}, testInfo) => {
      await expectSamePixels(testInfo, `${vp.name}-team`, legacy, next, { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, height) });
    });

    test("the profile dialog matches", async ({}, testInfo) => {
      for (const p of [legacy, next]) {
        await p.locator(`${SECTION} .team-port button`).nth(1).click();
        await p.waitForSelector(`${DIALOG}`, { state: "visible" });
        await p.mouse.move(2, 2);
        await p.waitForTimeout(900);
      }
      const d = diff(await fingerprint(legacy, DIALOG), await fingerprint(next, DIALOG));
      report(`${vp.name}-team-profile`, d);
      expect(d, JSON.stringify(d.slice(0, 12), null, 1)).toEqual([]);
      /* only the dialog card: the page behind it is blurred through the dimmed backdrop, and what lies below
         the team section is not the same on both pages until the following sections are migrated */
      const card = (await next.locator(".team-pop-card").boundingBox())!;
      const same = (await legacy.locator(".team-pop-card").boundingBox())!;
      expect([card.x, card.y, card.width, card.height]).toEqual([same.x, same.y, same.width, same.height]);
      await expectSamePixels(testInfo, `${vp.name}-team-profile`, legacy, next, { x: Math.ceil(card.x), y: Math.ceil(card.y), width: Math.floor(card.width) - 1, height: Math.floor(Math.min(card.height, vp.height - card.y)) - 1 });
    });
  });
}
